package com.TrainX.TrainX.duels;

import lombok.Data;

import java.time.LocalDate;

@Data
public class DuelResponseDTO {
    private Long id;
    private Long challengerId;
    private String challengerUsername;
    private Long challengedId;
    private String challengedUsername;
    private LocalDate startDate;
    private LocalDate endDate;
    private DuelStatus status;
    private Long challengerScore;
    private Long challengedScore;
    private String winnerUsername;
    private Long betAmount;
}
