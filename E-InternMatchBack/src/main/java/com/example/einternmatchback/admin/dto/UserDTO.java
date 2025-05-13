package com.example.einternmatchback.admin.dto;



import java.time.LocalDateTime;

public class UserDTO {

    private String firstname;
    private String lastname;
    private String email;
    private LocalDateTime profileCreatedAt;
    private String role;
    private Integer userId;

    // Constructeurs
    public UserDTO(String firstname, String lastname, String email, LocalDateTime profileCreatedAt, String role, Integer userId ) {
        this.firstname = firstname;
        this.lastname = lastname;
        this.email = email;
        this.profileCreatedAt = profileCreatedAt;
        this.role = role;
        this.userId= userId;

    }

    // Getters et setters
    public String getFirstname() {
        return firstname;
    }

    public void setFirstname(String firstname) {
        this.firstname = firstname;
    }

    public String getLastname() {
        return lastname;
    }

    public void setLastname(String lastname) {
        this.lastname = lastname;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public LocalDateTime getProfileCreatedAt() {
        return profileCreatedAt;
    }

    public void setProfileCreatedAt(LocalDateTime profileCreatedAt) {
        this.profileCreatedAt = profileCreatedAt;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
    public Integer getId() {
        return userId;
    }

    public void setId(Integer userId) {
        this.userId = userId;
    }

}


