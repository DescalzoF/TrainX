package com.TrainX.TrainX.session;

import com.TrainX.TrainX.exercise.ExerciseEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "session_exercises")
public class SessionExerciseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "session_id", nullable = false)
    private SessionEntity session;

    @ManyToOne
    @JoinColumn(name = "exercise_id", nullable = false)
    private ExerciseEntity exercise;

    @Column(nullable = false)
    private Integer sets;

    @Column(nullable = false)
    private Integer reps;

    @Column(nullable = true)
    private Double weight; // Can be modified by the user

    @Column(nullable = true)
    private Long xpFitnessReward; // XP reward for this exercise

    public SessionExerciseEntity() {
    }

    public SessionExerciseEntity(SessionEntity session, ExerciseEntity exercise, Integer sets, Integer reps, Long xpFitnessReward) {
        this.session = session;
        this.exercise = exercise;
        this.sets = sets;
        this.reps = reps;
        this.weight = 0.0; // Default weight
        this.xpFitnessReward = xpFitnessReward;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public SessionEntity getSession() {
        return session;
    }

    public void setSession(SessionEntity session) {
        this.session = session;
    }

    public ExerciseEntity getExercise() {
        return exercise;
    }

    public void setExercise(ExerciseEntity exercise) {
        this.exercise = exercise;
    }

    public Integer getSets() {
        return sets;
    }

    public void setSets(Integer sets) {
        this.sets = sets;
    }

    public Integer getReps() {
        return reps;
    }

    public void setReps(Integer reps) {
        this.reps = reps;
    }

    public Double getWeight() {
        return weight;
    }

    public void setWeight(Double weight) {
        this.weight = weight;
    }

    public Long getXpFitnessReward() {
        return xpFitnessReward;
    }
    public void setXpFitnessReward(Long xpFitnessReward) {
        this.xpFitnessReward = xpFitnessReward;
    }
}