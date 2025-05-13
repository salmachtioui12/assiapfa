package com.example.einternmatchback.admin.dto;

import com.example.einternmatchback.Postulation.Entity.ApplicationStatus;
import lombok.Data;

import java.util.Map;



import java.util.Map;

@Data
public class ApplicationStatsDTO {
    private Long totalApplications;
    private Map<ApplicationStatus, Long> applicationsByStatus;
    private Map<String, Long> mostPopularOffers; // offerTitle -> applicationCount
    private Double conversionRate;
}
