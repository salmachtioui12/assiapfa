package com.example.einternmatchback.admin.controller;


import com.example.einternmatchback.Postulation.Services.ApplicationService;
import com.example.einternmatchback.admin.dto.AdminDashboardStatsDTO;
import com.example.einternmatchback.admin.dto.OfferDTO;
import com.example.einternmatchback.admin.dto.UserDTO;
import com.example.einternmatchback.admin.service.AdminDashboardService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/dashboard")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {


    private ApplicationService applicationService;
    private final AdminDashboardService adminDashboardService;
    private static final Logger logger = LoggerFactory.getLogger(AdminDashboardController.class);

    public AdminDashboardController(AdminDashboardService adminDashboardService) {
        this.adminDashboardService = adminDashboardService;
    }

    @GetMapping
    public ResponseEntity<?> getDashboardStats() {
        try {
            AdminDashboardStatsDTO stats = adminDashboardService.getDashboardStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            logger.error("Error in admin dashboard", e);
            return ResponseEntity.internalServerError().body(
                    Map.of(
                            "error", "Internal server error",
                            "message", e.getMessage()
                    )
            );
        }
    }
    // Endpoint pour récupérer la création des utilisateurs par date
    @GetMapping("/users-creation-by-date")
    public Map<LocalDate, Long> getUsersCreationByDate() {
        return adminDashboardService.getUsersCreationByDate();
    }
    // Endpoint pour récupérer la liste des utilisateurs (sans manager)
    @GetMapping("/users-with-managers")
    public List<UserDTO> getUsersWithoutManagers() {
        return adminDashboardService.getUsersWithProfiles();
    }
    @GetMapping("/offers")
    public ResponseEntity<List<OfferDTO>> getAllOffers() {
        List<OfferDTO> offers = adminDashboardService.getAllOffers();
        return ResponseEntity.ok(offers);
    }
    @GetMapping("/applications-by-date")
    public Map<String, Long> getApplicationsByDate() {
        return adminDashboardService.getApplicationsByDate();
    }



}