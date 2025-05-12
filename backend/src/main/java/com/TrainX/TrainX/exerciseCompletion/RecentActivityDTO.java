package com.TrainX.TrainX.exerciseCompletion;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class RecentActivityDTO {
    private Long id;
    private String exercise; // Exercise name
    private Double weight;
    private Integer reps;
    private Integer sets;
    private LocalDateTime completedAt;
    private Integer xp;
}