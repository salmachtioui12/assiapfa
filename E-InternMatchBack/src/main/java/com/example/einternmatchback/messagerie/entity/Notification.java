package com.example.einternmatchback.messagerie.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long messageId;
    private Integer recipientId;
    private Integer senderId;
    private String senderName;
    private String messagePreview;
    private LocalDateTime createdAt = LocalDateTime.now();
    private boolean isRead = false;
    private int messageCount = 1;
    private LocalDateTime lastMessageTime = LocalDateTime.now();
}