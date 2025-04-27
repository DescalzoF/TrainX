package com.TrainX.TrainX.xpFitness;

import com.TrainX.TrainX.User.UserEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "xp_fitness")
public class XpFitnessEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Ahora la FK vive aquí, apuntando a users
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private UserEntity user;

    @Column(nullable = false)
    private Long totalXp = 0L;

    // Constructors
    public XpFitnessEntity() {
        // Default constructor for JPA
    }

    public XpFitnessEntity(UserEntity user) {
        this.user = user;
        this.totalXp = 0L;
        // establecer relación bidireccional
        if (user != null) {
            user.setXpFitnessEntity(this);
        }
    }

    public XpFitnessEntity(UserEntity user, Long initialXp) {
        this(user);
        this.totalXp = initialXp != null ? initialXp : 0L;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public UserEntity getUser() {
        return user;
    }

    public void setUser(UserEntity user) {
        this.user = user;
        if (user != null && user.getXpFitnessEntity() != this) {
            user.setXpFitnessEntity(this);
        }
    }

    public Long getTotalXp() {
        return totalXp;
    }

    public void setTotalXp(Long totalXp) {
        this.totalXp = totalXp != null ? totalXp : 0L;
    }

    public void addXp(Long xp) {
        if (xp != null) {
            this.totalXp += xp;
        }
    }
}