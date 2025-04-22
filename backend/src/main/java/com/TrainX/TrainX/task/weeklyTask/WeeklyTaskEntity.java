package com.TrainX.TrainX.task.weeklyTask;

import com.TrainX.TrainX.level.LevelEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "weekly_task")
public class WeeklyTaskEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idTask;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private Long xpReward;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_level", nullable = false)
    private LevelEntity level;


    // Constructor vacío
    public WeeklyTaskEntity() {}

    // Constructor con campos
    public WeeklyTaskEntity(String description, Long xpReward, LevelEntity level) {
        this.description = description;
        this.xpReward = xpReward;
        this.level = level;
    }

    // Getters y Setters
    public Long getIdTask() {
        return idTask;
    }

    public void setIdTask(Long idTask) {
        this.idTask = idTask;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getXpReward() {
        return xpReward;
    }

    public void setXpReward(Long xpReward) {
        this.xpReward = xpReward;
    }

    public LevelEntity getLevel() {
        return level;
    }

    public void setLevel(LevelEntity level) {
        this.level = level;
    }
}
