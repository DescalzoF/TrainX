package com.TrainX.TrainX.gym;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GymDTO {
    private Long id;
    private String name;
    private Double latitud;
    private Double longitud;
    private Integer calificacion;
    private String direccion;

    public GymDTO() {
    }

    public GymDTO(String name, Double latitud, Double longitud, Integer calificacion, String direccion) {
        this.name = name;
        this.latitud = latitud;
        this.longitud = longitud;
        this.calificacion = calificacion;
        this.direccion = direccion;
    }
}