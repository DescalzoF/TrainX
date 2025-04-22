package com.TrainX.TrainX.level;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LevelRepository extends JpaRepository<LevelEntity, Long> {
    // Obtener todos los niveles de un camino fitness específico
    List<LevelEntity> findByCaminoFitnessEntity_IdCF(Long id);

    // Obtener un nivel por su nombre (ej. Principiante, Intermedio, etc.)
    LevelEntity findByNameLevel(String nameLevel);
}