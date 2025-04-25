package com.TrainX.TrainX.exercise;

import com.TrainX.TrainX.caminoFitness.CaminoFitnessEntity;
import com.TrainX.TrainX.caminoFitness.CaminoFitnessService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.access.prepost.PreAuthorize;

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

    public List<ExerciseEntity> getExercisesByCaminoFitness(Long caminoFitnessId) {
        return exerciseRepository.findByCaminoFitnessIdCF(caminoFitnessId);
    }

    public Optional<ExerciseEntity> getExerciseById(Long id) {
        return exerciseRepository.findById(id);
    }

    public ExerciseEntity createExercise(ExerciseEntity exercise, Long caminoFitnessId) {
        CaminoFitnessEntity caminoFitness = caminoFitnessService.getCaminoFitnessById(caminoFitnessId)
                .orElseThrow(() -> new RuntimeException("Camino Fitness not found with id: " + caminoFitnessId));

        exercise.setCaminoFitness(caminoFitness);
        return exerciseRepository.save(exercise);
    }

    public ExerciseEntity updateExercise(Long id, ExerciseEntity updatedExercise) {
        Optional<ExerciseEntity> existingExercise = exerciseRepository.findById(id);

        if (existingExercise.isPresent()) {
            ExerciseEntity exercise = existingExercise.get();
            exercise.setName(updatedExercise.getName());
            exercise.setDescription(updatedExercise.getDescription());
            exercise.setMuscleGroup(updatedExercise.getMuscleGroup());
            exercise.setSets(updatedExercise.getSets());
            exercise.setReps(updatedExercise.getReps());

            // Keep the existing caminoFitness association
            return exerciseRepository.save(exercise);
        } else {
            throw new RuntimeException("Exercise not found with id: " + id);
        }
    }

    public void deleteExercise(Long id) {
        if (exerciseRepository.existsById(id)) {
            exerciseRepository.deleteById(id);
        } else {
            throw new RuntimeException("Exercise not found with id: " + id);
        }
    }
}
