package com.TrainX.TrainX.duels;

public class CheckExpiredDuelsResponseDTO {
    private String message;

    public CheckExpiredDuelsResponseDTO(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
