package com.TrainX.TrainX.exercise;

import com.TrainX.TrainX.caminoFitness.CaminoFitnessEntity;
import com.TrainX.TrainX.level.LevelEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ExerciseRepository extends JpaRepository<ExerciseEntity, Long> {
    List<ExerciseEntity> findByCaminoFitnessIdCF(Long caminoFitnessId);
    List<ExerciseEntity> findByCaminoFitnessAndLevel(CaminoFitnessEntity caminoFitness, LevelEntity level);

}