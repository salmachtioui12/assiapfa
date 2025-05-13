package com.example.einternmatchback.messagerie.repository;

import com.example.einternmatchback.messagerie.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientIdAndIsReadFalse(Integer recipientId);

    List<Notification> findByRecipientIdOrderByLastMessageTimeDesc(Integer recipientId);

    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.recipientId = :userId AND n.isRead = false")
    void markAllAsRead(@Param("userId") Integer userId);

    List<Notification> findByRecipientIdAndSenderIdAndIsReadFalse(Integer recipientId, Integer senderId);

    @Query("SELECT n FROM Notification n WHERE n.recipientId = :userId ORDER BY n.lastMessageTime DESC")
    List<Notification> findUserNotifications(@Param("userId") Integer userId);

    @Query("SELECT n FROM Notification n JOIN FETCH User u ON n.senderId = u.id WHERE n.recipientId = :userId AND n.isRead = false ORDER BY n.lastMessageTime DESC")
    List<Notification> findUnreadNotificationsWithSenderDetails(@Param("userId") Integer userId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Notification n WHERE n.messageId = :messageId")
    void deleteByMessageId(@Param("messageId") Long messageId);

    @Query("SELECT n FROM Notification n WHERE n.senderId = :senderId AND n.recipientId = :recipientId")
    List<Notification> findByRecipientIdAndSenderId(@Param("recipientId") Integer recipientId,
                                                    @Param("senderId") Integer senderId);

    Optional<Notification> findByMessageId(Long messageId);
}