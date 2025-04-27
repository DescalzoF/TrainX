package com.TrainX.TrainX.exercise;

import com.TrainX.TrainX.caminoFitness.CaminoFitnessEntity;
import com.TrainX.TrainX.caminoFitness.CaminoFitnessService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ExerciseService {

    private final ExerciseRepository exerciseRepository;
    private final CaminoFitnessService caminoFitnessService;

    @Autowired
    public ExerciseService(ExerciseRepository exerciseRepository, CaminoFitnessService caminoFitnessService) {
        this.exerciseRepository = exerciseRepository;
        this.caminoFitnessService = caminoFitnessService;
    }

    public List<ExerciseEntity> getAllExercises() {
        return exerciseRepository.findAll();
    }

    public Optional<ExerciseEntity> getExerciseById(Long id) {
        return exerciseRepository.findById(id);
    }

    @Transactional
    public ExerciseEntity createExercise(ExerciseEntity exercise, Long caminoFitnessId) {
        CaminoFitnessEntity caminoFitness = caminoFitnessService.getCaminoFitnessById(caminoFitnessId)
                .orElseThrow(() -> new RuntimeException("Camino Fitness not found with id: " + caminoFitnessId));

        exercise.setCaminoFitness(caminoFitness);
        return exerciseRepository.save(exercise);
    }

    @Transactional
    public ExerciseEntity updateExercise(Long id, ExerciseEntity updatedExercise) {
        Optional<ExerciseEntity> existingExercise = exerciseRepository.findById(id);

        if (existingExercise.isPresent()) {
            ExerciseEntity exercise = existingExercise.get();

            // Solo actualizamos los campos no nulos
            if (updatedExercise.getName() != null) exercise.setName(updatedExercise.getName());
            if (updatedExercise.getDescription() != null) exercise.setDescription(updatedExercise.getDescription());
            if (updatedExercise.getMuscleGroup() != null) exercise.setMuscleGroup(updatedExercise.getMuscleGroup());
            if (updatedExercise.getSets() != null) exercise.setSets(updatedExercise.getSets());
            if (updatedExercise.getReps() != null) exercise.setReps(updatedExercise.getReps());
            if (updatedExercise.getVideoUrl() != null) exercise.setVideoUrl(updatedExercise.getVideoUrl());
            if (updatedExercise.getXpFitnessReward() != 0) exercise.setXpFitnessReward(updatedExercise.getXpFitnessReward());

            // La relación con CaminoFitness no debe cambiar, pero podemos actualizarla si es necesario
            if (updatedExercise.getCaminoFitness() != null) {
                exercise.setCaminoFitness(updatedExercise.getCaminoFitness());
            }

            return exerciseRepository.save(exercise);
        } else {
            throw new RuntimeException("Exercise not found with id: " + id);
        }
    }

    @Transactional
    public void deleteExercise(Long id) {
        if (exerciseRepository.existsById(id)) {
            exerciseRepository.deleteById(id);
        } else {
            throw new RuntimeException("Exercise not found with id: " + id);
        }
    }

    // Método para obtener ejercicios por camino fitness y nombre del nivel
    public List<ExerciseEntity> getExercisesByCaminoAndLevel(long caminoFitnessId, String levelName) {
        return exerciseRepository.findByCaminoFitness_IdCFAndLevel_NameLevel(caminoFitnessId, levelName);
    }

    public List<ExerciseEntity> getExercisesByCaminoFitness(Long caminoFitnessId) {
        return exerciseRepository.findByCaminoFitness_IdCF(caminoFitnessId);
    }
}
