package com.TrainX.TrainX.User;

public class LoginResponse {
    private String sessionId;
    private Long userId;
    private String username;

    public LoginResponse(String sessionId, Long userId, String username) {
        this.sessionId = sessionId;
        this.userId = userId;
        this.username = username;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
}