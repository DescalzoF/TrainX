package com.TrainX.TrainX.completedExercise;

import com.TrainX.TrainX.exercise.CompletedExerciseEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompletedExerciseRepository extends JpaRepository<CompletedExerciseEntity, Long> {

    // Find all completed exercises for a user
    List<CompletedExerciseEntity> findByUserId(Long userId);

    // Find a specific completed exercise entry
    Optional<CompletedExerciseEntity> findByUserIdAndExerciseId(Long userId, Long exerciseId);

    // Query to get just the exercise IDs
    @Query("SELECT ce.exerciseId FROM CompletedExerciseEntity ce WHERE ce.userId = :userId")
    List<Long> findExerciseIdsByUserId(@Param("userId") Long userId);

    // Check if an exercise is already completed by user
    boolean existsByUserIdAndExerciseId(Long userId, Long exerciseId);
}