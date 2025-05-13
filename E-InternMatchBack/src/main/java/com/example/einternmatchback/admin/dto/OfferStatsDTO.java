package com.example.einternmatchback.admin.dto;

import lombok.Data;

import java.util.Map;

@Data
public class OfferStatsDTO {
    private Long totalOffers;
    private Long activeOffers;
    private Long inactiveOffers;
    private Map<String, Long> offersByType;
    private Map<String, Long> offersByLocation;
    private Map<String, Long> offersCreatedByPeriod; // day/week/month -> count
}
