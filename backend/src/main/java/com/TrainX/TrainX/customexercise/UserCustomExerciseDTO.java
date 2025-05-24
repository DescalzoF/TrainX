package com.TrainX.TrainX.customexercise;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserCustomExerciseDTO {
    private Long id;
    private Long userId;
    private String name;
    private String description;
    private String muscleGroup;
    private Integer sets;
    private Integer reps;
    private String videoUrl;
    private Double weight;
    private Long xpFitnessReward;
    private Long caminoFitnessId;
    private Long levelId;
}