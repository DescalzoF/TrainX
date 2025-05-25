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
        log.info("Starting workout reminder scheduler task...");

        try {
            List<UserEntity> allUsers = userRepository.findAll();
            int emailsSent = 0;

            for (UserEntity user : allUsers) {
                if (shouldSendReminderToUser(user)) {
                    try {
                        emailService.sendSimpleWorkoutReminder(user.getEmail(), user.getUsername());
                        emailsSent++;
                        log.info("Sent workout reminder to user: {} ({})", user.getUsername(), user.getEmail());
                    } catch (Exception e) {
                        log.error("Failed to send workout reminder to user: {} ({}). Error: {}",
                                user.getUsername(), user.getEmail(), e.getMessage());
                    }
                }
            }

            log.info("Workout reminder scheduler completed. Emails sent: {}", emailsSent);

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
                return false;
            }

            // Find the most recent completion
            Optional<ExerciseCompletionEntity> latestCompletion = userCompletions.stream()
                    .max((c1, c2) -> c1.getCompletedAt().compareTo(c2.getCompletedAt()));

            if (latestCompletion.isPresent()) {
                LocalDateTime lastCompletionTime = latestCompletion.get().getCompletedAt();
                LocalDateTime oneWeekAgo = LocalDateTime.now().minusWeeks(1);

                // Check if last completion was more than a week ago
                boolean shouldSend = lastCompletionTime.isBefore(oneWeekAgo);

                if (shouldSend) {
                    log.info("User {} last worked out on: {}, should send reminder",
                            user.getUsername(), lastCompletionTime);
                }

                return shouldSend;
            }

            return false;

        } catch (Exception e) {
            log.error("Error checking if should send reminder to user {}: {}",
                    user.getUsername(), e.getMessage());
            return false;
        }
    }

    // Optional: Method to manually trigger the scheduler (for testing)
    public void triggerManualReminder() {
        log.info("Manually triggering workout reminder scheduler...");
        sendWorkoutReminders();
    }
}