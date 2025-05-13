package com.example.einternmatchback.Authentification.auth;

import com.example.einternmatchback.AjoutOffers.model.Company;
import com.example.einternmatchback.AjoutOffers.repo.CompanyRepository;
import com.example.einternmatchback.Authentification.config.JwtService;
import com.example.einternmatchback.Authentification.token.Token;
import com.example.einternmatchback.Authentification.token.TokenRepository;
import com.example.einternmatchback.Authentification.token.TokenType;
import com.example.einternmatchback.Authentification.user.*;
import com.example.einternmatchback.stagiaire.StudentProfile;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository repository;
    private final TokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final CompanyRepository companyRepository;


    public AuthenticationResponse register(RegisterRequest request) {
        try {
            // Créer l'utilisateur en fonction du type spécifié
            User user;
            Role role = request.getRole();
            switch (role) {
                case STUDENT -> user = new User();
                case MANAGER -> user = new User();
                case USER -> user = new User();
                case ADMIN -> user = new Admin();
                default -> throw new IllegalArgumentException("Unsupported role: " + role);
            }


            // Assigner les champs
            user.setFirstname(request.getFirstname());
            user.setLastname(request.getLastname());
            user.setEmail(request.getEmail());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setRole(role);
            System.out.println(">>> Tentative d'enregistrement de l'utilisateur : " + user);

            var savedUser = repository.save(user);

            Map<String, Object> extraClaims = new HashMap<>();
            extraClaims.put("role", user.getRole().name());
            extraClaims.put("firstname", user.getFirstname());
            extraClaims.put("lastname", user.getLastname());
            extraClaims.put("userId", user.getId());

            var jwtToken = jwtService.generateToken(extraClaims, user);
            //var jwtToken = jwtService.generateToken(user);
            var refreshToken = jwtService.generateRefreshToken(user);
            saveUserToken(savedUser, jwtToken);

            return AuthenticationResponse.builder()
                    .accessToken(jwtToken)
                    .refreshToken(refreshToken)
                    .build();
        } catch (Exception e) {
            System.out.println("!!! ERREUR lors de l'enregistrement : " + e.getMessage());
            e.printStackTrace(); // Stack trace complète dans les logs
            throw e; // Ou éventuellement renvoyer une réponse 500 propre
        }
    }


    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
        } catch (BadCredentialsException e) {
            System.out.println("Échec de l'authentification: Mauvais identifiants.");
            return null;
        } catch (Exception e) {
            System.out.println("Échec de l'authentification: " + e.getMessage());
            return null;
        }

        var user = repository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        System.out.println("Utilisateur trouvé: " + user.getEmail());
        System.out.println("Mot de passe en base : " + user.getPassword());

        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("role", user.getRole().name());
        extraClaims.put("firstname", user.getFirstname());
        extraClaims.put("lastname", user.getLastname());
        extraClaims.put("userId", user.getId());
        var jwtToken = jwtService.generateToken(extraClaims, user);


        var refreshToken = jwtService.generateRefreshToken(user);
        revokeAllUserTokens(user);
        saveUserToken(user, jwtToken);
        return AuthenticationResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .build();
    }



    private void saveUserToken(User user, String jwtToken) {
        // Vérifie si le token existe déjà
        if (tokenRepository.findByToken(jwtToken).isEmpty()) {
            var token = Token.builder()
                    .user(user)
                    .token(jwtToken)
                    .tokenType(TokenType.BEARER)
                    .expired(false)
                    .revoked(false)
                    .build();
            tokenRepository.save(token);
        } else {
            System.out.println("⚠️ Token déjà présent dans la base. Insertion ignorée.");
        }
    }

    private void revokeAllUserTokens(User user) {
        var validUserTokens = tokenRepository.findAllValidTokenByUser(user.getId());
        if (validUserTokens.isEmpty())
            return;
        validUserTokens.forEach(token -> {
            token.setExpired(true);
            token.setRevoked(true);
        });
        tokenRepository.saveAll(validUserTokens);
    }

    public ResponseEntity<AuthenticationResponse> refreshToken(HttpServletRequest request) {
        final String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        final String refreshToken;
        final String userEmail;

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        refreshToken = authHeader.substring(7);

        try {
            userEmail = jwtService.extractUsername(refreshToken);
        } catch (ExpiredJwtException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        if (userEmail != null) {
            var user = this.repository.findByEmail(userEmail)
                    .orElseThrow();

            if (jwtService.isTokenValid(refreshToken, user)) {
                var newAccessToken = jwtService.generateToken(user);
                var newRefreshToken = jwtService.generateRefreshToken(user); // ✅ GÉNÈRE un NOUVEAU refreshToken

                revokeAllUserTokens(user); // ❌ révoque tous les anciens tokens
                saveUserToken(user, newAccessToken); // ✅ Sauve access token (si tu as aussi une méthode pour refresh, ajoute-le ici)
                saveUserToken(user, newRefreshToken);
                AuthenticationResponse authResponse = AuthenticationResponse.builder()
                        .accessToken(newAccessToken)
                        .refreshToken(newRefreshToken)
                        .build();

                return ResponseEntity.ok(authResponse);
            }
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    public AuthenticationResponse authenticateWithGoogle(String idToken) {
        String email = getEmailFromGoogleToken(idToken);

        if (email == null) {
            throw new UsernameNotFoundException("Failed to extract email from Google token.");
        }

        User user = repository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("role", user.getRole().name());
        extraClaims.put("firstname", user.getFirstname());
        extraClaims.put("lastname", user.getLastname());
        extraClaims.put("userId", user.getId());

        var jwtToken = jwtService.generateToken(extraClaims, user);
        var refreshToken = jwtService.generateRefreshToken(user);
        revokeAllUserTokens(user);
        saveUserToken(user, jwtToken);

        return AuthenticationResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .build();
    }



    public String getEmailFromGoogleToken(String idTokenString) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new JacksonFactory())
                    .setAudience(Collections.singletonList("12030874472-fk8qrfa64n3442orkv28moqolng600v6.apps.googleusercontent.com"))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);

            if (idToken != null) {
                GoogleIdToken.Payload payload = idToken.getPayload();
                return payload.getEmail(); // <-- le plus important
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return null;
    }
}