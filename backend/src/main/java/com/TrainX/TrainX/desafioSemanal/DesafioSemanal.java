package com.TrainX.TrainX.desafioSemanal;

import com.TrainX.TrainX.User.UserEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "desafios_semanales")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DesafioSemanal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String descripcion;

    @Column(nullable = false)
    private Long valorMonedas;

    @Column(nullable = false)
    private boolean activo;

    @ManyToMany(mappedBy = "desafiosCompletados")
    private Set<UserEntity> usuariosCompletados = new HashSet<>();

    private LocalDateTime fechaCreacion;

    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
    }
}