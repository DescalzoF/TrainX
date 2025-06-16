package com.TrainX.TrainX.desafioSemanal;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DesafioSemanalDTO {
    private Long id;
    private String descripcion;
    private Long valorMonedas;
    private boolean activo;

    public DesafioSemanalDTO() {
    }

    public DesafioSemanalDTO(Long id, String descripcion, Long valorMonedas, boolean activo) {
        this.id = id;
        this.descripcion = descripcion;
        this.valorMonedas = valorMonedas;
        this.activo = activo;
    }
}