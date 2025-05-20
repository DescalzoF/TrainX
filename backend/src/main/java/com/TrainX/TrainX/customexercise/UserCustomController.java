package com.TrainX.TrainX.customexercise;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.TrainX.TrainX.User.UserEntity;

import jakarta.persistence.EntityNotFoundException;

import java.util.List;

@RestController
@RequestMapping("/api/user/custom-exercises")
public class UserCustomController {

    private final UserCustomService userCustomService;

    @Autowired
    public UserCustomController(UserCustomService userCustomService) {
        this.userCustomService = userCustomService;
    }

    // Get all custom exercises for the authenticated user
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<UserCustomExerciseDTO>> getUserCustomExercises(Authentication authentication) {
        UserEntity user = (UserEntity) authentication.getPrincipal();
        List<UserCustomExerciseDTO> exercises = userCustomService.getUserCustomExercises(user.getId());
        return ResponseEntity.ok(exercises);
    }

    // Get a specific custom exercise by ID
    @GetMapping("/{exerciseId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserCustomExerciseDTO> getUserCustomExerciseById(
            Authentication authentication,
            @PathVariable Long exerciseId) {
        UserEntity user = (UserEntity) authentication.getPrincipal();
        try {
            UserCustomExerciseDTO exercise = userCustomService.getUserCustomExerciseById(user.getId(), exerciseId);
            return ResponseEntity.ok(exercise);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Save an exercise from standard exercises to user's custom exercises
    @PostMapping("/save/{exerciseId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserCustomExerciseDTO> saveExerciseForUser(
            Authentication authentication,
            @PathVariable Long exerciseId) {
        UserEntity user = (UserEntity) authentication.getPrincipal();
        try {
            UserCustomExerciseDTO savedExercise = userCustomService.saveExerciseForUser(user.getId(), exerciseId);
            return new ResponseEntity<>(savedExercise, HttpStatus.CREATED);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Create a new custom exercise
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserCustomExerciseDTO> createCustomExercise(
            Authentication authentication,
            @RequestBody UserCustomExerciseDTO exerciseDTO) {
        UserEntity user = (UserEntity) authentication.getPrincipal();
        try {
            UserCustomExerciseDTO createdExercise = userCustomService.createCustomExercise(user.getId(), exerciseDTO);
            return new ResponseEntity<>(createdExercise, HttpStatus.CREATED);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Update an existing custom exercise
    @PutMapping("/{exerciseId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserCustomExerciseDTO> updateCustomExercise(
            Authentication authentication,
            @PathVariable Long exerciseId,
            @RequestBody UserCustomExerciseDTO exerciseDTO) {
        UserEntity user = (UserEntity) authentication.getPrincipal();
        try {
            UserCustomExerciseDTO updatedExercise = userCustomService.updateCustomExercise(user.getId(), exerciseId, exerciseDTO);
            return ResponseEntity.ok(updatedExercise);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Delete a custom exercise
    @DeleteMapping("/{exerciseId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteCustomExercise(
            Authentication authentication,
            @PathVariable Long exerciseId) {
        UserEntity user = (UserEntity) authentication.getPrincipal();
        try {
            userCustomService.deleteCustomExercise(user.getId(), exerciseId);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Get custom exercises by camino fitness
    @GetMapping("/camino/{caminoFitnessId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<UserCustomExerciseDTO>> getUserCustomExercisesByCaminoFitness(
            Authentication authentication,
            @PathVariable Long caminoFitnessId) {
        UserEntity user = (UserEntity) authentication.getPrincipal();
        try {
            List<UserCustomExerciseDTO> exercises = userCustomService.getUserCustomExercisesByCaminoFitness(
                    user.getId(), caminoFitnessId);
            return exercises.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(exercises);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Get custom exercises by level
    @GetMapping("/level/{levelId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<UserCustomExerciseDTO>> getUserCustomExercisesByLevel(
            Authentication authentication,
            @PathVariable Long levelId) {
        UserEntity user = (UserEntity) authentication.getPrincipal();
        try {
            List<UserCustomExerciseDTO> exercises = userCustomService.getUserCustomExercisesByLevel(
                    user.getId(), levelId);
            return exercises.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(exercises);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Get custom exercises by muscle group
    @GetMapping("/muscle-group/{muscleGroup}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<UserCustomExerciseDTO>> getUserCustomExercisesByMuscleGroup(
            Authentication authentication,
            @PathVariable String muscleGroup) {
        UserEntity user = (UserEntity) authentication.getPrincipal();
        List<UserCustomExerciseDTO> exercises = userCustomService.getUserCustomExercisesByMuscleGroup(
                user.getId(), muscleGroup);
        return exercises.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(exercises);
    }
}