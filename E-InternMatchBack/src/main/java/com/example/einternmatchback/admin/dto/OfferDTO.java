package com.example.einternmatchback.admin.dto;


import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class OfferDTO {
    private Integer id;
    private String title;
    private String description;
    private String type;
    private String location;
    private String companyName;
    private boolean active;
    private LocalDateTime createdAt;
}
