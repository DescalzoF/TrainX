package com.TrainX.TrainX.level;

import com.TrainX.TrainX.caminoFitness.CaminoFitnessEntity;
import com.TrainX.TrainX.exercise.ExerciseEntity;
import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "level")
public class LevelEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idLevel;

    @Column(nullable = false)
    private String nameLevel; // Principiante, Intermedio, Avanzado, Pro

    @ManyToMany
    @JoinTable(
            name = "camino_level",
            joinColumns = @JoinColumn(name = "level_id"),
            inverseJoinColumns = @JoinColumn(name = "camino_id")
    )
    private List<CaminoFitnessEntity> caminos;  // Relación muchos a muchos con CaminoFitnessEntity

    @OneToMany(mappedBy = "level", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ExerciseEntity> exercises;

    @Column(nullable = false)
    private Long xpMin;  // XP mínimo para el nivel

    @Column(nullable = false)
    private Long xpMax;  // XP máximo para el nivel

    // Constructor vacío
    public LevelEntity() {}

    // Constructor con campos útiles
    public LevelEntity(String nameLevel, List<CaminoFitnessEntity> caminos, Long xpMin, Long xpMax) {
        this.nameLevel = nameLevel;
        this.caminos = caminos;
        this.xpMin = xpMin;
        this.xpMax = xpMax;
    }

    // Constructor completo (si es necesario)
    public LevelEntity(String nameLevel, List<CaminoFitnessEntity> caminos, List<ExerciseEntity> exercises) {
        this.nameLevel = nameLevel;
        this.caminos = caminos;
        this.exercises = exercises;
    }

    // Getters y Setters
    public Long getIdLevel() {
        return idLevel;
    }

    public void setIdLevel(Long idLevel) {
        this.idLevel = idLevel;
    }

    public String getNameLevel() {
        return nameLevel;
    }

    public void setNameLevel(String nameLevel) {
        this.nameLevel = nameLevel;
    }

    public List<CaminoFitnessEntity> getCaminos() {
        return caminos;
    }

    public void setCaminos(List<CaminoFitnessEntity> caminos) {
        this.caminos = caminos;
    }

    public List<ExerciseEntity> getExercises() {
        return exercises;
    }

    public void setExercises(List<ExerciseEntity> exercises) {
        this.exercises = exercises;
    }

    public Long getXpMin() {
        return xpMin;
    }

    public void setXpMin(Long xpMin) {
        this.xpMin = xpMin;
    }

    public Long getXpMax() {
        return xpMax;
    }

    public void setXpMax(Long xpMax) {
        this.xpMax = xpMax;
    }
}
