package com.TrainX.TrainX.exercise;

import jakarta.persistence.*;
import com.TrainX.TrainX.caminoFitness.CaminoFitnessEntity;

@Entity
@Table(name="exercises")
public class ExerciseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(nullable = false)
    private String muscleGroup;

    @Column(nullable = false)
    private Integer sets;

    @Column(nullable = false)
    private Integer reps;

    // Many exercises can belong to one camino fitness type
    @ManyToOne
    @JoinColumn(name = "camino_fitness_id", nullable = false)
    private CaminoFitnessEntity caminoFitness;

    public ExerciseEntity() {}

    public ExerciseEntity(String name, String description, String muscleGroup, Integer sets, Integer reps, CaminoFitnessEntity caminoFitness) {
        this.name = name;
        this.description = description;
        this.muscleGroup = muscleGroup;
        this.sets = sets;
        this.reps = reps;
        this.caminoFitness = caminoFitness;
    }

    // Getters
    public long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public String getMuscleGroup() {
        return muscleGroup;
    }

    public Integer getSets() {
        return sets;
    }

    public Integer getReps() {
        return reps;
    }

    public CaminoFitnessEntity getCaminoFitness() {
        return caminoFitness;
    }

    // Setters
    public void setName(String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setMuscleGroup(String muscleGroup) {
        this.muscleGroup = muscleGroup;
    }

    public void setSets(Integer sets) {
        this.sets = sets;
    }

    public void setReps(Integer reps) {
        this.reps = reps;
    }

    public void setCaminoFitness(CaminoFitnessEntity caminoFitness) {
        this.caminoFitness = caminoFitness;
    }
}