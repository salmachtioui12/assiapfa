package com.example.einternmatchback.messagerie.Controller;

import com.example.einternmatchback.Authentification.user.User;
import com.example.einternmatchback.Authentification.user.UserRepository;
import com.example.einternmatchback.messagerie.entity.Message;
import com.example.einternmatchback.messagerie.repository.MessageRepository;
import com.example.einternmatchback.messagerie.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import com.example.einternmatchback.messagerie.entity.Notification;

import java.security.Principal;
import java.time.LocalDateTime;

//@RequestMapping("/api/v1")
@Controller
@Transactional
public class ChatController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @MessageMapping("/chat/{receiverId}")
    public void processMessage(@DestinationVariable Integer receiverId,
                               @Payload Message message,
                               Principal principal) {
        if (message.isCompletelyDeleted()) {
            return;
        }

        String email = principal.getName();
        User sender = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé: " + email));

        message.setSenderId(sender.getId());
        message.setReceiverId(receiverId);
        message.setTimestamp(LocalDateTime.now());
        message.setRead(false);
        message.setEdited(false);
        message.setCompletelyDeleted(false);

        Message saved = messageRepository.save(message);

        Notification existingNotification = notificationRepository
                .findByRecipientIdAndSenderId(receiverId, sender.getId())
                .stream()
                .findFirst()
                .orElse(null);

        if (existingNotification != null && !existingNotification.isRead()) {
            existingNotification.setMessageCount(existingNotification.getMessageCount() + 1);
            existingNotification.setLastMessageTime(LocalDateTime.now());
            existingNotification.setMessagePreview(truncateMessage(message.getContent()));
            existingNotification.setMessageId(saved.getId());
        } else {
            Notification notification = new Notification();
            notification.setRecipientId(receiverId);
            notification.setSenderId(sender.getId());
            notification.setSenderName(sender.getFirstname() + " " + sender.getLastname());
            notification.setMessagePreview(truncateMessage(message.getContent()));
            notification.setMessageId(saved.getId());
            existingNotification = notification;
        }

        Notification updatedNotification = notificationRepository.save(existingNotification);

        messagingTemplate.convertAndSend("/topic/messages/" + receiverId, saved);
        messagingTemplate.convertAndSend("/topic/messages/" + sender.getId(), saved);
        messagingTemplate.convertAndSend("/topic/notifications/" + receiverId, updatedNotification);
    }

    private String truncateMessage(String content) {
        return content.length() > 30 ? content.substring(0, 30) + "..." : content;
    }

    @MessageMapping("/chat/{messageId}/delete/{userId}")
    public void deleteMessage(@DestinationVariable Long messageId,
                              @DestinationVariable Integer userId,
                              Principal principal) {
        String email = principal.getName();
        userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé: " + email));

        messageRepository.markAsCompletelyDeleted(messageId);
        notificationRepository.deleteByMessageId(messageId);

        messagingTemplate.convertAndSend("/topic/messages/deleted/" + userId, messageId);
        messagingTemplate.convertAndSend("/topic/notifications/removed/" + userId, messageId);
    }

    @MessageMapping("/chat/{messageId}/edit/{userId}")
    public void editMessage(@DestinationVariable Long messageId,
                            @DestinationVariable Integer userId,
                            @Payload String newContent,
                            Principal principal) {
        String email = principal.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé: " + email));

        messageRepository.updateMessageContent(messageId, user.getId(), newContent);
        Message updatedMessage = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message non trouvé"));

        Notification notification = notificationRepository
                .findByMessageId(messageId)
                .orElse(null);

        if (notification != null) {
            notification.setMessagePreview(truncateMessage(newContent));
            notification.setLastMessageTime(LocalDateTime.now());
            notificationRepository.save(notification);
            messagingTemplate.convertAndSend("/topic/notifications/" + notification.getRecipientId(), notification);
        }

        messagingTemplate.convertAndSend("/topic/messages/update/" + updatedMessage.getSenderId(), updatedMessage);
        messagingTemplate.convertAndSend("/topic/messages/update/" + updatedMessage.getReceiverId(), updatedMessage);
    }
}