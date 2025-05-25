package com.TrainX.TrainX.duels;

import lombok.Data;

import java.time.LocalDate;

@Data
public class HistorialDuelDTO {
    private Long id;
    private String challengerUsername;
    private String challengedUsername;
    private LocalDate startDate;
    private LocalDate endDate;
    private Long challengerScore;
    private Long challengedScore;
    private String winnerUsername;
    private Long betAmount;
    private String opponentUsername;
    private boolean wasUserChallenger;
    private boolean userWon;
    private boolean wasTie;
}
