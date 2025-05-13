package com.example.einternmatchback.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class RecentCompanyDTO {
    private String name;
    private String sector;
    private LocalDateTime createdAt;
}

