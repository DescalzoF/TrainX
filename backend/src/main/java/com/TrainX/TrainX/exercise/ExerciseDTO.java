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
    private Long id;
    private String name;
    private String description;
    private String muscleGroup;
    private Integer sets;
    private Integer reps;
    private String videoUrl;
    private Long xpFitnessReward;

    // Additional constructor for backward compatibility
    public ExerciseDTO(String name, String description, String muscleGroup,
                       Integer sets, Integer reps, String videoUrl, Long xpFitnessReward) {
        this.name = name;
        this.description = description;
        this.muscleGroup = muscleGroup;
        this.sets = sets;
        this.reps = reps;
        this.videoUrl = videoUrl;
        this.xpFitnessReward = xpFitnessReward;
    }
}