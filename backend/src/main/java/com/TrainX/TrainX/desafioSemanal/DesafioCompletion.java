package com.TrainX.TrainX.desafioSemanal;

import com.TrainX.TrainX.User.UserEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "desafio_completions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DesafioCompletion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private UserEntity usuario;

    @ManyToOne
    @JoinColumn(name = "desafio_id", nullable = false)
    private DesafioSemanal desafio;

    @Column(nullable = false)
    private LocalDateTime fechaCompletado;

    @PrePersist
    protected void onCreate() {
        fechaCompletado = LocalDateTime.now();
    }
}