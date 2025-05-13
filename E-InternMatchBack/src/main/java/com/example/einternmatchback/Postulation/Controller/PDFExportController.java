package com.example.einternmatchback.Postulation.Controller;

import com.example.einternmatchback.Postulation.Services.PDFGeneratorService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.Date;

@RestController

@RequestMapping("/api/v1/pdf")

//@RequestMapping("/pdf")
public class PDFExportController {

    private final PDFGeneratorService pdfGeneratorService;
    private final controlor assistantController;

    // Injection des dépendances
    public PDFExportController(PDFGeneratorService pdfGeneratorService, controlor assistantController) {
        this.pdfGeneratorService = pdfGeneratorService;
        this.assistantController = assistantController;
    }

    @GetMapping("/generate/{studentId}/{offerId}")
    public void generatePDF(@PathVariable Integer studentId, @PathVariable Integer offerId, HttpServletResponse response) throws IOException {
        String jsonFiltered = assistantController.selection(studentId, offerId);

        System.out.println("Réponse de l'assistant IA : " + jsonFiltered);

        response.setContentType("application/pdf");
        String currentDateTime = new SimpleDateFormat("yyyy-MM-dd_HH:mm:ss").format(new Date());
        String headerKey = "Content-Disposition";
        String headerValue = "attachment; filename=cv_" + currentDateTime + ".pdf";
        response.setHeader(headerKey, headerValue);

        pdfGeneratorService.exportCvWithFilteredData(studentId, offerId, jsonFiltered, response);
    }

    @GetMapping("/generate-and-store/{studentId}/{offerId}")
    public ResponseEntity<String> generateAndStorePdf(
            @PathVariable Integer studentId,
            @PathVariable Integer offerId
    ) throws IOException {
        String jsonFiltered = assistantController.selection(studentId, offerId);

        String filename = pdfGeneratorService.generateAndStoreCv(studentId, offerId, jsonFiltered);

        // Créer un lien de téléchargement
        String downloadUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/pdf/download/")
                .path(filename)
                .toUriString();

        return ResponseEntity.ok(downloadUrl);
    }

    @GetMapping("/download/{filename:.+}")
    public void downloadPdf(@PathVariable String filename, HttpServletResponse response) throws IOException {
        Path filePath = Paths.get("cv/").resolve(filename);
        if (Files.exists(filePath)) {
            response.setContentType("application/pdf");
            //response.setHeader("Content-Disposition", "attachment; filename=\"" + filename + "\"");
            response.setHeader("Content-Disposition", "inline; filename=\"" + filename + "\"");
            Files.copy(filePath, response.getOutputStream());
            response.getOutputStream().flush();
        } else {
            response.sendError(HttpServletResponse.SC_NOT_FOUND, "Fichier introuvable");
        }
    }



}
