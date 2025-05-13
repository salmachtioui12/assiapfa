package com.example.einternmatchback.admin.dto;

import lombok.Data;

import java.util.Map;

@Data
public class CompanyStatsDTO {
    private Long totalCompanies;
    private Map<String, Long> companiesBySector;
    private Map<String, Long> mostActiveCompanies; // companyName -> offerCount
}
