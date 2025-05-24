package com.TrainX.TrainX.User;

public class UserDuelDTO {
    private Long id;
    private String username;
    private Long totalXp;
    private String caminoFitnessName;

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public Long getTotalXp() {
        return totalXp;
    }
    public void setTotalXp(Long totalXp) {
        this.totalXp = totalXp;
    }
    public String getCaminoFitnessName() {
        return caminoFitnessName;
    }

    public void setCaminoFitnessName(String caminoFitnessName) {
        this.caminoFitnessName = caminoFitnessName;
    }
}

