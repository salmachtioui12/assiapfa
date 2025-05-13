package com.example.einternmatchback.dashboard.dto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OfferStatsDTO {
    private String title;
    private Long applicationCount;
}