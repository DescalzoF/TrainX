package com.TrainX.TrainX.session;

import com.TrainX.TrainX.User.UserEntity;
import com.TrainX.TrainX.User.UserRepository;
import com.TrainX.TrainX.caminoFitness.CaminoFitnessEntity;
import com.TrainX.TrainX.exercise.ExerciseDTO;
import com.TrainX.TrainX.exercise.ExerciseEntity;
import com.TrainX.TrainX.exercise.ExerciseRepository;
import com.TrainX.TrainX.level.LevelEntity;
import com.TrainX.TrainX.xpFitness.XpFitnessEntity;
import com.TrainX.TrainX.xpFitness.XpFitnessRepository;
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
    private UserRepository userRepository;

    @Autowired
    private ExerciseRepository exerciseRepository;

    public List<SessionDTO> generateSessionsForUser(Long userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        CaminoFitnessEntity caminoFitness = user.getCaminoFitnessActual();
        if (caminoFitness == null) {
            throw new RuntimeException("User doesn't have a selected CaminoFitness path");
        }

        // Clear existing sessions
        if (!user.getSessions().isEmpty()) {
            user.getSessions().clear();
            userRepository.save(user);
        }

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
            user.addSession(session);

            // Fetch exercises for this session type
            List<ExerciseEntity> selectedExercises = selectExercisesForSessionType(
                    sessionType, exercisesByMuscleGroup, user.getLevel(), 6);

            // Add exercises to session
            for (ExerciseEntity exercise : selectedExercises) {
                SessionExerciseEntity sessionExercise = new SessionExerciseEntity(
                        session, exercise, 3, 8,exercise.getXpFitnessReward());
                session.addExercise(sessionExercise);
            }

            sessions.add(session);
        }

        userRepository.save(user);

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

        List<SessionExerciseDTO> exerciseDTOs = session.getExercises().stream()
                .map(this::convertToExerciseDTO)
                .collect(Collectors.toList());

        dto.setExercises(exerciseDTOs);
        return dto;
    }

    private SessionExerciseDTO convertToExerciseDTO(SessionExerciseEntity sessionExercise) {
        ExerciseDTO exerciseDTO = new ExerciseDTO(
                sessionExercise.getExercise().getName(),
                sessionExercise.getExercise().getDescription(),
                sessionExercise.getExercise().getMuscleGroup(),
                sessionExercise.getExercise().getSets(),
                sessionExercise.getExercise().getReps(),
                sessionExercise.getExercise().getVideoUrl(),
                sessionExercise.getExercise().getXpFitnessReward()
        );

        return new SessionExerciseDTO(
                sessionExercise.getId(),
                exerciseDTO,
                sessionExercise.getSets(),
                sessionExercise.getReps(),
                sessionExercise.getWeight(),
                sessionExercise.getXpFitnessReward()
        );
    }

    public void updateExerciseWeight(Long sessionExerciseId, Double weight) {
        SessionExerciseEntity sessionExercise = sessionRepository.findExerciseById(sessionExerciseId)
                .orElseThrow(() -> new RuntimeException("Session exercise not found"));

        sessionExercise.setWeight(weight);
        sessionRepository.saveExercise(sessionExercise);
    }

    public List<SessionDTO> getUserSessions(Long userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return user.getSessions().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

}