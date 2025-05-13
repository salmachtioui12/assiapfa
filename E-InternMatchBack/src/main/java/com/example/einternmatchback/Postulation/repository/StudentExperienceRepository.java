package com.example.einternmatchback.Postulation.repository;


import com.example.einternmatchback.stagiaire.StudentExperience;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentExperienceRepository extends JpaRepository<StudentExperience, Integer> {
    List<StudentExperience> findByStudentProfile_Id(Integer studentProfileId);
}
