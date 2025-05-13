package com.example.einternmatchback.Postulation.Services;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendDecisionEmail(String studentEmail, String firstname, String decision,  String offerTitle, String companyName) {
        String subject = "Résultat de votre candidature : " + offerTitle;
        String text = decision.equalsIgnoreCase("accept")
                ? "Bonjour " + firstname + ",\n\n"
                + "Félicitations, vous avez été accepté(e) pour l'offre \"" + offerTitle + "\" chez " + companyName + " !\n\n"
                + "Nous vous contacterons prochainement pour les étapes suivantes.\n\n"
                + "Cordialement,\nL’équipe de recrutement " + companyName
                : "Bonjour " + firstname + ",\n\n"
                + "Nous regrettons de vous informer que votre candidature à l'offre \"" + offerTitle + "\" chez " + companyName + " a été rejetée.\n\n"
                + "Cordialement,\nL’équipe de recrutement " + companyName;


        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(studentEmail);
        message.setSubject(subject);
        message.setText(text);

        mailSender.send(message);
    }
}

