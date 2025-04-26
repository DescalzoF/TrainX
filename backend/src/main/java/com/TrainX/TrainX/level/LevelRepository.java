package com.TrainX.TrainX.level;

import com.TrainX.TrainX.level.LevelEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface LevelRepository extends JpaRepository<LevelEntity, Long> {

    // 1) Todos los niveles asociados a un CaminoFitness (por idCF)
    List<LevelEntity> findByCaminos_IdCF(Long idCF);

    // 2) Nivel por su nombre y el CaminoFitness al que pertenece
    Optional<LevelEntity> findByNameLevelAndCaminos_IdCF(String nameLevel, Long idCF);

    // 3) Todos los niveles con un nombre determinado (independiente de camino)
    List<LevelEntity> findByNameLevel(String nameLevel);

    Optional<LevelEntity> findByXpMinLessThanEqualAndXpMaxGreaterThanEqual(Long xpMin, Long xpMax);


}
