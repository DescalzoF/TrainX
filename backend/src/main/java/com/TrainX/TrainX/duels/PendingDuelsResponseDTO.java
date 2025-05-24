package com.TrainX.TrainX.duels;

import lombok.Data;
import java.util.List;

@Data
public class PendingDuelsResponseDTO {
    private List<DuelResponseDTO> pendingDuels;
    private Integer pendingRequestsCount;
}
