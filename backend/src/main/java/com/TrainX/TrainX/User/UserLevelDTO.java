
package com.TrainX.TrainX.User;

public class UserLevelDTO {
    private Long userId;
    private Long currentXP;
    private String levelName;
    private Long levelMinXP;
    private Long levelMaxXP;

    public UserLevelDTO(Long userId, Long currentXP, String levelName, Long levelMinXP, Long levelMaxXP) {
        this.userId = userId;
        this.currentXP = currentXP;
        this.levelName = levelName;
        this.levelMinXP = levelMinXP;
        this.levelMaxXP = levelMaxXP;
    }

    // Getters
    public Long getUserId() {
        return userId;
    }

    public Long getCurrentXP() {
        return currentXP;
    }

    public String getLevelName() {
        return levelName;
    }

    public Long getLevelMinXP() {
        return levelMinXP;
    }

    public Long getLevelMaxXP() {
        return levelMaxXP;
    }

    // Progress percentage for frontend display
    public int getProgressPercentage() {
        if (levelMaxXP - levelMinXP == 0) {
            return 100;
        }
        return (int)(((currentXP - levelMinXP) * 100) / (levelMaxXP - levelMinXP));
    }
}
