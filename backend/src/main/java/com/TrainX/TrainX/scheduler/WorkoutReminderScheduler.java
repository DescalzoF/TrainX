package com.TrainX.TrainX.scheduler;

import com.TrainX.TrainX.User.UserEntity;
import com.TrainX.TrainX.User.UserRepository;
import com.TrainX.TrainX.email.EmailService;
import com.TrainX.TrainX.exerciseCompletion.ExerciseCompletionEntity;
import com.TrainX.TrainX.exerciseCompletion.ExerciseCompletionRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Component
@Slf4j
public class WorkoutReminderScheduler {

    private final UserRepository userRepository;
    private final ExerciseCompletionRepository exerciseCompletionRepository;
    private final EmailService emailService;

    @Autowired
    public WorkoutReminderScheduler(
            UserRepository userRepository,
            ExerciseCompletionRepository exerciseCompletionRepository,
            EmailService emailService) {
        this.userRepository = userRepository;
        this.exerciseCompletionRepository = exerciseCompletionRepository;
        this.emailService = emailService;
    }

    // Run every day at 10:00 AM
    @Scheduled(cron = "0 0 10 * * ?")
    public void sendWorkoutReminders() {
        sendWorkoutReminders(false);
    }

    // Enhanced method that can handle both scheduled and manual triggers
    public void sendWorkoutReminders(boolean isManualTrigger) {
        log.info("Starting workout reminder scheduler task... (Manual trigger: {})", isManualTrigger);

        try {
            List<UserEntity> allUsers = userRepository.findAll();
            int emailsSent = 0;
            int eligibleUsers = 0;

            for (UserEntity user : allUsers) {
                boolean shouldSend = isManualTrigger || shouldSendReminderToUser(user);

                if (shouldSend) {
                    eligibleUsers++;
                    try {
                        emailService.sendWorkoutReminderEmail(user.getEmail(), user.getUsername(), isManualTrigger);
                        emailsSent++;
                        log.info("Sent workout reminder to user: {} ({}) - Manual: {}",
                                user.getUsername(), user.getEmail(), isManualTrigger);
                    } catch (Exception e) {
                        log.error("Failed to send workout reminder to user: {} ({}). Error: {}",
                                user.getUsername(), user.getEmail(), e.getMessage());
                    }
                }
            }

            if (isManualTrigger) {
                log.info("Manual workout reminder completed. Total users: {}, Emails sent: {}",
                        allUsers.size(), emailsSent);
            } else {
                log.info("Scheduled workout reminder completed. Eligible users: {}, Emails sent: {}",
                        eligibleUsers, emailsSent);
            }

        } catch (Exception e) {
            log.error("Error in workout reminder scheduler: {}", e.getMessage(), e);
        }
    }

    private boolean shouldSendReminderToUser(UserEntity user) {
        try {
            // Get user's exercise completions
            List<ExerciseCompletionEntity> userCompletions =
                    exerciseCompletionRepository.findByUserId(user.getId());

            // If user has never completed any exercises, don't send reminder
            if (userCompletions.isEmpty()) {
                log.debug("User {} has no exercise completions, skipping reminder", user.getUsername());
                return false;
            }

            // Find the most recent completion
            Optional<ExerciseCompletionEntity> latestCompletion = userCompletions.stream()
                    .max((c1, c2) -> c1.getCompletedAt().compareTo(c2.getCompletedAt()));

            LocalDateTime lastCompletionTime = latestCompletion.get().getCompletedAt();
            LocalDateTime oneWeekAgo = LocalDateTime.now().minusWeeks(1);

            // Check if last completion was more than a week ago
            boolean shouldSend = lastCompletionTime.isBefore(oneWeekAgo);

            if (shouldSend) {
                log.info("User {} last worked out on: {}, should send reminder",
                        user.getUsername(), lastCompletionTime);
            } else {
                log.debug("User {} last worked out on: {}, too recent for reminder",
                        user.getUsername(), lastCompletionTime);
            }

            return shouldSend;

        } catch (Exception e) {
            log.error("Error checking if should send reminder to user {}: {}",
                    user.getUsername(), e.getMessage());
            return false;
        }
    }

    // Method to manually trigger reminders for all users (regardless of conditions)
    public void triggerManualReminderForAll() {
        log.info("Manually triggering workout reminder for ALL users...");
        sendWorkoutReminders(true);
    }

    // Method to manually trigger normal conditional reminders (for testing)
    public void triggerManualReminderConditional() {
        log.info("Manually triggering conditional workout reminder scheduler...");
        sendWorkoutReminders(false);
    }

    // Method to send reminder to a specific user (useful for testing)
    public void sendReminderToSpecificUser(String email) {
        try {
            Optional<UserEntity> userOpt = userRepository.findByEmail(email);
            if (userOpt.isPresent()) {
                UserEntity user = userOpt.get();
                emailService.sendWorkoutReminderEmail(user.getEmail(), user.getUsername(), true);
                log.info("Manual reminder sent to specific user: {} ({})", user.getUsername(), user.getEmail());
            } else {
                log.warn("User with email {} not found", email);
            }
        } catch (Exception e) {
            log.error("Error sending reminder to specific user {}: {}", email, e.getMessage());
        }
    }
}