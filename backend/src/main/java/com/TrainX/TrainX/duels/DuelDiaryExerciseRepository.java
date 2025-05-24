package com.TrainX.TrainX.duels;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DuelDiaryExerciseRepository extends JpaRepository<DuelDiaryExerciseEntity, Long> {
    List<DuelDiaryExerciseEntity> findByDuelId(Long duelId);
    List<DuelDiaryExerciseEntity> findByDuelIdAndDate(Long duelId, LocalDate date);
    Optional<DuelDiaryExerciseEntity> findByDuelIdAndDateAndDayOfWeek(Long duelId, LocalDate date, java.time.DayOfWeek dayOfWeek);
}