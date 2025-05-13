package com.example.einternmatchback.admin.dto;

import lombok.Data;

import java.util.Map;

@Data
public class StudentStatsDTO {
    private Long totalStudents;
    private Long completeProfiles;
    private Long incompleteProfiles;
    private Map<String, Long> studentsByLocation;
    private Double avgSkillsPerStudent;
}