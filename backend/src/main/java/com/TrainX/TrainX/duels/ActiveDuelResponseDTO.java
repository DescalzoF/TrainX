package com.TrainX.TrainX.duels;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class ActiveDuelResponseDTO {
    private boolean hasActiveDuel;
    private DuelResponseDTO duel;
}
