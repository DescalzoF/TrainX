package com.TrainX.TrainX.session;

import com.TrainX.TrainX.exercise.ExerciseDTO;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SessionExerciseDTO {
    private Long id;
    private ExerciseDTO exercise;
    private Integer sets;
    private Integer reps;
    private Double weight;
}