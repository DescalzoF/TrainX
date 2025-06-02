package com.TrainX.TrainX.duels;

public class UserDuelWinsDTO {
    private Long userId;
    private Long wins;

    public UserDuelWinsDTO(Long userId, Long wins) {
        this.userId = userId;
        this.wins = wins;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getWins() {
        return wins;
    }

    public void setWins(Long wins) {
        this.wins = wins;
    }
}
