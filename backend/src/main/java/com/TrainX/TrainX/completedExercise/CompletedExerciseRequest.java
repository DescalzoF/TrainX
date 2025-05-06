package com.TrainX.TrainX.completedExercise;
public class CompletedExerciseRequest {
    private Long userId;
    private Long exerciseId;
    private Long xpFitnessReward;

    // Constructors
    public CompletedExerciseRequest() {
    }

    public CompletedExerciseRequest(Long userId, Long exerciseId, Long xpFitnessReward) {
        this.userId = userId;
        this.exerciseId = exerciseId;
        this.xpFitnessReward = xpFitnessReward;
    }

    // Getters and Setters
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getExerciseId() {
        return exerciseId;
    }

    public void setExerciseId(Long exerciseId) {
        this.exerciseId = exerciseId;
    }

    public Long getXpFitnessReward() {
        return xpFitnessReward;
    }

    public void setXpFitnessReward(Long xpFitnessReward) {
        this.xpFitnessReward = xpFitnessReward;
    }
}