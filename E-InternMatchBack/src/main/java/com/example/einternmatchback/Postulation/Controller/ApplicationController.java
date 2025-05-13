package com.example.einternmatchback.Postulation.Controller;

import com.example.einternmatchback.Postulation.Entity.Application;
import com.example.einternmatchback.Postulation.Entity.ApplicationRequest;
import com.example.einternmatchback.Postulation.Entity.ApplicationStatus;
import com.example.einternmatchback.Postulation.Services.ApplicationService;
import com.example.einternmatchback.Postulation.Services.EmailService;
import com.example.einternmatchback.Postulation.repository.ApplicationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController

//@RequestMapping("/api/v1")

@RequestMapping("/api/v1/applications")
public class ApplicationController {

    private final ApplicationService applicationService;
    private final ApplicationRepository applicationRepository;
    private final EmailService emailService;  // Injecter le service d'email

    public ApplicationController(ApplicationService applicationService,
                                 ApplicationRepository applicationRepository,
                                 EmailService emailService) {
        this.applicationService = applicationService;
        this.applicationRepository = applicationRepository;
        this.emailService = emailService;
    }

    @PostMapping("/apply")
    public ResponseEntity<String> applyToOffer(@RequestBody ApplicationRequest request) {
        Application app = applicationService.applyToOffer(request.getStudentId(), request.getOfferId(), request.getCvFilename());
        return ResponseEntity.ok("Candidature envoyée avec succès. ID : " + app.getId());
    }

    @GetMapping("/applications/{offerId}")
    public ResponseEntity<List<Application>> listApplications(@PathVariable Integer offerId) {
        return ResponseEntity.ok(applicationRepository.findByOfferId(offerId));
    }

    @PostMapping("/applications/{appId}/accept")
    public ResponseEntity<?> acceptApplication(@PathVariable Long appId) {
        Application app = applicationRepository.findById(appId).orElseThrow();
        app.setStatus(ApplicationStatus.ACCEPTED);
        applicationRepository.save(app);

        // Envoi de l'email de confirmation
        String email = app.getStudent().getUser().getEmail();
        String firstname = app.getStudent().getUser().getFirstname();
        String offerTitle = app.getOffer().getTitle();
        String companyName = app.getOffer().getCompany().getName();

        emailService.sendDecisionEmail(email, firstname, "accept", offerTitle, companyName);

        return ResponseEntity.ok("Candidature acceptée et email envoyé");
    }


    @PostMapping("/applications/{appId}/reject")
    public ResponseEntity<?> rejectApplication(@PathVariable Long appId) {
        Application app = applicationRepository.findById(appId).orElseThrow();
        app.setStatus(ApplicationStatus.REJECTED);
        applicationRepository.save(app);
        return ResponseEntity.ok("Candidature rejetée");
    }

    @GetMapping("/students/{studentId}/applications")
    public ResponseEntity<List<Application>> getStudentApplications(@PathVariable Integer studentId) {
        List<Application> applications = applicationRepository.findByStudentUserId(studentId);
        return ResponseEntity.ok(applications);
    }


}

