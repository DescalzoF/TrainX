package com.TrainX.TrainX.progress;

class DailyProgressDTO {
    private String day;
    private long weight;
    private int reps;
    private int sets;
    private long xp;

    public DailyProgressDTO(String day, long weight, int reps, int sets, long xp) {
        this.day = day;
        this.weight = weight;
        this.reps = reps;
        this.sets = sets;
        this.xp = xp;
    }

    // Getters and setters
    public String getDay() {
        return day;
    }

    public void setDay(String day) {
        this.day = day;
    }

    public long getWeight() {
        return weight;
    }

    public void setWeight(long weight) {
        this.weight = weight;
    }

    public int getReps() {
        return reps;
    }

    public void setReps(int reps) {
        this.reps = reps;
    }

    public int getSets() {
        return sets;
    }

    public void setSets(int sets) {
        this.sets = sets;
    }

    public long getXp() {
        return xp;
    }

    public void setXp(long xp) {
        this.xp = xp;
    }
}
