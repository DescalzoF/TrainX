package com.TrainX.TrainX.exerciseCompletion;

import com.TrainX.TrainX.User.UserEntity;
import com.TrainX.TrainX.exercise.ExerciseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "exercise_completions")
@Getter
@Setter
@NoArgsConstructor
public class ExerciseCompletionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercise_id", nullable = false)
    private ExerciseEntity exercise;

    @Column(nullable = false)
    private Integer sets;

    @Column(nullable = false)
    private Integer reps;

    @Column(nullable = false)
    private Double weight;

    @Column(nullable = false)
    private Long xpReward;

    @Column(nullable = false)
    private LocalDateTime completedAt;

    public ExerciseCompletionEntity(UserEntity user, ExerciseEntity exercise, Integer sets, Integer reps, Double weight, Long xpReward) {
        this.user = user;
        this.exercise = exercise;
        this.sets = sets;
        this.reps = reps;
        this.weight = weight;
        this.xpReward = xpReward;
        this.completedAt = LocalDateTime.now();
    }
}
