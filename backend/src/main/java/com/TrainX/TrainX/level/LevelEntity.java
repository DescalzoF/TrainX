package com.TrainX.TrainX.level;

import com.TrainX.TrainX.caminoFitness.CaminoFitnessEntity;
import com.TrainX.TrainX.exercise.ExerciseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "level")
@Getter
@Setter
@NoArgsConstructor
public class LevelEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idLevel;

    @Column(nullable = false)
    private String nameLevel;

    @ManyToMany
    @JoinTable(
            name = "camino_level",
            joinColumns = @JoinColumn(name = "level_id"),
            inverseJoinColumns = @JoinColumn(name = "camino_id")
    )
    private List<CaminoFitnessEntity> caminos = new ArrayList<>();

    @OneToMany(mappedBy = "level", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ExerciseEntity> exercises = new ArrayList<>();

    @Column(nullable = false)
    private Long xpMin;

    @Column(nullable = false)
    private Long xpMax;

    public LevelEntity(String nameLevel, List<CaminoFitnessEntity> caminos, Long xpMin, Long xpMax) {
        this.nameLevel = nameLevel;
        this.caminos = caminos != null ? caminos : new ArrayList<>();
        this.xpMin = xpMin;
        this.xpMax = xpMax;
    }

    public LevelEntity(String nameLevel, List<CaminoFitnessEntity> caminos, List<ExerciseEntity> exercises) {
        this.nameLevel = nameLevel;
        this.caminos = caminos != null ? caminos : new ArrayList<>();
        this.exercises = exercises != null ? exercises : new ArrayList<>();
    }
}