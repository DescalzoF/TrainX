package com.TrainX.TrainX.customexercise;

import com.TrainX.TrainX.User.UserEntity;
import com.TrainX.TrainX.caminoFitness.CaminoFitnessEntity;
import com.TrainX.TrainX.level.LevelEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserCustomRepository extends JpaRepository<UserCustomExerciseEntity, Long> {
    List<UserCustomExerciseEntity> findByUser(UserEntity user);

    List<UserCustomExerciseEntity> findByUserId(Long userId);

    UserCustomExerciseEntity findByUserAndId(UserEntity user, Long exerciseId);

    List<UserCustomExerciseEntity> findByUserAndCaminoFitness(UserEntity user, CaminoFitnessEntity caminoFitness);

    List<UserCustomExerciseEntity> findByUserAndLevel(UserEntity user, LevelEntity level);

    List<UserCustomExerciseEntity> findByUserAndMuscleGroup(UserEntity user, String muscleGroup);

    List<UserCustomExerciseEntity> findByUserAndCaminoFitnessAndLevel(UserEntity user, CaminoFitnessEntity caminoFitness, LevelEntity level);
}