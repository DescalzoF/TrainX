package com.TrainX.TrainX.exerciseCompletion;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class WeeklyPerformanceDTO {
    private String name; // Week identifier (e.g., "Sem 1")
    private Double weight; // Average weight for the week
    private Integer reps; // Average reps for the week
    private Integer xp; // Total XP earned during the week
}
