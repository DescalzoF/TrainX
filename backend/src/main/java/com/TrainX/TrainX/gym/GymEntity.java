package com.TrainX.TrainX.gym;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "gimnasios")
public class GymEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private Double latitud;
    private Double longitud;
    private Integer calificacion;
    private String direccion;

    public GymEntity() {
    }

    public GymEntity(String name, Double latitud, Double longitud, Integer calificacion, String direccion) {
        this.name = name;
        this.latitud = latitud;
        this.longitud = longitud;
        this.calificacion = calificacion;
        this.direccion = direccion;
    }
}
