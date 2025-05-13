
package com.TrainX.TrainX.exerciseCompletion;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExerciseCompletionRepository extends JpaRepository<ExerciseCompletionEntity, Long> {

    @Query("SELECT ec FROM ExerciseCompletionEntity ec WHERE ec.user.id = :userId ORDER BY ec.completedAt DESC")
    List<ExerciseCompletionEntity> findByUserId(@Param("userId") Long userId);
    Optional<ExerciseCompletionEntity> findTopByUserIdAndExerciseIdOrderByCompletedAtDesc(Long userId, Long exerciseId);
}