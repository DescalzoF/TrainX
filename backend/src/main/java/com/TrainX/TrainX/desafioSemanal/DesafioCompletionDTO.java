package com.TrainX.TrainX.desafioSemanal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DesafioCompletionDTO {
    private Long desafioId;
    private String descripcion;
    private Long valorMonedas;
    private LocalDateTime fechaCompletado;
    private LocalDateTime fechaDesbloqueo;
    private Long horasRestantes;
}