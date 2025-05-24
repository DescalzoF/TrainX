package com.TrainX.TrainX.exerciseCompletion;

/**
 * DTO for returning exercise completion statistics to the frontend
 */
public class ExerciseCompletionStatisticsDTO {
    private Long totalXp;
    private Integer totalCompletions;
    private Double averageWeight;
    private String favoriteExercise;

    // Default constructor
    public ExerciseCompletionStatisticsDTO() {
    }

    // Parameterized constructor
    public ExerciseCompletionStatisticsDTO(Long totalXp, Integer totalCompletions,
                                           Double averageWeight, String favoriteExercise) {
        this.totalXp = totalXp;
        this.totalCompletions = totalCompletions;
        this.averageWeight = averageWeight;
        this.favoriteExercise = favoriteExercise;
    }

    // Getters and setters
    public Long getTotalXp() {
        return totalXp;
    }

    public void setTotalXp(Long totalXp) {
        this.totalXp = totalXp;
    }

    public Integer getTotalCompletions() {
        return totalCompletions;
    }

    public void setTotalCompletions(Integer totalCompletions) {
        this.totalCompletions = totalCompletions;
    }

    public Double getAverageWeight() {
        return averageWeight;
    }

    public void setAverageWeight(Double averageWeight) {
        this.averageWeight = averageWeight;
    }

    public String getFavoriteExercise() {
        return favoriteExercise;
    }

    public void setFavoriteExercise(String favoriteExercise) {
        this.favoriteExercise = favoriteExercise;
    }
}