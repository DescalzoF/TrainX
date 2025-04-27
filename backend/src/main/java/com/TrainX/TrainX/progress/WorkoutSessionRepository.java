package com.TrainX.TrainX.progress;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

// Repository for workout sessions
interface WorkoutSessionRepository extends JpaRepository<WorkoutSessionEntity, Long> {
    List<WorkoutSessionEntity> findByUserIdAndCompletedDateBetween(
            Long userId, LocalDate startDate, LocalDate endDate);

    // Added method to find all sessions for a user
    List<WorkoutSessionEntity> findByUserId(Long userId);

    // Added method to find sessions on a specific date
    List<WorkoutSessionEntity> findByUserIdAndCompletedDate(Long userId, LocalDate date);

    // Added method to find recent sessions for a user
    List<WorkoutSessionEntity> findByUserIdOrderByCompletedDateDesc(Long userId);
}
