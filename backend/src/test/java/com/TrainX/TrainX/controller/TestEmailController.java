package com.TrainX.TrainX.controller;

import com.TrainX.TrainX.email.EmailService;
import com.TrainX.TrainX.scheduler.WorkoutReminderScheduler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/email")
public class TestEmailController {

    private final EmailService emailService;
    private final WorkoutReminderScheduler workoutReminderScheduler;

    @Autowired
    public TestEmailController(EmailService emailService, WorkoutReminderScheduler workoutReminderScheduler) {
        this.emailService = emailService;
        this.workoutReminderScheduler = workoutReminderScheduler;
    }

    @PostMapping("/test-reminder")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> testReminderEmail(@RequestParam String email, @RequestParam String username) {
        try {
            emailService.sendSimpleWorkoutReminder(email, username);
            return ResponseEntity.ok("Test reminder email sent successfully to: " + email);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to send email: " + e.getMessage());
        }
    }

    @PostMapping("/trigger-scheduler")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> triggerScheduler() {
        try {
            workoutReminderScheduler.triggerManualReminder();
            return ResponseEntity.ok("Workout reminder scheduler triggered manually");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to trigger scheduler: " + e.getMessage());
        }
    }
}