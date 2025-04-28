package com.TrainX.TrainX.session;

import com.TrainX.TrainX.User.UserEntity;
import com.TrainX.TrainX.User.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sessions")
public class SessionController {

    @Autowired
    private SessionService sessionService;

    @Autowired
    private UserService userService;

    @PostMapping("/generate")
    public ResponseEntity<?> generateSessionsForCurrentUser() {
        try {
            // Get current authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            UserEntity currentUser = userService.getUserByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Check if user has a selected camino fitness
            if (currentUser.getCaminoFitnessActual() == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "You must select a fitness path before generating sessions"));
            }

            // Generate sessions
            List<SessionDTO> sessions = sessionService.generateSessionsForUser(currentUser.getId());
            return ResponseEntity.ok(sessions);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error generating sessions: " + e.getMessage()));
        }
    }

    @PostMapping("")
    public ResponseEntity<?> saveSession(@RequestBody SessionDTO sessionDTO) {
        try {
            // Get current authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            UserEntity currentUser = userService.getUserByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Set the user ID explicitly
            sessionDTO.setUserId(currentUser.getId());

            // Log the incoming DTO
            System.out.println("Received session DTO: " + sessionDTO);

            // Save the session
            SessionDTO savedSession = sessionService.saveSession(sessionDTO);
            return ResponseEntity.ok(savedSession);
        } catch (Exception e) {
            // Log the full stack trace
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error saving session: " + e.getMessage()));
        }
    }

    @GetMapping("/user")
    public ResponseEntity<?> getCurrentUserSessions() {
        try {
            // Get current authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            UserEntity currentUser = userService.getUserByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Get sessions
            List<SessionDTO> sessions = sessionService.getUserSessions(currentUser.getId());
            return ResponseEntity.ok(sessions);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error retrieving sessions: " + e.getMessage()));
        }
    }

    @PutMapping("/exercise/{sessionExerciseId}/weight")
    public ResponseEntity<?> updateExerciseWeight(
            @PathVariable Long sessionExerciseId,
            @RequestBody Map<String, Double> request) {
        try {
            Double weight = request.get("weight");
            if (weight == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Weight is required"));
            }

            sessionService.updateExerciseWeight(sessionExerciseId, weight);
            return ResponseEntity.ok(Map.of("message", "Weight updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error updating weight: " + e.getMessage()));
        }
    }
}