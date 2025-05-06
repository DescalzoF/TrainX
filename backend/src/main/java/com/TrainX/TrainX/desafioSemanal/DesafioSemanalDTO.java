package com.TrainX.TrainX.desafioSemanal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DesafioSemanalDTO {
    private Long id;
    private String descripcion;
    private Long valorMonedas;
    private boolean completado;
    private LocalDateTime fechaCompletado;
    private Long tiempoRestanteHoras;
}