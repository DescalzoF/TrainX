package com.TrainX.TrainX.caminoFitness;

import com.TrainX.TrainX.level.LevelEntity;
import com.TrainX.TrainX.task.TaskEntity;
import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Entity
@Table(name = "camino_fitness")
public class CaminoFitnessEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idCF;

    @Column(nullable = false)
    private String nameCF;

    @Column(nullable = false, length = 2000)
    private String descriptionCF;

    // Relación muchos a muchos con LevelEntity
    @ManyToMany(mappedBy = "caminos", fetch = FetchType.LAZY)
    private Set<LevelEntity> levels = new HashSet<>();

    /**
     * Relación One-to-Many con TaskEntity.
     * Un camino puede tener muchas tareas semanales.
     */
    @OneToMany(mappedBy = "camino", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<TaskEntity> tasks = new HashSet<>();

    public CaminoFitnessEntity() {
    }

    public CaminoFitnessEntity(String nameCF, String descriptionCF) {
        this.nameCF = nameCF;
        this.descriptionCF = descriptionCF;
    }

    // Métodos de ayuda para mantener la bidireccionalidad
    public void addTask(TaskEntity task) {
        tasks.add(task);
        task.setCamino(this);
    }

    public void removeTask(TaskEntity task) {
        tasks.remove(task);
        task.setCamino(null);
    }

    /**
     * Añade un Level a este Camino y viceversa, manteniendo la relación bidireccional.
     */
    public void addLevel(LevelEntity level) {
        levels.add(level);
        level.getCaminos().add(this);
    }

    /**
     * Elimina un Level de este Camino y viceversa.
     */
    public void removeLevel(LevelEntity level) {
        levels.remove(level);
        level.getCaminos().remove(this);
    }

    // Getters y setters
    public Long getIdCF() {
        return idCF;
    }

    public String getNameCF() {
        return nameCF;
    }

    public void setNameCF(String nameCF) {
        this.nameCF = nameCF;
    }

    public String getDescriptionCF() {
        return descriptionCF;
    }

    public void setDescriptionCF(String descriptionCF) {
        this.descriptionCF = descriptionCF;
    }

    public Set<LevelEntity> getLevels() {
        return levels;
    }

    public void setLevels(Set<LevelEntity> levels) {
        this.levels = levels;
    }

    public Set<TaskEntity> getTasks() {
        return tasks;
    }

    public void setTasks(Set<TaskEntity> tasks) {
        this.tasks = tasks;
    }
}