package com.TrainX.TrainX.exercise;

import com.TrainX.TrainX.caminoFitness.CaminoFitnessEntity;
import com.TrainX.TrainX.caminoFitness.CaminoFitnessService;
import com.TrainX.TrainX.level.LevelEntity;
import com.TrainX.TrainX.level.LevelService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ExerciseService {

    private final ExerciseRepository exerciseRepository;
    private final CaminoFitnessService caminoFitnessService;
    private final LevelService levelService;

    @Autowired
    public ExerciseService(ExerciseRepository exerciseRepository, CaminoFitnessService caminoFitnessService, LevelService levelService) {
        this.exerciseRepository = exerciseRepository;
        this.caminoFitnessService = caminoFitnessService;
        this.levelService = levelService;
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

    public List<ExerciseDTO> findExercisesByCaminoFitnessAndLevel(Long caminoFitnessId, Long levelId) {
        // Registrar los parámetros de entrada para depuración
        System.out.println("Buscando ejercicios para CaminoFitnessId: " + caminoFitnessId + ", LevelId: " + levelId);

        try {
            // Verificar si los IDs son válidos
            if (caminoFitnessId == null || levelId == null) {
                System.err.println("CaminoFitnessId o LevelId son nulos");
                return new ArrayList<>();
            }

            // Obtener los ejercicios por caminoFitnessId y levelId
            List<ExerciseEntity> exercises = exerciseRepository.findByCaminoFitness_IdCFAndLevel_IdLevel(caminoFitnessId, levelId);

            // Registrar la cantidad de ejercicios encontrados
            System.out.println("Se encontraron " + exercises.size() + " ejercicios");

            // Convertir entidades a DTOs
            return exercises.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            // Registrar cualquier excepción que ocurra
            System.err.println("Error al buscar ejercicios: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }
    private ExerciseDTO convertToDTO(ExerciseEntity entity) {
        ExerciseDTO dto = new ExerciseDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setMuscleGroup(entity.getMuscleGroup());
        dto.setSets(entity.getSets());
        dto.setReps(entity.getReps());
        dto.setVideoUrl(entity.getVideoUrl());
        dto.setXpFitnessReward(entity.getXpFitnessReward());
        return dto;
    }
}
