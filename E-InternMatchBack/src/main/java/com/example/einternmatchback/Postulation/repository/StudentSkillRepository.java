package com.example.einternmatchback.Postulation.repository;


import com.example.einternmatchback.stagiaire.StudentSkill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentSkillRepository extends JpaRepository<StudentSkill, Integer> {
        List<StudentSkill> findByStudentProfile_Id(Integer studentProfileId);
}