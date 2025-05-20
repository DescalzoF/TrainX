package com.TrainX.TrainX.customexercise;

import com.TrainX.TrainX.User.UserEntity;
import com.TrainX.TrainX.caminoFitness.CaminoFitnessEntity;
import com.TrainX.TrainX.level.LevelEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Entity
@Table(name = "user_custom_exercises")
public class UserCustomExerciseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Setter
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Setter
    @Column(nullable = false)
    private String name;

    @Setter
    @Column(nullable = false, length = 1000)
    private String description;

    @Setter
    @Column(nullable = false)
    private String muscleGroup;

    @Setter
    @Column(nullable = false)
    private Integer sets;

    @Setter
    @Column(nullable = false)
    private Integer reps;

    @Setter
    @Column(nullable = false)
    private String videoUrl;

    @Setter
    @Column(nullable = false)
    private Double weight;

    @Setter
    @Column(nullable = false)
    private Long xpFitnessReward;

    @Setter
    @ManyToOne
    @JoinColumn(name = "camino_fitness_id", nullable = false)
    private CaminoFitnessEntity caminoFitness;

    @Setter
    @ManyToOne
    @JoinColumn(name = "id_level", nullable = false)
    private LevelEntity level;

    // Default constructor
    public UserCustomExerciseEntity() {}

    // Constructor with parameters
    public UserCustomExerciseEntity(UserEntity user, String name, String description, String muscleGroup,
                                    Integer sets, Integer reps, String videoUrl, Double weight,
                                    Long xpFitnessReward, CaminoFitnessEntity caminoFitness, LevelEntity level) {
        this.user = user;
        this.name = name;
        this.description = description;
        this.muscleGroup = muscleGroup;
        this.sets = sets;
        this.reps = reps;
        this.videoUrl = videoUrl;
        this.weight = weight;
        this.xpFitnessReward = xpFitnessReward;
        this.caminoFitness = caminoFitness;
        this.level = level;
    }

}