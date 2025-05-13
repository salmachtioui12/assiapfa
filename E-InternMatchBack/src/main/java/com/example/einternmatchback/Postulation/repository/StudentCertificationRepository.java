package com.example.einternmatchback.Postulation.repository;


import com.example.einternmatchback.stagiaire.StudentCertification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentCertificationRepository extends JpaRepository<StudentCertification, Integer> {
    List<StudentCertification> findByStudentProfileId(Integer profileId);
}
