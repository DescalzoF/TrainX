package com.TrainX.TrainX.leaderboards;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class LeaderboardSemanalDTO {
    private Long userId;
    private String username;
    private String userPhoto; // Opcional, si quieres mostrar la foto
    private Integer weeklyXp; // XP total ganado en la semana actual
    private Integer weeklyExercisesCompleted; // Total de ejercicios/sesiones en la semana actual (opcional, buen dato para el leaderboard)
    private Double totalWeight;
    private String levelName;
    private Integer totalWeeklyReps; // Total de repeticiones en la semana actual
    // Puedes añadir más campos si consideras relevantes otras métricas semanales
}
