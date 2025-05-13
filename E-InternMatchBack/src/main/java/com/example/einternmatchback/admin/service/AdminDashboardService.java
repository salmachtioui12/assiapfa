package com.example.einternmatchback.admin.service;

import com.example.einternmatchback.AjoutOffers.repo.CompanyRepository;
import com.example.einternmatchback.Authentification.user.*;
import com.example.einternmatchback.Postulation.repository.ApplicationRepository;
import com.example.einternmatchback.admin.dto.*;
import com.example.einternmatchback.admin.repository.AdminStatsRepository;
import com.example.einternmatchback.AjoutOffers.model.Company;
import com.example.einternmatchback.AjoutOffers.model.Offer;
import com.example.einternmatchback.Postulation.Entity.Application;
import com.example.einternmatchback.Postulation.Entity.ApplicationStatus;
import com.example.einternmatchback.stagiaire.StudentProfile;
import com.example.einternmatchback.stagiaire.StudentProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor

public class AdminDashboardService {
    @Autowired
    private CompanyRepository companyRepository;

    private  final AdminRepository adminRepository;

    private final AdminStatsRepository adminStatsRepository;
    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final ApplicationRepository applicationRepository;
    public AdminDashboardStatsDTO getDashboardStats() {
        AdminDashboardStatsDTO stats = new AdminDashboardStatsDTO();

        stats.setUserStats(getUserStats());
        stats.setCompanyStats(getCompanyStats());
        stats.setOfferStats(getOfferStats());
        stats.setStudentStats(getStudentStats());
        stats.setApplicationStats(getApplicationStats());
        stats.setFavoriteStats(getFavoriteStats());
        stats.setDocumentStats(getDocumentStats());
        stats.setRecentActivity(getRecentActivity());

        return stats;
    }

    private UserStatsDTO getUserStats() {
        UserStatsDTO userStats = new UserStatsDTO();

        userStats.setTotalUsers(adminStatsRepository.countTotalUsers());

        List<Object[]> usersByRole = adminStatsRepository.countUsersByRole();
        Map<Role, Long> roleCountMap = usersByRole.stream()
                .collect(Collectors.toMap(
                        obj -> (Role) obj[0],
                        obj -> (Long) obj[1]
                ));
        userStats.setUsersByRole(roleCountMap);

        // Suppression des statistiques temporelles des utilisateurs car non disponibles dans le repository
        userStats.setNewUsersToday(0L);
        userStats.setNewUsersThisWeek(0L);
        userStats.setNewUsersThisMonth(0L);
        userStats.setGrowthRate(0.0);

        return userStats;
    }

    private CompanyStatsDTO getCompanyStats() {
        CompanyStatsDTO companyStats = new CompanyStatsDTO();

        companyStats.setTotalCompanies(adminStatsRepository.countTotalCompanies());

        List<Object[]> companiesBySector = adminStatsRepository.countCompaniesBySector();
        Map<String, Long> sectorCountMap = companiesBySector.stream()
                .collect(Collectors.toMap(
                        obj -> (String) obj[0],
                        obj -> (Long) obj[1]
                ));
        companyStats.setCompaniesBySector(sectorCountMap);

        List<Object[]> offersByCompany = adminStatsRepository.countOffersByCompany();
        Map<String, Long> companyActivityMap = offersByCompany.stream()
                .limit(5) // Top 5 most active companies
                .collect(Collectors.toMap(
                        obj -> (String) obj[0],
                        obj -> (Long) obj[1]
                ));
        companyStats.setMostActiveCompanies(companyActivityMap);

        return companyStats;
    }

    private OfferStatsDTO getOfferStats() {
        OfferStatsDTO offerStats = new OfferStatsDTO();

        offerStats.setTotalOffers(adminStatsRepository.countTotalOffers());
        offerStats.setActiveOffers(adminStatsRepository.countActiveOffers());
        offerStats.setInactiveOffers(offerStats.getTotalOffers() - offerStats.getActiveOffers());

        List<Object[]> offersByType = adminStatsRepository.countOffersByType();
        Map<String, Long> typeCountMap = offersByType.stream()
                .collect(Collectors.toMap(
                        obj -> (String) obj[0],
                        obj -> (Long) obj[1]
                ));
        offerStats.setOffersByType(typeCountMap);

        List<Object[]> offersByLocation = adminStatsRepository.countOffersByLocation();
        Map<String, Long> locationCountMap = offersByLocation.stream()
                .collect(Collectors.toMap(
                        obj -> (String) obj[0],
                        obj -> (Long) obj[1]
                ));
        offerStats.setOffersByLocation(locationCountMap);

        // Correction des statistiques temporelles
        Map<String, Long> offersByPeriod = new HashMap<>();

        // Pour 'today' - tronquer au jour
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        offersByPeriod.put("today", adminStatsRepository.countOffersCreatedSince(startOfDay));

        // Pour 'thisWeek' - calculer le début de la semaine
        LocalDateTime startOfWeek = LocalDateTime.now()
                .with(DayOfWeek.MONDAY)
                .withHour(0).withMinute(0).withSecond(0).withNano(0);
        offersByPeriod.put("thisWeek", adminStatsRepository.countOffersCreatedSince(startOfWeek));

        // Pour 'thisMonth' - début du mois
        LocalDateTime startOfMonth = LocalDateTime.now()
                .withDayOfMonth(1)
                .withHour(0).withMinute(0).withSecond(0).withNano(0);
        offersByPeriod.put("thisMonth", adminStatsRepository.countOffersCreatedSince(startOfMonth));

        offerStats.setOffersCreatedByPeriod(offersByPeriod);

        return offerStats;
    }

    private StudentStatsDTO getStudentStats() {
        StudentStatsDTO studentStats = new StudentStatsDTO();

        studentStats.setTotalStudents(adminStatsRepository.countTotalStudents());
        studentStats.setCompleteProfiles(adminStatsRepository.countCompleteProfiles());
        studentStats.setIncompleteProfiles(studentStats.getTotalStudents() - studentStats.getCompleteProfiles());

        List<Object[]> studentsByLocation = adminStatsRepository.countStudentsByLocation();
        Map<String, Long> locationCountMap = studentsByLocation.stream()
                .collect(Collectors.toMap(
                        obj -> (String) obj[0],
                        obj -> (Long) obj[1]
                ));
        studentStats.setStudentsByLocation(locationCountMap);

        studentStats.setAvgSkillsPerStudent(adminStatsRepository.avgSkillsPerStudent());

        return studentStats;
    }

    private ApplicationStatsDTO getApplicationStats() {
        ApplicationStatsDTO applicationStats = new ApplicationStatsDTO();

        applicationStats.setTotalApplications(adminStatsRepository.countTotalApplications());

        List<Object[]> applicationsByStatus = adminStatsRepository.countApplicationsByStatus();
        Map<ApplicationStatus, Long> statusCountMap = applicationsByStatus.stream()
                .collect(Collectors.toMap(
                        obj -> (ApplicationStatus) obj[0],
                        obj -> (Long) obj[1]
                ));
        applicationStats.setApplicationsByStatus(statusCountMap);

        List<Object[]> applicationsByOffer = adminStatsRepository.countApplicationsByOffer();
        Map<String, Long> popularOffersMap = applicationsByOffer.stream()
                .limit(5) // Top 5 most popular offers
                .collect(Collectors.toMap(
                        obj -> (String) obj[0],
                        obj -> (Long) obj[1]
                ));
        applicationStats.setMostPopularOffers(popularOffersMap);

        // Calculate conversion rate
        Long accepted = statusCountMap.getOrDefault(ApplicationStatus.ACCEPTED, 0L);
        if (applicationStats.getTotalApplications() > 0) {
            applicationStats.setConversionRate((accepted * 100.0) / applicationStats.getTotalApplications());
        } else {
            applicationStats.setConversionRate(0.0);
        }

        return applicationStats;
    }

    private FavoriteStatsDTO getFavoriteStats() {
        FavoriteStatsDTO favoriteStats = new FavoriteStatsDTO();

        favoriteStats.setTotalFavorites(adminStatsRepository.countTotalFavorites());

        List<Object[]> favoritesByOffer = adminStatsRepository.countFavoritesByOffer();
        Map<String, Long> favoriteOffersMap = favoritesByOffer.stream()
                .limit(5) // Top 5 most favorited offers
                .collect(Collectors.toMap(
                        obj -> (String) obj[0],
                        obj -> (Long) obj[1]
                ));
        favoriteStats.setMostFavoritedOffers(favoriteOffersMap);

        return favoriteStats;
    }

    private DocumentStatsDTO getDocumentStats() {
        DocumentStatsDTO documentStats = new DocumentStatsDTO();

        documentStats.setTotalCVs(adminStatsRepository.countCVs());
        documentStats.setTotalMotivationLetters(adminStatsRepository.countMotivationLetters());

        return documentStats;
    }

    private RecentActivityDTO getRecentActivity() {
        RecentActivityDTO recentActivity = new RecentActivityDTO();

        // Recent companies (limité à 5 dans le service)
        List<Company> recentCompanies = adminStatsRepository.findRecentCompanies().stream()
                .limit(5)
                .collect(Collectors.toList());
        recentActivity.setRecentCompanies(recentCompanies.stream()
                .map(c -> new RecentCompanyDTO(c.getName(), c.getSector(), c.getCreatedAt()))
                .collect(Collectors.toList()));

        // Recent offers (limité à 5 dans le service)
        List<Offer> recentOffers = adminStatsRepository.findRecentOffers().stream()
                .limit(5)
                .collect(Collectors.toList());
        recentActivity.setRecentOffers(recentOffers.stream()
                .map(o -> new RecentOfferDTO(o.getTitle(), o.getCompany().getName(), o.getCreatedAt()))
                .collect(Collectors.toList()));

        // Recent applications (limité à 5 dans le service)
        List<Application> recentApplications = adminStatsRepository.findRecentApplications().stream()
                .limit(5)
                .collect(Collectors.toList());
        recentActivity.setRecentApplications(recentApplications.stream()
                .map(a -> new RecentApplicationDTO(
                        a.getStudent().getUser().getFirstname() + " " + a.getStudent().getUser().getLastname(),
                        a.getOffer().getTitle(),
                        a.getStatus(),
                        a.getCreatedAt()))
                .collect(Collectors.toList()));

        // Suppression des utilisateurs récents car non disponible dans le repository
        recentActivity.setRecentUsers(List.of());

        return recentActivity;
    }

    public Map<LocalDate, Long> getUsersCreationByDate() {
        List<User> users = userRepository.findAll();

        return users.stream()
                .map(user -> {
                    // Cas 1 : Étudiant
                    Optional<StudentProfile> studentProfile = studentProfileRepository.findByUser(user);
                    if (studentProfile.isPresent()) {
                        return studentProfile.get().getCreatedAt().toLocalDate();
                    }

                    // Cas 2 : Entreprise
                    Optional<Company> companyProfile = companyRepository.findByUserId(user.getId());
                    if (companyProfile.isPresent()) {
                        return companyProfile.get().getCreatedAt().toLocalDate();
                    }


                    // Cas 3 : Admin
                    Optional<Admin> adminProfile = adminRepository.findById(user.getId());
                    if (adminProfile.isPresent() && adminProfile.get().getCreatedAt() != null) {
                        return adminProfile.get().getCreatedAt().toLocalDate();
                    }
                    // Aucun profil associé → on ignore
                    return null;
                })

                .filter(Objects::nonNull)
                .collect(Collectors.groupingBy(
                        Function.identity(),
                        Collectors.counting()
                ));
    }

    public List<UserDTO> getUsersWithProfiles() {
        List<User> users = userRepository.findAll();

        return users.stream()
                .map(user -> {
                    if (user.getRole().equals(Role.STUDENT)) {
                        return studentProfileRepository.findByUser(user)
                                .map(profile -> new UserDTO(
                                        user.getFirstname(),
                                        user.getLastname(),
                                        user.getEmail(),
                                        profile.getCreatedAt(),
                                        user.getRole().name(),
                                        profile.getId()
                                ))
                                .orElse(null);
                    } else if (user.getRole().equals(Role.MANAGER)) {
                        return companyRepository.findByUserId(user.getId())
                                .map(company -> new UserDTO(
                                        user.getFirstname(),
                                        user.getLastname(),
                                        user.getEmail(),
                                        company.getCreatedAt(),
                                        user.getRole().name(),
                                        company.getId()
                                ))
                                .orElse(null);
                    } else if (user.getRole().equals(Role.ADMIN)) {
                        return adminRepository.findById(user.getId())
                                .map(admin -> new UserDTO(
                                        user.getFirstname(),
                                        user.getLastname(),
                                        user.getEmail(),
                                        admin.getCreatedAt(),
                                        user.getRole().name(),
                                        user.getId()
                                ))
                                .orElse(null);
                    } else {
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }
    public List<OfferDTO> getAllOffers() {
        List<Offer> offers = adminStatsRepository.findAllOffers();
        return offers.stream()
                .map(offer -> new OfferDTO(
                        offer.getId(),
                        offer.getTitle(),
                        offer.getDescription(),
                        offer.getStageType(),
                        offer.getLocation(),
                        offer.getCompany().getName(),
                        offer.getIsActive(),
                        offer.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }
    public Map<String, Long> getApplicationsByDate() {
        return applicationRepository.findAll().stream()
                .filter(app -> app.getCreatedAt() != null)
                .map(app -> app.getCreatedAt().toLocalDate().toString())
                .collect(Collectors.groupingBy(Function.identity(), Collectors.counting()));
    }
    public List<Offer> getTop5MostAppliedOffers() {
        List<Object[]> results = adminStatsRepository.countApplicationsByOffer();
        return results.stream()
                .limit(5)
                .map(result -> (Offer) result[0])
                .collect(Collectors.toList());
    }



}