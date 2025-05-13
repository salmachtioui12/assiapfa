package com.example.einternmatchback.dashboard.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecentActivityDTO {
    private String activityType; // "OFFER_CREATED", "APPLICATION_RECEIVED", "APPLICATION_STATUS_CHANGED"
    private String description;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime timestamp;
    private Long relatedId; // Changé de Integer à Long
    private String relatedEntityType; // "OFFER", "APPLICATION"
}