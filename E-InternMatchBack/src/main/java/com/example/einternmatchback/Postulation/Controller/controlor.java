package com.example.einternmatchback.Postulation.Controller;
import com.example.einternmatchback.AjoutOffers.model.Offer;
import com.example.einternmatchback.AjoutOffers.repo.OfferRepository;
import com.example.einternmatchback.Postulation.Services.AIAgent;
import com.example.einternmatchback.Postulation.Services.TOLS;
import com.example.einternmatchback.stagiaire.StudentProfile;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;



@RequestMapping("/api/v1")
@RestController
public class controlor {

    private final AIAgent assistant;
    private final TOLS tools;

    @Autowired
    OfferRepository offerRepository;

    @Autowired
    public controlor(AIAgent assistant, TOLS tools) {
        this.assistant = assistant;
        this.tools = tools;
    }

    @GetMapping("/generate-pdf/{offerID}/{StudentID}")
    public String selection(@PathVariable("StudentID") Integer studentId,
                            @PathVariable("offerID") Integer offerId) {

        Offer offer = tools.getOfferById(offerId);
        offer.getCompany().getName();
        StudentProfile profile = tools.getStudentProfile(studentId);

        System.out.println("Offer title: " + offer.getTitle());
        System.out.println("Company: " + offer.getCompany().getName());
        System.out.println("Student: " + profile.getUser().getFirstname() + " " + profile.getUser().getLastname());
        System.out.println("Skills: " + tools.getStudentSkills(studentId));

        System.out.println("Called /generate-pdf/" + offerId + "/" + studentId);

        String skills = tools.getStudentSkills(studentId).toString();
        String offerSkills = tools.getOfferSkills(offerId).toString();
        String experiences = tools.getStudentExperiences(studentId).toString();


        String prompt = """
                You are an AI assistant specialized in recruitment. Your task is to analyze **all** the "student's skills" and "student's experiences", and **rank them by relevance** to a given internship offer, With the keywords of the job title.
                
                🧠 Rules:
                - **Do not remove** any skill or experience.
                - Rank them **from most to least relevant** based on:
                  - Semantic similarity
                  - Contextual relevance
                  - Synonyms and related terms
                  - Importance for the keywords of the job title
                  - responce may not contains offer data , but it contain only student data
                - Return your answer in **strict JSON format only**, no explanation, no Markdown.
                
                📦 Exact format:
                {
                  "skills": ["skill 1", "skill 2", ...],
                  "experiences": ["experience 1", "experience 2", ...]
                }
                
                do exactly as this this Example logique :
                ---
                Student's skills:
                ["Political analysis", "Public speaking", "Policy writing", "genie logiciel", "Leadership", "Diplomacy", "Data analysis", "java"]
                
                Student's experiences:
                ["Public relations for a political campaign", "UI design project using Figma", "Internship in political consultancy"]
                
                Required skills for the offer:
                ["Campaign strategy", "Communication", "Policy analysis"]
                
                Expected response:
                {
                  "skills": ["Public speaking", "Leadership", "Political analysis", "Diplomacy", "Policy writing", "Data analysis", "java", "genie logiciel"],
                  "experiences": ["Internship in political consultancy", "Public relations for a political campaign", "UI design project using Figma"]
                }
                
                ---
                Here are the student's skills: %s
                Here are the student's experiences: %s
                Here are the required skills for the offer: %s
                """.formatted(skills, experiences, offerSkills);


        String response = assistant.chat(prompt);

        return response;


    }


}
