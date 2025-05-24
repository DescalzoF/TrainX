package com.TrainX.TrainX.duels;

import org.springframework.data.jpa.repository.JpaRepository;

public interface DuelCompletionRepository extends JpaRepository<DuelCompletionEntity, Long> {
    boolean existsByDiaryExerciseIdAndUserId(Long diaryExerciseId, Long userId);
}