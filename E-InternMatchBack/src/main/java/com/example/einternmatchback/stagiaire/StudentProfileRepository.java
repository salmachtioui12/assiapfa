package com.example.einternmatchback.stagiaire;

import com.example.einternmatchback.Authentification.user.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface StudentProfileRepository extends JpaRepository<StudentProfile, Integer> {
    Optional<StudentProfile> findByUserId(Integer userId);
    Optional<StudentProfile> findByUserEmail(String email);
    // Pas besoin de changer l'interface si elle est déjà comme ça
    Optional<StudentProfile> getProfileByUserEmail(String email);
    Optional<StudentProfile> getProfileByUserId(Integer userId);
    //
    @Query("SELECT TO_CHAR(sp.createdAt, 'YYYY-MM-DD') as day, COUNT(sp) as count " +
            "FROM StudentProfile sp GROUP BY TO_CHAR(sp.createdAt, 'YYYY-MM-DD') ORDER BY day")
    List<Map<String, Object>> countStudentRegistrationsOverTime();
    // Méthode pour récupérer un profil étudiant par l'utilisateur
    Optional<StudentProfile> findByUser(User user);


}

