package com.TrainX.TrainX.session;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SessionRepository extends JpaRepository<SessionEntity, Long> {
    List<SessionEntity> findByUserId(Long userId);

    @Query("SELECT se FROM SessionExerciseEntity se WHERE se.id = ?1")
    Optional<SessionExerciseEntity> findExerciseById(Long id);

    default void saveExercise(SessionExerciseEntity sessionExercise) {
        save(sessionExercise.getSession());
    }
}