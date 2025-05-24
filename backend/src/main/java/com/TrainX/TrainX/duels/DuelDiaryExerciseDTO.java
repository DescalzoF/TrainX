package com.TrainX.TrainX.duels;

import lombok.Data;

import java.time.LocalDate;

@Data
public class DuelDiaryExerciseDTO {
    private Long id;
    private Long exerciseId;
    private String exerciseName;
    private String exerciseDescription;
    private LocalDate date;
    private String dayOfWeek;
    private Boolean completedByChallenger;
    private Boolean completedByChallenged;
}