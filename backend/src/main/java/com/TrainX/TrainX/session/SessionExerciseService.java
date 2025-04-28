package com.TrainX.TrainX.session;

import com.TrainX.TrainX.User.UserEntity;
import com.TrainX.TrainX.xpFitness.XpFitnessEntity;
import com.TrainX.TrainX.xpFitness.XpFitnessRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SessionExerciseService {

    private final SessionExerciseRepository sessionExerciseRepository;
    private final XpFitnessRepository xpFitnessRepository;

    @Autowired
    public SessionExerciseService(SessionExerciseRepository sessionExerciseRepository,
                                  XpFitnessRepository xpFitnessRepository) {
        this.sessionExerciseRepository = sessionExerciseRepository;
        this.xpFitnessRepository = xpFitnessRepository;
    }

    @Transactional
    public void completeExercise(Long sessionExerciseId) {
        SessionExerciseEntity sessionExercise = sessionExerciseRepository.findById(sessionExerciseId)
                .orElseThrow(() -> new RuntimeException("Session exercise not found"));

        // Get XP reward from the exercise
        Long xpReward = sessionExercise.getXpFitnessReward();

        if (xpReward != null && xpReward > 0) {
            // Get the user from the session
            UserEntity user = sessionExercise.getSession().getUser();

            // Add XP to user's XP fitness entity
            XpFitnessEntity xpFitness = user.getXpFitnessEntity();
            if (xpFitness != null) {
                xpFitness.addXp(xpReward);
                xpFitnessRepository.save(xpFitness);
            }
        }
    }
}