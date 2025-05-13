package com.example.einternmatchback.Postulation.Services;


import com.example.einternmatchback.AjoutOffers.model.Offer;
import com.example.einternmatchback.AjoutOffers.repo.OfferRepository;
import com.example.einternmatchback.Postulation.Entity.Application;
import com.example.einternmatchback.Postulation.Entity.ApplicationStatus;
import com.example.einternmatchback.Postulation.repository.ApplicationRepository;
import com.example.einternmatchback.stagiaire.StudentProfile;
import com.example.einternmatchback.stagiaire.StudentProfileRepository;
import org.springframework.stereotype.Service;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final OfferRepository offerRepository;

    public ApplicationService(ApplicationRepository applicationRepository, StudentProfileRepository studentRepository, OfferRepository offerRepository) {
        this.applicationRepository = applicationRepository;
        this.studentProfileRepository = studentRepository;
        this.offerRepository = offerRepository;
    }

    public Application applyToOffer(Integer studentId, Integer offerId, String cvFilename) {
        if (applicationRepository.existsByStudentIdAndOfferId(studentId, offerId)) {
            throw new IllegalStateException("Étudiant a déjà postulé à cette offre.");
        }

        StudentProfile student = studentProfileRepository.findById(studentId).orElseThrow(() -> new RuntimeException("Étudiant non trouvé"));
        Offer offer = offerRepository.findById(offerId).orElseThrow(() -> new RuntimeException("Offre non trouvée"));

        Application app = new Application();
        app.setStudent(student);
        app.setOffer(offer);
        app.setCvFilename(cvFilename);
        app.setStatus(ApplicationStatus.PENDING);

        return applicationRepository.save(app);
    }
}
