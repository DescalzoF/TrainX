package com.TrainX.TrainX.duels;

import com.TrainX.TrainX.User.UserEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "duel_completion")
@Getter
@Setter
@NoArgsConstructor
public class DuelCompletionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "duel_id")
    private DuelEntity duel;

    @ManyToOne
    @JoinColumn(name = "diary_exercise_id")
    private DuelDiaryExerciseEntity diaryExercise;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private UserEntity user;

    @Column(nullable = false)
    private LocalDateTime completedAt;

    @PrePersist
    protected void onCreate() {
        completedAt = LocalDateTime.now();
    }
}