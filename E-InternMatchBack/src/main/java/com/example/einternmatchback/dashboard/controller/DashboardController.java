package com.example.einternmatchback.dashboard.controller;

import com.example.einternmatchback.dashboard.dto.DashboardStatsDTO;
import com.example.einternmatchback.dashboard.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/company/{companyId}")
    public ResponseEntity<?> getCompanyDashboard(@PathVariable Integer companyId) {
        try {
            DashboardStatsDTO stats = dashboardService.getCompanyDashboardStats(companyId);
            return ResponseEntity.ok(stats);
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getReason());
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Error processing dashboard request: " + e.getMessage());
        }
    }
}