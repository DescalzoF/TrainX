package com.TrainX.TrainX.customexercise;

import com.TrainX.TrainX.User.UserEntity;
import com.TrainX.TrainX.User.UserRepository;
import com.TrainX.TrainX.caminoFitness.CaminoFitnessEntity;
import com.TrainX.TrainX.caminoFitness.CaminoFitnessService;
import com.TrainX.TrainX.exercise.ExerciseDTO;
import com.TrainX.TrainX.exercise.ExerciseEntity;
import com.TrainX.TrainX.exercise.ExerciseService;
import com.TrainX.TrainX.level.LevelEntity;
import com.TrainX.TrainX.level.LevelService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserCustomService {

    private final UserCustomRepository userCustomRepository;
    private final UserRepository userRepository;
    private final ExerciseService exerciseService;
    private final CaminoFitnessService caminoFitnessService;
    private final LevelService levelService;

    @Autowired
    public UserCustomService(UserCustomRepository userCustomRepository,
                             UserRepository userRepository,
                             ExerciseService exerciseService,
                             CaminoFitnessService caminoFitnessService,
                             LevelService levelService) {
        this.userCustomRepository = userCustomRepository;
        this.userRepository = userRepository;
        this.exerciseService = exerciseService;
        this.caminoFitnessService = caminoFitnessService;
        this.levelService = levelService;
    }

    // Get all custom exercises for a user
    public List<UserCustomExerciseDTO> getUserCustomExercises(Long userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with ID: " + userId));

        List<UserCustomExerciseEntity> exercises = userCustomRepository.findByUser(user);
        return exercises.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // Get a specific custom exercise
    public UserCustomExerciseDTO getUserCustomExerciseById(Long userId, Long exerciseId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with ID: " + userId));

        UserCustomExerciseEntity exercise = userCustomRepository.findByUserAndId(user, exerciseId);
        if (exercise == null) {
            throw new EntityNotFoundException("Custom exercise not found with ID: " + exerciseId);
        }

        return convertToDTO(exercise);
    }

    // Save an exercise from the standard exercises as a custom exercise for a user
    @Transactional
    public UserCustomExerciseDTO saveExerciseForUser(Long userId, Long exerciseId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with ID: " + userId));

        Optional<ExerciseEntity> exerciseOpt = exerciseService.getExerciseById(exerciseId);
        if (exerciseOpt.isEmpty()) {
            throw new EntityNotFoundException("Exercise not found with ID: " + exerciseId);
        }

        ExerciseEntity exercise = exerciseOpt.get();

        UserCustomExerciseEntity customExercise = new UserCustomExerciseEntity(
                user,
                exercise.getName(),
                exercise.getDescription(),
                exercise.getMuscleGroup(),
                exercise.getSets(),
                exercise.getReps(),
                exercise.getVideoUrl(),
                exercise.getWeight(),
                exercise.getXpFitnessReward(),
                exercise.getCaminoFitness(),
                exercise.getLevel()
        );

        UserCustomExerciseEntity savedExercise = userCustomRepository.save(customExercise);
        return convertToDTO(savedExercise);
    }

    // Create a new custom exercise
    @Transactional
    public UserCustomExerciseDTO createCustomExercise(Long userId, UserCustomExerciseDTO exerciseDTO) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with ID: " + userId));

        CaminoFitnessEntity caminoFitness = caminoFitnessService.getCaminoFitnessById(exerciseDTO.getCaminoFitnessId())
                .orElseThrow(() -> new EntityNotFoundException("Camino Fitness not found with ID: " + exerciseDTO.getCaminoFitnessId()));

        LevelEntity level = levelService.getLevelById(exerciseDTO.getLevelId())
                .orElseThrow(() -> new EntityNotFoundException("Level not found with ID: " + exerciseDTO.getLevelId()));

        UserCustomExerciseEntity customExercise = new UserCustomExerciseEntity(
                user,
                exerciseDTO.getName(),
                exerciseDTO.getDescription(),
                exerciseDTO.getMuscleGroup(),
                exerciseDTO.getSets(),
                exerciseDTO.getReps(),
                exerciseDTO.getVideoUrl(),
                exerciseDTO.getWeight(),
                exerciseDTO.getXpFitnessReward(),
                caminoFitness,
                level
        );

        UserCustomExerciseEntity savedExercise = userCustomRepository.save(customExercise);
        return convertToDTO(savedExercise);
    }

    // Update an existing custom exercise
    @Transactional
    public UserCustomExerciseDTO updateCustomExercise(Long userId, Long exerciseId, UserCustomExerciseDTO exerciseDTO) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with ID: " + userId));

        UserCustomExerciseEntity existingExercise = userCustomRepository.findByUserAndId(user, exerciseId);
        if (existingExercise == null) {
            throw new EntityNotFoundException("Custom exercise not found with ID: " + exerciseId);
        }

        // Update the properties
        if (exerciseDTO.getName() != null) existingExercise.setName(exerciseDTO.getName());
        if (exerciseDTO.getDescription() != null) existingExercise.setDescription(exerciseDTO.getDescription());
        if (exerciseDTO.getMuscleGroup() != null) existingExercise.setMuscleGroup(exerciseDTO.getMuscleGroup());
        if (exerciseDTO.getSets() != null) existingExercise.setSets(exerciseDTO.getSets());
        if (exerciseDTO.getReps() != null) existingExercise.setReps(exerciseDTO.getReps());
        if (exerciseDTO.getVideoUrl() != null) existingExercise.setVideoUrl(exerciseDTO.getVideoUrl());
        if (exerciseDTO.getWeight() != null) existingExercise.setWeight(exerciseDTO.getWeight());
        if (exerciseDTO.getXpFitnessReward() != null) existingExercise.setXpFitnessReward(exerciseDTO.getXpFitnessReward());

        // Update related entities if provided
        if (exerciseDTO.getCaminoFitnessId() != null) {
            CaminoFitnessEntity caminoFitness = caminoFitnessService.getCaminoFitnessById(exerciseDTO.getCaminoFitnessId())
                    .orElseThrow(() -> new EntityNotFoundException("Camino Fitness not found with ID: " + exerciseDTO.getCaminoFitnessId()));
            existingExercise.setCaminoFitness(caminoFitness);
        }

        if (exerciseDTO.getLevelId() != null) {
            LevelEntity level = levelService.getLevelById(exerciseDTO.getLevelId())
                    .orElseThrow(() -> new EntityNotFoundException("Level not found with ID: " + exerciseDTO.getLevelId()));
            existingExercise.setLevel(level);
        }

        UserCustomExerciseEntity updatedExercise = userCustomRepository.save(existingExercise);
        return convertToDTO(updatedExercise);
    }

    // Delete a custom exercise
    @Transactional
    public void deleteCustomExercise(Long userId, Long exerciseId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with ID: " + userId));

        UserCustomExerciseEntity exercise = userCustomRepository.findByUserAndId(user, exerciseId);
        if (exercise == null) {
            throw new EntityNotFoundException("Custom exercise not found with ID: " + exerciseId);
        }

        userCustomRepository.delete(exercise);
    }

    // Get custom exercises by camino fitness
    public List<UserCustomExerciseDTO> getUserCustomExercisesByCaminoFitness(Long userId, Long caminoFitnessId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with ID: " + userId));

        CaminoFitnessEntity caminoFitness = caminoFitnessService.getCaminoFitnessById(caminoFitnessId)
                .orElseThrow(() -> new EntityNotFoundException("Camino Fitness not found with ID: " + caminoFitnessId));

        List<UserCustomExerciseEntity> exercises = userCustomRepository.findByUserAndCaminoFitness(user, caminoFitness);
        return exercises.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // Get custom exercises by level
    public List<UserCustomExerciseDTO> getUserCustomExercisesByLevel(Long userId, Long levelId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with ID: " + userId));

        LevelEntity level = levelService.getLevelById(levelId)
                .orElseThrow(() -> new EntityNotFoundException("Level not found with ID: " + levelId));

        List<UserCustomExerciseEntity> exercises = userCustomRepository.findByUserAndLevel(user, level);
        return exercises.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // Get custom exercises by muscle group
    public List<UserCustomExerciseDTO> getUserCustomExercisesByMuscleGroup(Long userId, String muscleGroup) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with ID: " + userId));

        List<UserCustomExerciseEntity> exercises = userCustomRepository.findByUserAndMuscleGroup(user, muscleGroup);
        return exercises.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // Helper method to convert an entity to DTO
    private UserCustomExerciseDTO convertToDTO(UserCustomExerciseEntity entity) {
        return new UserCustomExerciseDTO(
                entity.getId(),
                entity.getUser().getId(),
                entity.getName(),
                entity.getDescription(),
                entity.getMuscleGroup(),
                entity.getSets(),
                entity.getReps(),
                entity.getVideoUrl(),
                entity.getWeight(),
                entity.getXpFitnessReward(),
                entity.getCaminoFitness().getIdCF(),
                entity.getLevel().getIdLevel()
        );
    }
}