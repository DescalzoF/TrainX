package com.TrainX.TrainX.caminoFitness;

import com.TrainX.TrainX.User.UserEntity;
import com.TrainX.TrainX.level.LevelEntity;
import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name="caminoFitness")
public class CaminoFitnessEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long idCF;

    @Column(nullable = false)
    private String nameCF;

    @Column(nullable = false, length = 2000)
    private String descriptionCF;

    // Relación con la entidad LevelEntity (un CaminoFitness tiene varios niveles)
    @OneToMany(mappedBy = "caminoFitnessEntity", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<LevelEntity> levels;

    // Relación con la entidad User (cada CaminoFitness pertenece a un Usuario)
    @ManyToOne
    @JoinColumn(name = "user_id") // Asumiendo que tienes una columna "user_id" en tu tabla
    private UserEntity user;

    public CaminoFitnessEntity() {}

    public CaminoFitnessEntity(String nameCF, String descriptionCF) {
        this.nameCF = nameCF;
        this.descriptionCF = descriptionCF;
    }
    public long getIdCF() {
        return idCF;
    }

    public String getNameCF() {
        return nameCF;
    }

    public String getDescriptionCF() {
        return descriptionCF;
    }

    public UserEntity getUser() {
        return user;
    }

    public void setNameCF(String nameCF) {
        this.nameCF = nameCF;
    }

    public void setDescriptionCF(String descriptionCF) {
        this.descriptionCF = descriptionCF;
    }


    public void setUser(UserEntity user) {
        this.user = user;
    }
}
