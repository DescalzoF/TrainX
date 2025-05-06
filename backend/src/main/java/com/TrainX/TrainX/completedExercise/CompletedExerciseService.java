package com.TrainX.TrainX.completedExercise;
import com.TrainX.TrainX.exercise.CompletedExerciseEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CompletedExerciseService {

    private final CompletedExerciseRepository completedExerciseRepository;

    @Autowired
    public CompletedExerciseService(CompletedExerciseRepository completedExerciseRepository) {
        this.completedExerciseRepository = completedExerciseRepository;
    }

    /**
     * Get all exercise IDs completed by a user
     */
    public List<Long> getCompletedExerciseIds(Long userId) {
        return completedExerciseRepository.findExerciseIdsByUserId(userId);
    }

    /**
     * Mark an exercise as completed by a user and award XP
     */
    @Transactional
    public void markExerciseAsCompleted(Long userId, Long exerciseId, Long xpAwarded) {
        // Check if already completed
        if (completedExerciseRepository.existsByUserIdAndExerciseId(userId, exerciseId)) {
            // Already completed, nothing to do
            return;
        }

        // Create a new completed exercise record
        CompletedExerciseEntity completedExercise = new CompletedExerciseEntity(userId, exerciseId, xpAwarded);
        completedExerciseRepository.save(completedExercise);

        // Note: XP updating logic is handled in the frontend via XPContext
        // If you want to add XP updating logic here as well, you would need to inject
        // a UserService or XPService to handle updating the user's XP in the database
    }

    /**
     * Get all completed exercises for a user (full records)
     */
    public List<CompletedExerciseEntity> getCompletedExercises(Long userId) {
        return completedExerciseRepository.findByUserId(userId);
    }

    /**
     * Check if a specific exercise is completed by a user
     */
    public boolean isExerciseCompleted(Long userId, Long exerciseId) {
        return completedExerciseRepository.existsByUserIdAndExerciseId(userId, exerciseId);
    }
}