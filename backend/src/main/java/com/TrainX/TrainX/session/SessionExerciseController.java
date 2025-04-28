package com.TrainX.TrainX.session;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/session-exercises")
public class SessionExerciseController {

    private final SessionExerciseService sessionExerciseService;

    @Autowired
    public SessionExerciseController(SessionExerciseService sessionExerciseService) {
        this.sessionExerciseService = sessionExerciseService;
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<String> completeExercise(@PathVariable("id") Long sessionExerciseId) {
        sessionExerciseService.completeExercise(sessionExerciseId);
        return ResponseEntity.ok("Exercise completed and XP rewarded successfully");
    }
}
