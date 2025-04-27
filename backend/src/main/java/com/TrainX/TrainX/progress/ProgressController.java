package com.TrainX.TrainX.progress;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/progress")
public class ProgressController {

    @Autowired
    private ProgressService progressService;

    /**
     * Get weekly progress data for a user
     */
    @GetMapping("/weekly/{userId}")
    public ResponseEntity<WeekProgressDTO> getWeeklyProgress(@PathVariable Long userId) {
        try {
            WeekProgressDTO weekProgress = progressService.getWeeklyProgress(userId);
            return ResponseEntity.ok(weekProgress);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get monthly progress data for a user
     */
    @GetMapping("/monthly/{userId}")
    public ResponseEntity<MonthProgressDTO> getMonthlyProgress(@PathVariable Long userId) {
        try {
            MonthProgressDTO monthProgress = progressService.getMonthlyProgress(userId);
            return ResponseEntity.ok(monthProgress);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Record a completed workout session
     */
    @PostMapping("/record-session")
    public ResponseEntity<WorkoutSessionEntity> recordWorkoutSession(
            @RequestBody WorkoutSessionEntity session) {
        try {
            WorkoutSessionEntity savedSession = progressService.saveWorkoutSession(session);
            return ResponseEntity.ok(savedSession);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get a specific workout session by ID
     */
    @GetMapping("/session/{sessionId}")
    public ResponseEntity<WorkoutSessionEntity> getWorkoutSession(@PathVariable Long sessionId) {
        try {
            WorkoutSessionEntity session = progressService.getSessionById(sessionId);
            return ResponseEntity.ok(session);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get all workout sessions for a user
     */
    @GetMapping("/sessions/user/{userId}")
    public ResponseEntity<?> getUserWorkoutSessions(@PathVariable Long userId) {
        try {
            return ResponseEntity.ok(progressService.getUserSessions(userId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Delete a workout session
     */
    @DeleteMapping("/session/{sessionId}")
    public ResponseEntity<?> deleteWorkoutSession(@PathVariable Long sessionId) {
        try {
            progressService.deleteSession(sessionId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Update a workout session
     */
    @PutMapping("/session/{sessionId}")
    public ResponseEntity<WorkoutSessionEntity> updateWorkoutSession(
            @PathVariable Long sessionId,
            @RequestBody WorkoutSessionEntity session) {
        try {
            session.setId(sessionId); // Ensure the ID is set correctly
            WorkoutSessionEntity updatedSession = progressService.updateSession(session);
            return ResponseEntity.ok(updatedSession);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}