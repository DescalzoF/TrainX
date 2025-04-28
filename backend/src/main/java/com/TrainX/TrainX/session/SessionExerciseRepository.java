package com.TrainX.TrainX.session;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SessionExerciseRepository extends JpaRepository<SessionExerciseEntity, Long> {
    // Find all exercises for a specific session
    List<SessionExerciseEntity> findBySessionId(Long sessionId);

    // Find a specific exercise by its ID
    Optional<SessionExerciseEntity> findById(Long id);

    // Find exercises by session and exercise IDs
    @Query("SELECT se FROM SessionExerciseEntity se WHERE se.session.id = :sessionId AND se.exercise.id = :exerciseId")
    Optional<SessionExerciseEntity> findBySessionIdAndExerciseId(
            @Param("sessionId") Long sessionId,
            @Param("exerciseId") Long exerciseId
    );

    // Delete all exercises for a specific session
    void deleteBySessionId(Long sessionId);

    // Count exercises in a session
    long countBySessionId(Long sessionId);
}