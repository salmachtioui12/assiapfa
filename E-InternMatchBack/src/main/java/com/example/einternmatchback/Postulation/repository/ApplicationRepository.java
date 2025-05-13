package com.example.einternmatchback.Postulation.repository;


import com.example.einternmatchback.Postulation.Entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByOfferId(Integer offerId);
    boolean existsByStudentIdAndOfferId(Integer studentId, Integer offerId);
    List<Application> findByStudentUserId(Integer userId);

}
