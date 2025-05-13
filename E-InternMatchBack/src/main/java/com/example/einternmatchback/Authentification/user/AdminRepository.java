package com.example.einternmatchback.Authentification.user;



import com.example.einternmatchback.AjoutOffers.model.Offer;
import com.example.einternmatchback.Authentification.user.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
@Repository
public interface AdminRepository extends JpaRepository<Admin,Integer> {
    Optional<Admin> findById(Integer id);

}