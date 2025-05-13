package com.example.einternmatchback.admin.dto;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
@Data
@AllArgsConstructor
public class RecentOfferDTO {
    private String title;
    private String companyName;
    private LocalDateTime createdAt;
}