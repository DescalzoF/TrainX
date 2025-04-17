package com.TrainX.TrainX.caminoFitness;

import jakarta.persistence.*;

@Entity
@Table(name="caminoFitness")
public class CaminoFitnessEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long idCF;

    @Column(nullable = false)
    private String nameCF;

    @Column(nullable = false)
    private String descriptionCF;

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

    public void setNameCF(String nameCF) {
        this.nameCF = nameCF;
    }

    public void setDescriptionCF(String descriptionCF) {
        this.descriptionCF = descriptionCF;
    }
}
