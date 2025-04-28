package com.TrainX.TrainX.exercise;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ExerciseDTO {
    private String name;
    private String description;
    private String muscleGroup;
    private Integer sets;
    private Integer reps;
    private String videoUrl;
    private Long xpFitnessReward;

    // Getters and Setters
}
