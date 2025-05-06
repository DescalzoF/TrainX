
package com.TrainX.TrainX.exerciseCompletion;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExerciseCompletionRepository extends JpaRepository<ExerciseCompletionEntity, Long> {
    /**
     * Find all exercise completions for a specific user
     *
     * @param userId the user's ID
     * @return list of exercise completions
     */
    @Query("SELECT ec FROM ExerciseCompletionEntity ec WHERE ec.user.id = :userId ORDER BY ec.completedAt DESC")
    List<ExerciseCompletionEntity> findByUserId(@Param("userId") Long userId);
}