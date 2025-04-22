package com.TrainX.TrainX.task.completedTask;

import com.TrainX.TrainX.User.UserEntity;
import com.TrainX.TrainX.task.weeklyTask.WeeklyTaskEntity;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "completed_tasks")
public class CompletedTaskEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idCompleted;

    @ManyToOne
    @JoinColumn(name = "id_user", nullable = false)
    private UserEntity user;

    @ManyToOne
    @JoinColumn(name = "task_id", nullable = false)
    private WeeklyTaskEntity task;

    @Column(nullable = false)
    private LocalDate completedDate;

    @Column(nullable = false)
    private LocalDate weekStartDate;

    // Constructor vacío
    public CompletedTaskEntity() {}

    // Constructor con campos útiles
    public CompletedTaskEntity(UserEntity user, WeeklyTaskEntity task, LocalDate completedDate, LocalDate weekStartDate) {
        this.user = user;
        this.task = task;
        this.completedDate = completedDate;
        this.weekStartDate = weekStartDate;
    }

    // Getters y Setters
    public Long getIdCompleted() {
        return idCompleted;
    }

    public void setIdCompleted(Long idCompleted) {
        this.idCompleted = idCompleted;
    }

    public UserEntity getUser() {
        return user;
    }

    public void setUser(UserEntity user) {
        this.user = user;
    }

    public WeeklyTaskEntity getTask() {
        return task;
    }

    public void setTask(WeeklyTaskEntity task) {
        this.task = task;
    }

    public LocalDate getCompletedDate() {
        return completedDate;
    }

    public void setCompletedDate(LocalDate completedDate) {
        this.completedDate = completedDate;
    }

    public LocalDate getWeekStartDate() {
        return weekStartDate;
    }

    public void setWeekStartDate(LocalDate weekStartDate) {
        this.weekStartDate = weekStartDate;
    }
}
