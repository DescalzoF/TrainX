package com.TrainX.TrainX.progress;

import java.util.List;

class WeekProgressDTO {
    private long totalWeight;
    private int totalReps;
    private int totalSets;
    private long totalXp;
    private List<DailyProgressDTO> dailyProgress;

    public WeekProgressDTO(long totalWeight, int totalReps, int totalSets, long totalXp,
                           List<DailyProgressDTO> dailyProgress) {
        this.totalWeight = totalWeight;
        this.totalReps = totalReps;
        this.totalSets = totalSets;
        this.totalXp = totalXp;
        this.dailyProgress = dailyProgress;
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

    public List<DailyProgressDTO> getDailyProgress() {
        return dailyProgress;
    }

    public void setDailyProgress(List<DailyProgressDTO> dailyProgress) {
        this.dailyProgress = dailyProgress;
    }
}

