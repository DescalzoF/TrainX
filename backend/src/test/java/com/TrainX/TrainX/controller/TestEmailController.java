package com.TrainX.TrainX.controller;

import com.TrainX.TrainX.email.EmailService;
import com.TrainX.TrainX.scheduler.WorkoutReminderScheduler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/email")
public class TestEmailController {

    private final EmailService emailService;
    private final WorkoutReminderScheduler workoutReminderScheduler;

    @Autowired
    public TestEmailController(EmailService emailService, WorkoutReminderScheduler workoutReminderScheduler) {
        this.emailService = emailService;
        this.workoutReminderScheduler = workoutReminderScheduler;
    }

    @GetMapping("/test")
    public ResponseEntity<String> testEndpoint() {
        System.out.println("Test endpoint called successfully");
        return ResponseEntity.ok("Controller is working!");
    }

    @PostMapping("/test-reminder")
    public ResponseEntity<String> testReminderEmail(@RequestParam String email, @RequestParam String username) {
        try {
            emailService.sendWorkoutReminderEmail(email, username);
            return ResponseEntity.ok("Test reminder email sent successfully to: " + email);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to send email: " + e.getMessage());
        }
    }

    @PostMapping("/trigger-scheduler")
    public ResponseEntity<String> triggerScheduler() {
        try {
            workoutReminderScheduler.triggerManualReminder();
            return ResponseEntity.ok("Workout reminder scheduler triggered manually");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to trigger scheduler: " + e.getMessage());
        }
    }
}