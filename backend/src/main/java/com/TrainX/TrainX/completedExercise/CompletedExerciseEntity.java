package com.TrainX.TrainX.exercise;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "completed_exercises", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "exercise_id"})
})
public class CompletedExerciseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "exercise_id", nullable = false)
    private Long exerciseId;

    @Column(name = "completed_at", nullable = false)
    private LocalDateTime completedAt;

    @Column(name = "xp_awarded", nullable = false)
    private Long xpAwarded;

    // Constructors
    public CompletedExerciseEntity() {
    }

    public CompletedExerciseEntity(Long userId, Long exerciseId, Long xpAwarded) {
        this.userId = userId;
        this.exerciseId = exerciseId;
        this.completedAt = LocalDateTime.now();
        this.xpAwarded = xpAwarded;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getExerciseId() {
        return exerciseId;
    }

    public void setExerciseId(Long exerciseId) {
        this.exerciseId = exerciseId;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public Long getXpAwarded() {
        return xpAwarded;
    }

    public void setXpAwarded(Long xpAwarded) {
        this.xpAwarded = xpAwarded;
    }
}