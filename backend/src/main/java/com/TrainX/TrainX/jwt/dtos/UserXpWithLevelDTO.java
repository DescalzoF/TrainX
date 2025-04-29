package com.TrainX.TrainX.jwt.dtos;


public class UserXpWithLevelDTO {
    private Long id;
    private Long totalXp;
    private String nameLevel;
    private Long minXp;
    private Long maxXp;

    // Constructor
    public UserXpWithLevelDTO(Long id, Long totalXp, String nameLevel, Long xpMin, Long xpMax) {
        this.id = id;
        this.totalXp = totalXp;
        this.nameLevel = nameLevel;
        this.minXp = xpMin;
        this.maxXp = xpMax;
    }

    // Getters and setters
    public Long getUserId() {
        return id;
    }

    public void setUserId(Long userId) {
        this.id = userId;
    }

    public Long getTotalXp() {
        return totalXp;
    }

    public void setTotalXp(Long totalXp) {
        this.totalXp = totalXp;
    }

    public String getLevelName() {
        return nameLevel;
    }

    public void setLevelName(String levelName) {
        this.nameLevel = levelName;
    }

    public Long getMinXp() {
        return minXp;
    }

    public void setMinXp(Long minXp) {
        this.minXp = minXp;
    }

    public Long getMaxXp() {
        return maxXp;
    }

    public void setMaxXp(Long maxXp) {
        this.maxXp = maxXp;
    }
}