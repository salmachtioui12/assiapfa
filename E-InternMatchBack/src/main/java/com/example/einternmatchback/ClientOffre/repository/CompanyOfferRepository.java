package com.example.einternmatchback.ClientOffre.repository;

import com.example.einternmatchback.AjoutOffers.model.Offer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;


public interface CompanyOfferRepository extends JpaRepository<Offer, Integer> {
    //List<CompanyOffer> findByLocation(String location);
    List<Offer> findByLocationContainingIgnoreCase(String location);
    List<Offer> findByStageTypeContainingIgnoreCase(String stageType);

    //recherche
    List<Offer> findByLocationContainingIgnoreCaseOrStageTypeContainingIgnoreCase(String location, String stageType);

    @Query("SELECT o FROM Offer o WHERE " +
            "LOWER(o.location) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(o.stageType) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(o.skillsRequired) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Offer> searchByKeyword(@Param("keyword") String keyword);

    long count();
    // Ajoutez si nécessaire
    //@Query("SELECT o FROM CompanyOffer o WHERE LOWER(o.location) LIKE LOWER(concat('%', :location, '%'))")
    //List<CompanyOffer> searchByLocation(@Param("location") String location);
}
