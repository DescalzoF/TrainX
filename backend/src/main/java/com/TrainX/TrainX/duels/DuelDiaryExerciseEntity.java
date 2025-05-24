package com.TrainX.TrainX.duels;
import com.TrainX.TrainX.exercise.ExerciseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.DayOfWeek;
import java.time.LocalDate;

@Entity
@Table(name = "duel_diary_exercises")
@Getter
@Setter
@NoArgsConstructor
public class DuelDiaryExerciseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "duel_id")
    private DuelEntity duel;

    @ManyToOne
    @JoinColumn(name = "exercise_id")
    private ExerciseEntity exercise;

    @Column(nullable = false)
    private LocalDate date;

    @Enumerated(EnumType.STRING)
    private DayOfWeek dayOfWeek;

    @Column
    private Boolean completedByChallenger = false;

    @Column
    private Boolean completedByChallenged = false;
}