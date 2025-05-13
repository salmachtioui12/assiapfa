package com.example.einternmatchback.Postulation.repository;


import com.example.einternmatchback.stagiaire.StudentEducation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentEducationRepository extends JpaRepository<StudentEducation, Integer> {
    List<StudentEducation> findByStudentProfileId(Integer profileId);
}
