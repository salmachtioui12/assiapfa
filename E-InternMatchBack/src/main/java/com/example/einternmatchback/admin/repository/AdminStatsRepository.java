package com.example.einternmatchback.admin.repository;

import com.example.einternmatchback.AjoutOffers.model.Company;
import com.example.einternmatchback.AjoutOffers.model.Offer;
import com.example.einternmatchback.Authentification.user.Role;
import com.example.einternmatchback.Authentification.user.User;
import com.example.einternmatchback.ClientOffre.entity.Favoris;
import com.example.einternmatchback.Postulation.Entity.Application;
import com.example.einternmatchback.Postulation.Entity.ApplicationStatus;
import com.example.einternmatchback.stagiaire.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AdminStatsRepository extends JpaRepository<User, Integer> {

    // User Stats
    @Query("SELECT COUNT(u) FROM User u")
    Long countTotalUsers();

    @Query("SELECT u.role, COUNT(u) FROM User u GROUP BY u.role")
    List<Object[]> countUsersByRole();


    // Company Stats
    @Query("SELECT COUNT(c) FROM Company c")
    Long countTotalCompanies();

    @Query("SELECT c.sector, COUNT(c) FROM Company c GROUP BY c.sector")
    List<Object[]> countCompaniesBySector();

    @Query("SELECT c.name, COUNT(o) FROM Company c JOIN Offer o ON o.company = c GROUP BY c.name ORDER BY COUNT(o) DESC")
    List<Object[]> countOffersByCompany();

    // Offer Stats
    @Query("SELECT COUNT(o) FROM Offer o")
    Long countTotalOffers();

    @Query("SELECT COUNT(o) FROM Offer o WHERE o.isActive = true")
    Long countActiveOffers();

    @Query("SELECT o.stageType, COUNT(o) FROM Offer o GROUP BY o.stageType")
    List<Object[]> countOffersByType();

    @Query("SELECT o.location, COUNT(o) FROM Offer o GROUP BY o.location")
    List<Object[]> countOffersByLocation();

    @Query("SELECT COUNT(o) FROM Offer o WHERE o.createdAt >= :startDate")
    Long countOffersCreatedSince(LocalDateTime startDate);

    // Student Stats
    @Query("SELECT COUNT(s) FROM StudentProfile s")
    Long countTotalStudents();

    @Query("SELECT COUNT(s) FROM StudentProfile s WHERE s.cvPath IS NOT NULL AND s.motivationLetterPath IS NOT NULL")
    Long countCompleteProfiles();

    @Query("SELECT s.location, COUNT(s) FROM StudentProfile s GROUP BY s.location")
    List<Object[]> countStudentsByLocation();

    @Query("SELECT AVG(CAST((SELECT COUNT(sk) FROM StudentSkill sk WHERE sk.studentProfile = s) AS float)) FROM StudentProfile s")
    Double avgSkillsPerStudent();

    // Application Stats
    @Query("SELECT COUNT(a) FROM Application a")
    Long countTotalApplications();

    @Query("SELECT a.status, COUNT(a) FROM Application a GROUP BY a.status")
    List<Object[]> countApplicationsByStatus();

    @Query("SELECT a.offer.title, COUNT(a) FROM Application a GROUP BY a.offer.title ORDER BY COUNT(a) DESC")
    List<Object[]> countApplicationsByOffer();

    // Favorite Stats
    @Query("SELECT COUNT(f) FROM Favoris f")
    Long countTotalFavorites();

    @Query("SELECT f.offer.title, COUNT(f) FROM Favoris f GROUP BY f.offer.title ORDER BY COUNT(f) DESC")
    List<Object[]> countFavoritesByOffer();

    // Document Stats
    @Query("SELECT COUNT(s) FROM StudentProfile s WHERE s.cvPath IS NOT NULL")
    Long countCVs();

    @Query("SELECT COUNT(s) FROM StudentProfile s WHERE s.motivationLetterPath IS NOT NULL")
    Long countMotivationLetters();

    // Recent Activity
    @Query("SELECT c FROM Company c ORDER BY c.createdAt DESC LIMIT 5")
    List<Company> findRecentCompanies();

    @Query("SELECT o FROM Offer o ORDER BY o.createdAt DESC LIMIT 5")
    List<Offer> findRecentOffers();

    @Query("SELECT a FROM Application a ORDER BY a.createdAt DESC LIMIT 5")
    List<Application> findRecentApplications();

    @Query("SELECT o FROM Offer o JOIN FETCH o.company")
    List<Offer> findAllOffers();




}