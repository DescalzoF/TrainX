package com.TrainX.TrainX.progress;

import java.util.List;

class MonthProgressDTO {
    private long totalWeight;
    private int totalReps;
    private int totalSets;
    private long totalXp;
    private List<WeeklyProgressDTO> weeklyProgress;

    public MonthProgressDTO(long totalWeight, int totalReps, int totalSets, long totalXp,
                            List<WeeklyProgressDTO> weeklyProgress) {
        this.totalWeight = totalWeight;
        this.totalReps = totalReps;
        this.totalSets = totalSets;
        this.totalXp = totalXp;
        this.weeklyProgress = weeklyProgress;
    }

    // Getters and setters
    public long getTotalWeight() {
        return totalWeight;
    }

    public void setTotalWeight(long totalWeight) {
        this.totalWeight = totalWeight;
    }

    public int getTotalReps() {
        return totalReps;
    }

    public void setTotalReps(int totalReps) {
        this.totalReps = totalReps;
    }

    public int getTotalSets() {
        return totalSets;
    }

    public void setTotalSets(int totalSets) {
        this.totalSets = totalSets;
    }

    public long getTotalXp() {
        return totalXp;
    }

    public void setTotalXp(long totalXp) {
        this.totalXp = totalXp;
    }

    public List<WeeklyProgressDTO> getWeeklyProgress() {
        return weeklyProgress;
    }

    public void setWeeklyProgress(List<WeeklyProgressDTO> weeklyProgress) {
        this.weeklyProgress = weeklyProgress;
    }
}
