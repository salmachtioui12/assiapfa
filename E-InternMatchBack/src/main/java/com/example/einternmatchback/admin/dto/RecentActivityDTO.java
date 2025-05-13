package com.example.einternmatchback.admin.dto;

import lombok.Data;

import java.util.List;

@Data
public class RecentActivityDTO {
    private List<RecentCompanyDTO> recentCompanies;
    private List<RecentOfferDTO> recentOffers;
    private List<RecentApplicationDTO> recentApplications;
    private List<RecentUserDTO> recentUsers;
}