package com.TrainX.TrainX.exerciseCompletion;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExerciseCompletionDTO {
    private Long exerciseId;
    private Integer sets;
    private Integer reps;
    private Double weight;
}
