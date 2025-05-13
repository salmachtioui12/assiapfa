package com.example.einternmatchback.admin.dto;

import com.example.einternmatchback.Authentification.user.Role;
import lombok.Data;

import java.util.Map;

@Data
public class UserStatsDTO {
    private Long totalUsers;
    private Map<Role, Long> usersByRole;
    private Long newUsersToday;
    private Long newUsersThisWeek;
    private Long newUsersThisMonth;
    private Double growthRate;
}