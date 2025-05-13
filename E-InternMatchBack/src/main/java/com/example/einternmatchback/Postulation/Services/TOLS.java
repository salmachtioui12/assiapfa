package com.example.einternmatchback.Postulation.Services;

import com.example.einternmatchback.AjoutOffers.model.Offer;
import com.example.einternmatchback.AjoutOffers.repo.OfferRepository;
import com.example.einternmatchback.Postulation.repository.StudentExperienceRepository;
import com.example.einternmatchback.Postulation.repository.StudentSkillRepository;
import com.example.einternmatchback.stagiaire.StudentProfile;
import com.example.einternmatchback.stagiaire.StudentProfileRepository;
import com.example.einternmatchback.stagiaire.StudentSkill;
import dev.langchain4j.agent.tool.Tool;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class TOLS {

    @Autowired
    private StudentSkillRepository studentSkillRepo;

    @Autowired
    private StudentProfileRepository studentProfileRepo;

    @Autowired
    private OfferRepository offerRepo;

    @Autowired
    private StudentExperienceRepository experienceRepo;

    @Tool("Get all skills of a student by ID")
    public List<String> getStudentSkills(Integer studentId) {
        return studentSkillRepo.findByStudentProfile_Id(studentId)
                .stream().map(StudentSkill::getName).collect(Collectors.toList());
    }

    @Tool("Get all required skills of an offer by ID")
    public List<String> getOfferSkills(Integer offerId) {
        Offer offer = offerRepo.findById(offerId).orElseThrow();
        return List.of(offer.getSkillsRequired().split(","));
    }

    @Tool("Get all experiences of a student by ID")
    public List<String> getStudentExperiences(Integer studentId) {
        return experienceRepo.findByStudentProfile_Id(studentId)
                .stream()
                .map(exp -> exp.getTitle() + " at " + exp.getCompany() + ": " + exp.getDescription())
                .collect(Collectors.toList());
    }
    @Tool("Get an offer by ID")
    public Offer getOfferById(Integer offerId) {
        return offerRepo.findById(offerId)
                .orElseThrow(() -> new RuntimeException("Offer not found"));
    }
    @Tool("Get student profile by ID")
    public StudentProfile getStudentProfile(Integer studentId) {
        return studentProfileRepo.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
    }


}
