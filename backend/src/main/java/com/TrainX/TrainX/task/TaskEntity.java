package com.TrainX.TrainX.task;


import com.TrainX.TrainX.caminoFitness.CaminoFitnessEntity;
import jakarta.persistence.*;

import java.time.LocalDate;

/**
 * Representa una tarea semanal que el usuario puede completar una vez por semana.
 * Al completarla, el usuario recibe xpfitness.
 * Cada tarea está asociada a un CaminoFitnessEntity (por ejemplo, Deportista, Fuerza, etc.).
 */
@Entity
@Table(name = "tasks")
public class TaskEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idTask;

    @Column(nullable = false)
    private String title;

    @Column(length = 500)
    private String description;

    /**
     * Relación Many-to-One con CaminoFitnessEntity.
     * Un camino (p.ej., Deportista) puede tener muchas tareas.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "camino_id", nullable = false)
    private CaminoFitnessEntity camino;

    /**
     * Puntos de experiencia que otorga esta tarea.
     */
    @Column(nullable = false)
    private Long xpReward;

    /**
     * Periodo de recurrencia en días (por defecto, 7 días para tareas semanales).
     */
    @Column(nullable = false)
    private Integer recurrenceDays = 7;

    // Constructores
    public TaskEntity() {}

    public TaskEntity(String title, String description, CaminoFitnessEntity camino, Long xpReward) {
        this.title = title;
        this.description = description;
        this.camino = camino;
        this.xpReward = xpReward;
    }

    // Getters y setters
    public Long getId() {
        return idTask;
    }

    public void setId(Long idTask) {
        this.idTask = idTask;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public CaminoFitnessEntity getCamino() {
        return camino;
    }

    public void setCamino(CaminoFitnessEntity camino) {
        this.camino = camino;
    }

    public Long getXpReward() {
        return xpReward;
    }

    public void setXpReward(Long xpReward) {
        this.xpReward = xpReward;
    }

    public int getRecurrenceDays() {
        return recurrenceDays;
    }

    public void setRecurrenceDays(int recurrenceDays) {
        this.recurrenceDays = recurrenceDays;
    }

    @Transient
    public boolean isAvailable(LocalDate lastCompletedDate) {
        if (lastCompletedDate == null) {
            // Nunca se completó antes, está disponible
            return true;
        }
        // Compara si lastCompletedDate + recurrenceDays <= hoy
        LocalDate nextAvailableDate = lastCompletedDate.plusDays(recurrenceDays);
        return !LocalDate.now().isBefore(nextAvailableDate);
    }
}

