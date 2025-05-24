package com.TrainX.TrainX.duels;

import com.TrainX.TrainX.User.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface DuelRepository extends JpaRepository<DuelEntity, Long> {
    List<DuelEntity> findByChallenger(UserEntity challenger);
    List<DuelEntity> findByChallenged(UserEntity challenged);

    @Query("SELECT d FROM DuelEntity d WHERE (d.challenger = ?1 OR d.challenged = ?1) AND d.status = ?2")
    List<DuelEntity> findByUserAndStatus(UserEntity user, DuelStatus status);

    @Query("SELECT d FROM DuelEntity d WHERE (d.challenger = ?1 OR d.challenged = ?1) AND d.startDate <= ?2 AND d.endDate >= ?2 AND d.status = 'ACTIVO'")
    List<DuelEntity> findActiveByUserAndDate(UserEntity user, LocalDate date);

    // Add this to DuelRepository.java
    @Query("SELECT COUNT(d) FROM DuelEntity d WHERE d.challenger = ?1 AND d.status = 'PENDING'")
    int countPendingChallengesByUser(UserEntity challenger);

    @Query("SELECT d FROM DuelEntity d WHERE d.status = ?1 AND d.createdAt < ?2")
    List<DuelEntity> findByStatusAndCreatedAtBefore(DuelStatus status, LocalDateTime dateTime);
}
