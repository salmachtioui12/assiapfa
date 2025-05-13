package com.example.einternmatchback.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {
    private Long totalOffers;
    private Long activeOffers;
    private Long totalApplications;
    private Long pendingApplications;
    private Long acceptedApplications;
    private Long rejectedApplications;
    private Double acceptanceRate;
    private Long totalFavorites;
    private List<OfferStatsDTO> topOffers;
    private Map<String, Long> applicationsByStatus;
    private Map<String, Long> offersByType;
    private Map<String, Long> applicationsOverTime;
    private Map<String, Long> candidatesByField;
    private List<RecentActivityDTO> recentActivities;
}

