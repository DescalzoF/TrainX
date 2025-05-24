package com.TrainX.TrainX.exerciseCompletion;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class ExtendedExerciseCompletionStatisticsDTO {
    private Double maxWeightLifted;
    private String mostFrequentDay;
    private Integer longestStreak;
    private Integer totalSessions;
    private Double averageRepsPerSet;
    private Integer currentStreak;
    private Integer weeklyGoalProgress; // Percentage of weekly exercise goal completion
    private Map<String, Integer> weeklyActivity; // Map of day -> number of exercises
    private List<WeeklyPerformanceDTO> weeklyPerformance; // Performance trend data
    private List<RecentActivityDTO> recentActivity; // Recent exercise completions
}
