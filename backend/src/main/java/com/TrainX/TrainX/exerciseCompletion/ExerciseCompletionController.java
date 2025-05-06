package com.TrainX.TrainX.exerciseCompletion;

import com.TrainX.TrainX.User.UserEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/exercise-completions")
public class ExerciseCompletionController {

    private final ExerciseCompletionService exerciseCompletionService;

    @Autowired
    public ExerciseCompletionController(ExerciseCompletionService exerciseCompletionService) {
        this.exerciseCompletionService = exerciseCompletionService;
    }

    @PostMapping
    public ResponseEntity<?> completeExercise(
            @AuthenticationPrincipal UserEntity currentUser,
            @RequestBody ExerciseCompletionDTO completionDTO) {

        ExerciseCompletionEntity completion = exerciseCompletionService.completeExercise(
                currentUser.getId(),
                completionDTO.getExerciseId(),
                completionDTO.getSets(),
                completionDTO.getReps(),
                completionDTO.getWeight()
        );

        Map<String, Object> response = new HashMap<>();
        response.put("id", completion.getId());
        response.put("xpReward", completion.getXpReward());
        response.put("completedAt", completion.getCompletedAt());

        return ResponseEntity.ok(response);
    }

    /**
     * Get all exercise completions for the current user
     * This endpoint is needed for the Progress component
     */
    @GetMapping("/me")
    public ResponseEntity<List<ExerciseCompletionResponseDTO>> getUserCompletions(
            @AuthenticationPrincipal UserEntity currentUser) {

        List<ExerciseCompletionEntity> completions =
                exerciseCompletionService.getUserCompletions(currentUser.getId());

        List<ExerciseCompletionResponseDTO> responseDTOs = completions.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responseDTOs);
    }

    /**
     * Helper method to convert entity to response DTO
     */
    private ExerciseCompletionResponseDTO convertToResponseDTO(ExerciseCompletionEntity completion) {
        ExerciseCompletionResponseDTO dto = new ExerciseCompletionResponseDTO();
        dto.setId(completion.getId());
        dto.setExerciseId(completion.getExercise().getId());
        dto.setExerciseName(completion.getExercise().getName());
        dto.setSets(completion.getSets());
        dto.setReps(completion.getReps());
        dto.setWeight(completion.getWeight());
        dto.setXpReward(completion.getXpReward());
        dto.setCompletedAt(completion.getCompletedAt());
        return dto;
    }

    /**
     * Get exercise completion statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getExerciseCompletionStats(
            @AuthenticationPrincipal UserEntity currentUser) {

        Map<String, Object> stats = exerciseCompletionService.getCompletionStats(currentUser.getId());
        return ResponseEntity.ok(stats);
    }
}
