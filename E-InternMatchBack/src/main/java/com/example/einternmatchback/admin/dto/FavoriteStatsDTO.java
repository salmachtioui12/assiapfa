package com.example.einternmatchback.admin.dto;

import lombok.Data;

import java.util.Map;

@Data
public class FavoriteStatsDTO {
    private Long totalFavorites;
    private Map<String, Long> mostFavoritedOffers; // offerTitle -> favoriteCount
}