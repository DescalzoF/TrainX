package com.TrainX.TrainX.xpFitness;

public class UserXpDTO {
    private Long userId;
    private Long totalXp;

    // Constructors
    public UserXpDTO() {}

    public UserXpDTO(Long userId, Long totalXp) {
        this.userId = userId;
        this.totalXp = totalXp;
    }

    // Getters and setters
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getTotalXp() {
        return totalXp;
    }

    public void setTotalXp(Long totalXp) {
        this.totalXp = totalXp;
    }
}