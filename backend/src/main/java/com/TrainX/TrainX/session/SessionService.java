package com.TrainX.TrainX.session;

import com.TrainX.TrainX.User.UserEntity;
import com.TrainX.TrainX.User.UserRepository;
import com.TrainX.TrainX.caminoFitness.CaminoFitnessEntity;
import com.TrainX.TrainX.exercise.ExerciseDTO;
import com.TrainX.TrainX.exercise.ExerciseEntity;
import com.TrainX.TrainX.exercise.ExerciseRepository;
import com.TrainX.TrainX.level.LevelEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class SessionService {

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private SessionExerciseRepository sessionExerciseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ExerciseRepository exerciseRepository;

    @Transactional
    public SessionDTO saveSession(SessionDTO sessionDTO) {
        try {
            // Debug logging
            System.out.println("Processing sessionDTO with ID: " + sessionDTO.getId() +
                    ", Type: " + sessionDTO.getSessionType() +
                    ", UserId: " + sessionDTO.getUserId());

            // Get user from sessionDTO
            Long userId = sessionDTO.getUserId();
            if (userId == null) {
                throw new RuntimeException("User ID is required");
            }

            UserEntity user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

            // Create a new session entity
            SessionEntity sessionEntity = new SessionEntity();
            sessionEntity.setSessionType(sessionDTO.getSessionType());
            sessionEntity.setUser(user);

            // Save the session first to get an ID
            SessionEntity savedSession = sessionRepository.save(sessionEntity);
            System.out.println("Saved session with ID: " + savedSession.getId());

            // Now process each exercise with the session
            if (sessionDTO.getExercises() != null && !sessionDTO.getExercises().isEmpty()) {
                for (SessionExerciseDTO exerciseDTO : sessionDTO.getExercises()) {
                    try {
                        if (exerciseDTO.getExercise() == null || exerciseDTO.getExercise().getId() == null) {
                            System.out.println("Warning: Exercise or exercise ID is null in DTO");
                            continue;
                        }

                        Long exerciseId = exerciseDTO.getExercise().getId();
                        ExerciseEntity exercise = exerciseRepository.findById(exerciseId)
                                .orElseThrow(() -> new RuntimeException("Exercise not found with id: " + exerciseId));

                        SessionExerciseEntity exerciseEntity = new SessionExerciseEntity();
                        exerciseEntity.setSession(savedSession);
                        exerciseEntity.setExercise(exercise);
                        exerciseEntity.setSets(exerciseDTO.getSets() != null ? exerciseDTO.getSets() : 3);
                        exerciseEntity.setReps(exerciseDTO.getReps() != null ? exerciseDTO.getReps() : 10);
                        exerciseEntity.setWeight(exerciseDTO.getWeight() != null ? exerciseDTO.getWeight() : 0.0);
                        exerciseEntity.setXpFitnessReward(exerciseDTO.getXpFitnessReward() != null ?
                                exerciseDTO.getXpFitnessReward() : 0L);

                        sessionExerciseRepository.save(exerciseEntity);
                        savedSession.getExercises().add(exerciseEntity);

                        System.out.println("Added exercise with ID: " + exercise.getId() + " to session");
                    } catch (Exception e) {
                        System.out.println("Error processing exercise: " + e.getMessage());
                        e.printStackTrace();
                    }
                }
            }

            // Save the session again with exercises
            savedSession = sessionRepository.save(savedSession);

            // Convert back to DTO for response
            return convertToDTO(savedSession);
        } catch (Exception e) {
            System.out.println("Error in saveSession: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Transactional
    public List<SessionDTO> generateSessionsForUser(Long userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        CaminoFitnessEntity caminoFitness = user.getCaminoFitnessActual();
        if (caminoFitness == null) {
            throw new RuntimeException("User doesn't have a selected CaminoFitness path");
        }

        // Clear existing sessions
        List<SessionEntity> existingSessions = sessionRepository.findByUser(user);
        sessionRepository.deleteAll(existingSessions);

        // Create session types
        String[] sessionTypes = {
                "Legs",
                "Arms",
                "Chest & Shoulder",
                "Back & Abs",
                "Full Body"
        };

        Map<String, List<ExerciseEntity>> exercisesByMuscleGroup = groupExercisesByMuscleGroup(caminoFitness);

        List<SessionEntity> sessions = new ArrayList<>();

        // Generate sessions
        for (String sessionType : sessionTypes) {
            SessionEntity session = new SessionEntity(sessionType, user);

            // Fetch exercises for this session type
            List<ExerciseEntity> selectedExercises = selectExercisesForSessionType(
                    sessionType, exercisesByMuscleGroup, user.getLevel(), 6);

            // Add exercises to session
            for (ExerciseEntity exercise : selectedExercises) {
                SessionExerciseEntity sessionExercise = new SessionExerciseEntity(
                        session, exercise, 3, 8, exercise.getXpFitnessReward());
                session.addExercise(sessionExercise);
            }

            sessions.add(sessionRepository.save(session));
        }

        // Convert to DTOs
        return sessions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private Map<String, List<ExerciseEntity>> groupExercisesByMuscleGroup(CaminoFitnessEntity caminoFitness) {
        List<ExerciseEntity> allExercises = exerciseRepository.findByCaminoFitness(caminoFitness);

        Map<String, List<ExerciseEntity>> exercisesByGroup = new HashMap<>();

        for (ExerciseEntity exercise : allExercises) {
            String muscleGroup = exercise.getMuscleGroup();
            if (!exercisesByGroup.containsKey(muscleGroup)) {
                exercisesByGroup.put(muscleGroup, new ArrayList<>());
            }
            exercisesByGroup.get(muscleGroup).add(exercise);
        }

        return exercisesByGroup;
    }

    private List<ExerciseEntity> selectExercisesForSessionType(
            String sessionType,
            Map<String, List<ExerciseEntity>> exercisesByMuscleGroup,
            LevelEntity level,
            int count) {

        List<ExerciseEntity> candidates = new ArrayList<>();

        switch (sessionType) {
            case "Legs":
                addExercisesOfGroup(candidates, exercisesByMuscleGroup, "Legs");
                addExercisesOfGroup(candidates, exercisesByMuscleGroup, "Glutes");
                break;
            case "Arms":
                addExercisesOfGroup(candidates, exercisesByMuscleGroup, "Biceps");
                addExercisesOfGroup(candidates, exercisesByMuscleGroup, "Triceps");
                addExercisesOfGroup(candidates, exercisesByMuscleGroup, "Forearms");
                break;
            case "Chest & Shoulder":
                addExercisesOfGroup(candidates, exercisesByMuscleGroup, "Chest");
                addExercisesOfGroup(candidates, exercisesByMuscleGroup, "Shoulders");
                break;
            case "Back & Abs":
                addExercisesOfGroup(candidates, exercisesByMuscleGroup, "Back");
                addExercisesOfGroup(candidates, exercisesByMuscleGroup, "Abs");
                break;
            case "Full Body":
                // Add some from each group
                for (String group : exercisesByMuscleGroup.keySet()) {
                    addExercisesOfGroup(candidates, exercisesByMuscleGroup, group);
                }
                break;
        }

        // Filter by level
        candidates = candidates.stream()
                .filter(e -> e.getLevel().equals(level))
                .collect(Collectors.toList());

        // If we don't have enough exercises, repeat some
        if (candidates.isEmpty()) {
            return new ArrayList<>();
        }

        // Randomly select exercises
        Collections.shuffle(candidates);
        List<ExerciseEntity> selected = new ArrayList<>();
        for (int i = 0; i < Math.min(count, candidates.size()); i++) {
            selected.add(candidates.get(i % candidates.size()));
        }

        return selected;
    }

    private void addExercisesOfGroup(
            List<ExerciseEntity> target,
            Map<String, List<ExerciseEntity>> source,
            String group) {

        if (source.containsKey(group)) {
            target.addAll(source.get(group));
        }
    }

    private SessionDTO convertToDTO(SessionEntity session) {
        SessionDTO dto = new SessionDTO();
        dto.setId(session.getId());
        dto.setSessionType(session.getSessionType());
        dto.setUserId(session.getUser().getId());

        List<SessionExerciseDTO> exerciseDTOs = session.getExercises().stream()
                .map(this::convertToExerciseDTO)
                .collect(Collectors.toList());

        dto.setExercises(exerciseDTOs);
        return dto;
    }

    private SessionExerciseDTO convertToExerciseDTO(SessionExerciseEntity sessionExercise) {
        ExerciseEntity exercise = sessionExercise.getExercise();

        ExerciseDTO exerciseDTO = new ExerciseDTO();
        exerciseDTO.setId(exercise.getId());
        exerciseDTO.setName(exercise.getName());
        exerciseDTO.setDescription(exercise.getDescription());
        exerciseDTO.setMuscleGroup(exercise.getMuscleGroup());
        exerciseDTO.setSets(exercise.getSets());
        exerciseDTO.setReps(exercise.getReps());
        exerciseDTO.setVideoUrl(exercise.getVideoUrl());
        exerciseDTO.setXpFitnessReward(exercise.getXpFitnessReward());

        return new SessionExerciseDTO(
                sessionExercise.getId(),
                exerciseDTO,
                sessionExercise.getSets(),
                sessionExercise.getReps(),
                sessionExercise.getWeight(),
                sessionExercise.getXpFitnessReward()
        );
    }

    @Transactional
    public void updateExerciseWeight(Long sessionExerciseId, Double weight) {
        SessionExerciseEntity sessionExercise = sessionExerciseRepository.findById(sessionExerciseId)
                .orElseThrow(() -> new RuntimeException("Session exercise not found"));

        sessionExercise.setWeight(weight);
        sessionExerciseRepository.save(sessionExercise);
    }

    public List<SessionDTO> getUserSessions(Long userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<SessionEntity> sessions = sessionRepository.findByUser(user);
        return sessions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
}