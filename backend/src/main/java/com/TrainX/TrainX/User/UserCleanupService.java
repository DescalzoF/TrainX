package com.TrainX.TrainX.User;

import com.TrainX.TrainX.User.UserRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class UserCleanupService {

    private final UserRepository userRepository;

    public UserCleanupService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Scheduled(fixedRate = 600000) // Ejecuta cada 10 minutos (600000 ms)
    @Transactional
    public void deleteExpiredUnverifiedUsers() {
        try {
            int deletedCount = userRepository.deleteByIsVerifiedFalseAndVerificationTokenExpiresIsBefore(
                    LocalDateTime.now()
            );

            if (deletedCount > 0) {
                System.out.println("Deleted " + deletedCount + " expired unverified users");
            }
        } catch (Exception e) {
            System.err.println("Error cleaning up expired users: " + e.getMessage());
        }
    }
}