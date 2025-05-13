package com.example.einternmatchback.admin.dto;

import lombok.Data;



import java.util.Map;

@Data
public class AdminDashboardStatsDTO {
    private UserStatsDTO userStats;
    private CompanyStatsDTO companyStats;
    private OfferStatsDTO offerStats;
    private StudentStatsDTO studentStats;
    private ApplicationStatsDTO applicationStats;
    private FavoriteStatsDTO favoriteStats;
    private DocumentStatsDTO documentStats;
    private RecentActivityDTO recentActivity;
}