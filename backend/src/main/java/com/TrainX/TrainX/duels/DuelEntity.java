package com.TrainX.TrainX.duels;

import com.TrainX.TrainX.User.UserEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "duels")
@Getter
@Setter
@NoArgsConstructor
public class DuelEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "challenger_id")
    private UserEntity challenger;

    @ManyToOne
    @JoinColumn(name = "challenged_id")
    private UserEntity challenged;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    private DuelStatus status;

    @OneToMany(mappedBy = "duel", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DuelDiaryExerciseEntity> dailyExercises = new ArrayList<>();

    @Column
    private Long challengerScore = 0L;

    @Column
    private Long challengedScore = 0L;

    @Column(nullable = false)
    private Long betAmount = 0L;


    public UserEntity getWinner() {
        if (status != DuelStatus.FINISHED) return null;

        if (challengerScore > challengedScore) return challenger;
        else if (challengedScore > challengerScore) return challenged;
        else return null; // tie
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}