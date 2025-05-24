package com.TrainX.TrainX.xpFitness;

import com.TrainX.TrainX.User.UserEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "xp_fitness")
@Getter
@Setter
@NoArgsConstructor
public class XpFitnessEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private UserEntity user;

    @Column(nullable = false)
    private Long totalXp = 0L;

    public XpFitnessEntity(UserEntity user) {
        this.user = user;
        this.totalXp = 0L;
        if (user != null) {
            user.setXpFitnessEntity(this);
        }
    }

    public XpFitnessEntity(UserEntity user, Long initialXp) {
        this(user);
        this.totalXp = initialXp != null ? initialXp : 0L;
    }

    public void setUser(UserEntity user) {
        this.user = user;
        if (user != null && user.getXpFitnessEntity() != this) {
            user.setXpFitnessEntity(this);
        }
    }

    public void addXp(Long xp) {
        if (xp != null) {
            this.totalXp += xp;
        }
    }
}