package com.TrainX.TrainX.session;

import com.TrainX.TrainX.User.UserEntity;
import com.TrainX.TrainX.exercise.ExerciseEntity;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sessions")
public class SessionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String sessionType; // "Legs", "Arms", "Chest & Shoulder", "Back & Abs", "Full Body"

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SessionExerciseEntity> exercises = new ArrayList<>();

    public SessionEntity() {
    }

    public SessionEntity(String sessionType, UserEntity user) {
        this.sessionType = sessionType;
        this.user = user;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public String getSessionType() {
        return sessionType;
    }

    public void setSessionType(String sessionType) {
        this.sessionType = sessionType;
    }

    public UserEntity getUser() {
        return user;
    }

    public void setUser(UserEntity user) {
        this.user = user;
    }

    public List<SessionExerciseEntity> getExercises() {
        return exercises;
    }

    public void setExercises(List<SessionExerciseEntity> exercises) {
        this.exercises = exercises;
    }

    public void addExercise(SessionExerciseEntity exercise) {
        exercises.add(exercise);
        exercise.setSession(this);
    }

    public void removeExercise(SessionExerciseEntity exercise) {
        exercises.remove(exercise);
        exercise.setSession(null);
    }
}