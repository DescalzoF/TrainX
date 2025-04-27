package com.TrainX.TrainX.progress;

import com.TrainX.TrainX.User.UserEntity;
import com.TrainX.TrainX.exercise.ExerciseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

// Entity to track completed workout sessions
@Setter
@Getter
@Entity
@Table(name = "workout_sessions")
public class WorkoutSessionEntity {
    // Getters and setters
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Column(nullable = false)
    private LocalDate completedDate;

    @ManyToMany
    @JoinTable(
            name = "workout_exercises",
            joinColumns = @JoinColumn(name = "workout_id"),
            inverseJoinColumns = @JoinColumn(name = "exercise_id")
    )
    private List<ExerciseEntity> completedExercises;

    @Column(nullable = false)
    private long totalWeight;

    @Column(nullable = false)
    private int totalReps;

    @Column(nullable = false)
    private int totalSets;

    @Column(nullable = false)
    private long xpEarned;

}