package com.TrainX.TrainX.leaderboards;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LeaderboardGeneralDTO {
    private Long userId;
    private String username;
    private String profilePictureUrl;
    private String caminoFitnessName;
    private String levelName;
    private Long totalXp;
    private Integer currentStreak;
    private String mostFrequentDay;          // Día más frecuente de entrenamiento
    private Integer totalSessions;           // Total de sesiones completadas
}
