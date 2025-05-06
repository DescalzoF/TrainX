package com.TrainX.TrainX.exercise;

import com.TrainX.TrainX.completedExercise.CompletedExerciseRequest;
import com.TrainX.TrainX.completedExercise.CompletedExerciseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/exercises")
public class ExerciseController {

    private final ExerciseService exerciseService;
    private final CompletedExerciseService completedExerciseService;

    @Autowired
    public ExerciseController(ExerciseService exerciseService, CompletedExerciseService completedExerciseService) {
        this.exerciseService = exerciseService;
        this.completedExerciseService = completedExerciseService;
    }

    @GetMapping
    public ResponseEntity<List<ExerciseEntity>> getAllExercises() {
        List<ExerciseEntity> exercises = exerciseService.getAllExercises();
        return ResponseEntity.ok(exercises);
    }

    @GetMapping("/camino/{caminoFitnessId}")
    public ResponseEntity<List<ExerciseEntity>> getExercisesByCaminoFitness(@PathVariable Long caminoFitnessId) {
        List<ExerciseEntity> exercises = exerciseService.getExercisesByCaminoFitness(caminoFitnessId);
        return ResponseEntity.ok(exercises);
    }

    // Endpoint nuevo para obtener ejercicios por caminoFitnessId y levelName
    @GetMapping("/camino/{caminoFitnessId}/level/{levelName}")
    public ResponseEntity<List<ExerciseEntity>> getExercisesByCaminoAndLevel(
            @PathVariable Long caminoFitnessId,
            @PathVariable String levelName) {
        List<ExerciseEntity> exercises = exerciseService.getExercisesByCaminoAndLevel(caminoFitnessId, levelName);
        return exercises.isEmpty()
                ? ResponseEntity.noContent().build()
                : ResponseEntity.ok(exercises);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExerciseEntity> getExerciseById(@PathVariable Long id) {
        Optional<ExerciseEntity> exercise = exerciseService.getExerciseById(id);
        return exercise.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/camino/{caminoFitnessId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ExerciseEntity> createExercise(
            @RequestBody ExerciseEntity exercise,
            @PathVariable Long caminoFitnessId) {
        ExerciseEntity createdExercise = exerciseService.createExercise(exercise, caminoFitnessId);
        return new ResponseEntity<>(createdExercise, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @userSecurity.isExerciseOwner(authentication, #id)")
    public ResponseEntity<ExerciseEntity> updateExercise(
            @PathVariable Long id,
            @RequestBody ExerciseEntity exercise) {
        try {
            ExerciseEntity updatedExercise = exerciseService.updateExercise(id, exercise);
            return ResponseEntity.ok(updatedExercise);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteExercise(@PathVariable Long id) {
        try {
            exerciseService.deleteExercise(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{caminoFitnessId}/{levelId}")
    public ResponseEntity<List<ExerciseDTO>> getExercisesByPathVariables(
            @PathVariable Long caminoFitnessId,
            @PathVariable Long levelId) {

        System.out.println("Endpoint /{caminoFitnessId}/{levelId} llamado con caminoFitnessId=" + caminoFitnessId + ", levelId=" + levelId);

        List<ExerciseDTO> exercises = exerciseService.findExercisesByCaminoFitnessAndLevel(caminoFitnessId, levelId);

        if (exercises.isEmpty()) {
            System.out.println("No se encontraron ejercicios para estos parámetros");
            return ResponseEntity.noContent().build();
        } else {
            System.out.println("Se encontraron " + exercises.size() + " ejercicios");
            return ResponseEntity.ok(exercises);
        }
    }

    // New endpoint to get completed exercises for a user
    @GetMapping("/completed")
    public ResponseEntity<List<Long>> getCompletedExercises(@RequestParam Long userId) {
        List<Long> completedExerciseIds = completedExerciseService.getCompletedExerciseIds(userId);
        return ResponseEntity.ok(completedExerciseIds);
    }

    // New endpoint to mark an exercise as completed
    @PostMapping("/complete")
    public ResponseEntity<?> completeExercise(@RequestBody CompletedExerciseRequest request) {
        try {
            completedExerciseService.markExerciseAsCompleted(
                    request.getUserId(),
                    request.getExerciseId(),
                    request.getXpFitnessReward()
            );
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}