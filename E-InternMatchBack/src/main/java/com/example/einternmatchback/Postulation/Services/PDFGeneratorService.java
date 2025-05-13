package com.example.einternmatchback.Postulation.Services;


import com.example.einternmatchback.AjoutOffers.model.Offer;
import com.example.einternmatchback.AjoutOffers.repo.OfferRepository;
import com.example.einternmatchback.Postulation.Controller.controlor;
import com.example.einternmatchback.Postulation.repository.StudentCertificationRepository;
import com.example.einternmatchback.Postulation.repository.StudentEducationRepository;
import com.example.einternmatchback.Postulation.repository.StudentExperienceRepository;
import com.example.einternmatchback.Postulation.repository.StudentSkillRepository;
import com.example.einternmatchback.stagiaire.StudentCertification;
import com.example.einternmatchback.stagiaire.StudentEducation;
import com.example.einternmatchback.stagiaire.StudentProfile;
import com.example.einternmatchback.stagiaire.StudentProfileRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;


@Service
public class PDFGeneratorService {


    @Autowired
    private controlor assistantController; // Pour accéder à la méthode "selection"

    @Autowired
    private final OfferRepository offerRepository;

    private final StudentProfileRepository studentProfileRepository;
    private final StudentSkillRepository studentSkillRepository;
    private final StudentExperienceRepository studentExperienceRepository;
    private final StudentCertificationRepository studentCertificationRepository;
    private final StudentEducationRepository studentEducationRepository;

    public PDFGeneratorService(
            StudentProfileRepository studentProfileRepository,
            StudentSkillRepository studentSkillRepository,
            StudentExperienceRepository studentExperienceRepository,
            StudentCertificationRepository studentCertificationRepository,
            StudentEducationRepository studentEducationRepository,
            OfferRepository offerRepository
    ) {
        this.studentProfileRepository = studentProfileRepository;
        this.studentSkillRepository = studentSkillRepository;
        this.studentExperienceRepository = studentExperienceRepository;
        this.studentCertificationRepository = studentCertificationRepository;
        this.studentEducationRepository = studentEducationRepository;
        this.offerRepository = offerRepository;
    }



        public void exportCvWithFilteredData(Integer studentId, Integer offerId, String jsonFiltered, HttpServletResponse response) throws IOException {
        // Nettoyer le JSON
        jsonFiltered = jsonFiltered.trim();
        if (jsonFiltered.startsWith("```")) {
            jsonFiltered = jsonFiltered.replaceAll("```json", "").replaceAll("```", "").trim();
        }

        List<String> skills = parseSkillsFromJson(jsonFiltered);
        List<String> experiences = parseExperiencesFromJson(jsonFiltered);

        StudentProfile profile = studentProfileRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Profil introuvable"));
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new RuntimeException("Offre introuvable"));

        List<StudentCertification> certifications = studentCertificationRepository.findByStudentProfileId(studentId);
        List<StudentEducation> educations = studentEducationRepository.findByStudentProfileId(studentId);

        // Nom du fichier sécurisé
        String safeTitle = offer.getTitle().replaceAll("[^a-zA-Z0-9]", "_");
        String safeName = profile.getUser().getLastname() + "_" + profile.getUser().getFirstname();
        String filename = safeTitle + "_" + safeName + ".pdf";

        Path dir = Paths.get("cv/");
        Files.createDirectories(dir);
        Path filePath = dir.resolve(filename);

        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, new FileOutputStream(filePath.toFile()));
        document.open();

        // Polices
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
        Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
        Font contentFont = FontFactory.getFont(FontFactory.HELVETICA, 12);


        // En-tête : Nom complet
        Paragraph header = new Paragraph(profile.getUser().getFirstname().toUpperCase() + " " + profile.getUser().getLastname().toUpperCase(), titleFont);
        header.setAlignment(Element.ALIGN_CENTER);
        document.add(header);
        document.add(Chunk.NEWLINE);

        // Coordonnées
        Paragraph contact = new Paragraph();
        contact.setFont(contentFont);
        contact.add("Email : " + profile.getUser().getEmail() + "\n");
        contact.add("Téléphone : " + profile.getPhone() + "\n");
        document.add(contact);
        document.add(Chunk.NEWLINE);

        // Compétences
        document.add(new Paragraph("Compétences", headerFont));
        for (String skill : skills) {
            document.add(new Paragraph("• " + skill, contentFont));
        }
        document.add(Chunk.NEWLINE);

        // Expériences
        document.add(new Paragraph("Expérience Professionnelle", headerFont));
        for (String exp : experiences) {
            document.add(new Paragraph("• " + exp, contentFont));
        }
        document.add(Chunk.NEWLINE);

        // Formations
        document.add(new Paragraph("Formation", headerFont));
        for (StudentEducation edu : educations) {
            String line = edu.getDegree() + " - " + edu.getSchool();
            if (edu.getStartDate() != null && edu.getEndDate() != null) {
                line += " (" + edu.getStartDate().getYear() + " - " + edu.getEndDate().getYear() + ")";
            }
            document.add(new Paragraph("• " + line, contentFont));
        }
        document.add(Chunk.NEWLINE);

        // Certifications
        document.add(new Paragraph("Certifications", headerFont));
        for (StudentCertification cert : certifications) {
            document.add(new Paragraph("• " + cert.getName(), contentFont));
        }

        document.close();
    }

    public String generateAndStoreCv(Integer studentId, Integer offerId, String jsonFiltered) throws IOException {
        jsonFiltered = jsonFiltered.trim();
        if (jsonFiltered.startsWith("```")) {
            jsonFiltered = jsonFiltered.replaceAll("```json", "").replaceAll("```", "").trim();
        }

        List<String> skills = parseSkillsFromJson(jsonFiltered);
        List<String> experiences = parseExperiencesFromJson(jsonFiltered);

        StudentProfile profile = studentProfileRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Profil introuvable"));
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new RuntimeException("Offre introuvable"));

        List<StudentCertification> certifications = studentCertificationRepository.findByStudentProfileId(studentId);
        List<StudentEducation> educations = studentEducationRepository.findByStudentProfileId(studentId);

        // Générer le nom du fichier
        String safeTitle = offer.getTitle().replaceAll("[^a-zA-Z0-9]", "_");
        String safeName = profile.getUser().getLastname() + "_" + profile.getUser().getFirstname();
        String filename = safeTitle + "_" + safeName + ".pdf";

        Path dir = Paths.get("cv/");
        Files.createDirectories(dir);
        Path filePath = dir.resolve(filename);

        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, new FileOutputStream(filePath.toFile()));
        document.open();

        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
        Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
        Font contentFont = FontFactory.getFont(FontFactory.HELVETICA, 12);

        Paragraph header = new Paragraph(profile.getUser().getFirstname().toUpperCase() + " " + profile.getUser().getLastname().toUpperCase(), titleFont);
        header.setAlignment(Element.ALIGN_CENTER);
        document.add(header);
        document.add(Chunk.NEWLINE);

        Paragraph contact = new Paragraph();
        contact.setFont(contentFont);
        contact.add("Email : " + profile.getUser().getEmail() + "\n");
        contact.add("Téléphone : " + profile.getPhone() + "\n");
        document.add(contact);
        document.add(Chunk.NEWLINE);

        document.add(new Paragraph("Compétences", headerFont));
        for (String skill : skills) {
            document.add(new Paragraph("• " + skill, contentFont));
        }
        document.add(Chunk.NEWLINE);

        document.add(new Paragraph("Expérience Professionnelle", headerFont));
        for (String exp : experiences) {
            document.add(new Paragraph("• " + exp, contentFont));
        }
        document.add(Chunk.NEWLINE);

        document.add(new Paragraph("Formation", headerFont));
        for (StudentEducation edu : educations) {
            String line = edu.getDegree() + " - " + edu.getSchool();
            if (edu.getStartDate() != null && edu.getEndDate() != null) {
                line += " (" + edu.getStartDate().getYear() + " - " + edu.getEndDate().getYear() + ")";
            }
            document.add(new Paragraph("• " + line, contentFont));
        }
        document.add(Chunk.NEWLINE);

        document.add(new Paragraph("Certifications", headerFont));
        for (StudentCertification cert : certifications) {
            document.add(new Paragraph("• " + cert.getName(), contentFont));
        }

        document.close();
        return filename;
    }




    private List<String> parseSkillsFromJson(String json) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(json);
            JsonNode skillsNode = rootNode.get("skills");

            if (skillsNode != null && skillsNode.isArray()) {
                List<String> skills = new ArrayList<>();
                for (JsonNode node : skillsNode) {
                    skills.add(node.asText());
                }
                return skills;
            }
        } catch (Exception e) {
            System.err.println("Erreur lors du parsing des compétences : " + e.getMessage());
        }
        return List.of(); // Retour vide en cas d'erreur
    }

    private List<String> parseExperiencesFromJson(String json) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(json);
            JsonNode experiencesNode = rootNode.get("experiences");

            if (experiencesNode != null && experiencesNode.isArray()) {
                List<String> experiences = new ArrayList<>();
                for (JsonNode node : experiencesNode) {
                    experiences.add(node.asText());
                }
                return experiences;
            }
        } catch (Exception e) {
            System.err.println("Erreur lors du parsing des expériences : " + e.getMessage());
        }
        return List.of(); // Retour vide en cas d'erreur
    }


}