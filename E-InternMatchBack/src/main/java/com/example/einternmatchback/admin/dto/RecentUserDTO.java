package com.example.einternmatchback.admin.dto;

import com.example.einternmatchback.Authentification.user.Role;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class RecentUserDTO {
    private String name;
    private String email;
    private Role role;
    private LocalDateTime createdAt;
}