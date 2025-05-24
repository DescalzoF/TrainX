package com.TrainX.TrainX.duels;

import lombok.Data;

@Data
public class DuelChallengeRequestDTO {
    private Long challengedUserId;
    private Long betAmount;
}