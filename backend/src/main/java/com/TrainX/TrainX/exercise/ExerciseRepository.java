package com.TrainX.TrainX.exercise;

import com.TrainX.TrainX.caminoFitness.CaminoFitnessEntity;
import com.TrainX.TrainX.level.LevelEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ExerciseRepository extends JpaRepository<ExerciseEntity, Long> {
    // Método para obtener ejercicios por CaminoFitness y nivel
    List<ExerciseEntity> findByCaminoFitness_NameCFAndLevel_NameLevel(String nameCF, String nameLevel);

    // Método para obtener ejercicios por camino fitness (con ID) y nivel
    List<ExerciseEntity> findByCaminoFitness_IdCFAndLevel_NameLevel(Long idCF, String nameLevel);

    public List<ExerciseEntity> findByCaminoFitness_IdCF(Long idCF);

    List<ExerciseEntity> findByCaminoFitnessAndLevel(CaminoFitnessEntity caminoFitness, LevelEntity level);

    List<ExerciseEntity> findByCaminoFitness_IdCFAndLevel_IdLevel(Long caminoFitnessId, Long levelId);

    List<ExerciseEntity> findByCaminoFitness(CaminoFitnessEntity caminoFitness);

    List<ExerciseEntity> findByLevel_IdLevel(Long levelId);
}
