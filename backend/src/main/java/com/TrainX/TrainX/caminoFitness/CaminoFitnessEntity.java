package com.TrainX.TrainX.caminoFitness;

import com.TrainX.TrainX.level.LevelEntity;
import com.TrainX.TrainX.task.TaskEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "camino_fitness")
@Getter
@Setter
@NoArgsConstructor
public class CaminoFitnessEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idCF;

    @Column(nullable = false)
    private String nameCF;

    @Column(nullable = false, length = 2000)
    private String descriptionCF;

    @ManyToMany(mappedBy = "caminos", fetch = FetchType.LAZY)
    private Set<LevelEntity> levels = new HashSet<>();

    @OneToMany(mappedBy = "camino", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<TaskEntity> tasks = new HashSet<>();

    public CaminoFitnessEntity(String nameCF, String descriptionCF) {
        this.nameCF = nameCF;
        this.descriptionCF = descriptionCF;
    }

    public void addTask(TaskEntity task) {
        tasks.add(task);
        task.setCamino(this);
    }

    public void removeTask(TaskEntity task) {
        tasks.remove(task);
        task.setCamino(null);
    }

    public void addLevel(LevelEntity level) {
        levels.add(level);
        level.getCaminos().add(this);
    }

    public void removeLevel(LevelEntity level) {
        levels.remove(level);
        level.getCaminos().remove(this);
    }
}