package com.example.einternmatchback.dashboard.repository;

import com.example.einternmatchback.AjoutOffers.model.Offer;
import com.example.einternmatchback.Postulation.Entity.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Map;

public interface DashboardRepository extends JpaRepository<Offer, Integer> {
    // Existing queries
    @Query("SELECT COUNT(o) FROM Offer o WHERE o.company.id = :companyId")
    Long countOffersByCompany(@Param("companyId") Integer companyId);

    @Query("SELECT COUNT(o) FROM Offer o WHERE o.company.id = :companyId AND o.isActive = true")
    Long countActiveOffersByCompany(@Param("companyId") Integer companyId);

    @Query("SELECT COUNT(a) FROM Application a WHERE a.offer.company.id = :companyId")
    Long countApplicationsByCompany(@Param("companyId") Integer companyId);

    @Query("SELECT COUNT(a) FROM Application a WHERE a.offer.company.id = :companyId AND a.status = :status")
    Long countApplicationsByStatusAndCompany(@Param("companyId") Integer companyId, @Param("status") ApplicationStatus status);

    @Query("SELECT a.offer.title as title, COUNT(a) as applicationCount FROM Application a " +
            "WHERE a.offer.company.id = :companyId GROUP BY a.offer ORDER BY applicationCount DESC LIMIT 5")
    List<Map<String, Object>> findTopOffersByApplicationCount(@Param("companyId") Integer companyId);

    @Query("SELECT a.status as status, COUNT(a) as count FROM Application a " +
            "WHERE a.offer.company.id = :companyId GROUP BY a.status")
    List<Map<String, Object>> countApplicationsByStatus(@Param("companyId") Integer companyId);

    @Query("SELECT o.stageType as type, COUNT(o) as count FROM Offer o " +
            "WHERE o.company.id = :companyId GROUP BY o.stageType")
    List<Map<String, Object>> countOffersByType(@Param("companyId") Integer companyId);

    @Query("SELECT TO_CHAR(a.createdAt, 'YYYY-MM-DD') as day, COUNT(a) as count FROM Application a " +
            "WHERE a.offer.company.id = :companyId GROUP BY TO_CHAR(a.createdAt, 'YYYY-MM-DD') ORDER BY TO_CHAR(a.createdAt, 'YYYY-MM-DD')")
    List<Map<String, Object>> countApplicationsOverTime(@Param("companyId") Integer companyId);

    @Query("SELECT e.fieldOfStudy as field, COUNT(DISTINCT a.student) as count " +
            "FROM Application a JOIN StudentEducation e ON a.student.user.id = e.studentProfile.user.id " +
            "WHERE a.offer.company.id = :companyId GROUP BY e.fieldOfStudy")
    List<Map<String, Object>> countCandidatesByField(@Param("companyId") Integer companyId);

    @Query("SELECT COUNT(f) FROM Favoris f WHERE f.offer.company.id = :companyId")
    Long countFavoritesByCompany(@Param("companyId") Integer companyId);

    // New activity queries
    @Query("SELECT 'OFFER_CREATED' as activityType, " +
            "CONCAT('Nouvelle offre publiée: ', o.title) as description, " +
            "o.createdAt as timestamp, CAST(o.id AS long) as relatedId, 'OFFER' as relatedEntityType " +
            "FROM Offer o WHERE o.company.id = :companyId ORDER BY o.createdAt DESC LIMIT 5")
    List<Map<String, Object>> findRecentOfferCreations(@Param("companyId") Integer companyId);

    @Query("SELECT 'APPLICATION_RECEIVED' as activityType, " +
            "CONCAT('Nouvelle candidature reçue pour: ', a.offer.title) as description, " +
            "a.createdAt as timestamp, a.id as relatedId, 'APPLICATION' as relatedEntityType " +
            "FROM Application a WHERE a.offer.company.id = :companyId ORDER BY a.createdAt DESC LIMIT 5")
    List<Map<String, Object>> findRecentApplications(@Param("companyId") Integer companyId);

    @Query("SELECT 'APPLICATION_STATUS_CHANGED' as activityType, " +
            "CONCAT('Statut de candidature modifié (', a.status, ') pour: ', a.offer.title) as description, " +
            "a.createdAt as timestamp, a.id as relatedId, 'APPLICATION' as relatedEntityType " +
            "FROM Application a WHERE a.offer.company.id = :companyId AND a.status != 'PENDING' ORDER BY a.createdAt DESC LIMIT 5")
    List<Map<String, Object>> findRecentStatusChanges(@Param("companyId") Integer companyId);
}