package com.example.einternmatchback.admin.dto;

import com.example.einternmatchback.Postulation.Entity.ApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class RecentApplicationDTO {
    private String studentName;
    private String offerTitle;
    private ApplicationStatus status;
    private LocalDateTime createdAt;
}