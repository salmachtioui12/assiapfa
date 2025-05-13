package com.example.einternmatchback.Postulation.Entity;

import com.example.einternmatchback.AjoutOffers.model.Offer;
import com.example.einternmatchback.stagiaire.StudentProfile;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;


@Data
@Entity
public class Application {
    @Id
    @GeneratedValue
    private Long id;

    @ManyToOne
    private StudentProfile student;

    @ManyToOne
    private Offer offer;

    private String cvFilename;

    @Enumerated(EnumType.STRING)
    private ApplicationStatus status = ApplicationStatus.PENDING;

    private LocalDateTime createdAt = LocalDateTime.now();
}
