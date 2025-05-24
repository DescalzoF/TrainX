package com.TrainX.TrainX.duels;

import com.TrainX.TrainX.User.UserEntity;
import com.TrainX.TrainX.User.UserRepository;
import com.TrainX.TrainX.exercise.ExerciseEntity;
import com.TrainX.TrainX.exercise.ExerciseRepository;
import com.TrainX.TrainX.level.LevelEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class DuelService {

    private final DuelRepository duelRepository;
    private final DuelDiaryExerciseRepository diaryExerciseRepository;
    private final DuelCompletionRepository completionRepository;
    private final UserRepository userRepository;
    private final ExerciseRepository exerciseRepository;
    private final Random random = new Random();

    @Autowired
    public DuelService(
            DuelRepository duelRepository,
            DuelDiaryExerciseRepository diaryExerciseRepository,
            DuelCompletionRepository completionRepository,
            UserRepository userRepository,
            ExerciseRepository exerciseRepository) {
        this.duelRepository = duelRepository;
        this.diaryExerciseRepository = diaryExerciseRepository;
        this.completionRepository = completionRepository;
        this.userRepository = userRepository;
        this.exerciseRepository = exerciseRepository;
    }

    @Transactional(readOnly = true)
    public List<UserEntity> getUsersInSameLevel(UserEntity currentUser) {
        if (currentUser.getLevel() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "The user doesn't have an assigned level");
        }

        LevelEntity userLevel = currentUser.getLevel();

        // Remove the camino fitness filter and only filter by level
        return userRepository.findByLevel(userLevel)
                .stream()
                .filter(user -> !user.getId().equals(currentUser.getId()))
                .collect(Collectors.toList());
    }

    @Transactional
    public DuelEntity createDuel(UserEntity challenger, Long challengedId, Long betAmount) {
        // Check if user has reached the maximum number of pending challenges
        int pendingChallenges = duelRepository.countPendingChallengesByUser(challenger);
        if (pendingChallenges >= 10) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "You can only have a maximum of 10 pending duel challenges at once");
        }

        // Validate bet amount
        if (betAmount == null) {
            betAmount = 0L; // Default to 0 if not provided
        }

        if (betAmount < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Bet amount cannot be negative");
        }

        if (betAmount > challenger.getCoins()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Bet amount cannot exceed your total coins");
        }

        UserEntity challenged = userRepository.findById(challengedId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Challenged user not found"));

        // Verify that both users have the same level
        if (challenger.getLevel() == null || challenged.getLevel() == null ||
                !challenger.getLevel().getIdLevel().equals(challenged.getLevel().getIdLevel())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Both users must have the same level");
        }

        // Calculate duel dates (next complete week)
        LocalDate today = LocalDate.now();
        LocalDate nextMonday = today.with(TemporalAdjusters.next(DayOfWeek.MONDAY));
        LocalDate nextSunday = nextMonday.plusDays(6);

        // Create the duel
        DuelEntity duel = new DuelEntity();
        duel.setChallenger(challenger);
        duel.setChallenged(challenged);
        duel.setStartDate(nextMonday);
        duel.setEndDate(nextSunday);
        duel.setStatus(DuelStatus.PENDING);
        duel.setChallengerScore(0L);
        duel.setChallengedScore(0L);
        duel.setBetAmount(betAmount);

        // Deduct coins from challenger's account if bet is made
        if (betAmount > 0) {
            challenger.setCoins(challenger.getCoins() - betAmount);
            userRepository.save(challenger);
        }

        DuelEntity savedDuel = duelRepository.save(duel);

        // Generate random exercises for each day of the week
        generateDailyExercises(savedDuel);

        return savedDuel;
    }

    private void generateDailyExercises(DuelEntity duel) {
        // Get start and end date of the duel
        LocalDate startDate = duel.getStartDate();
        LocalDate endDate = duel.getEndDate();

        // Get all exercises from the repository
        List<ExerciseEntity> allExercises = exerciseRepository.findAll();
        if (allExercises.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "No exercises available in the database");
        }

        // Generate an exercise for each day from start to end date
        LocalDate currentDate = startDate;
        while (!currentDate.isAfter(endDate)) {
            // Select a random exercise
            ExerciseEntity randomExercise = allExercises.get(random.nextInt(allExercises.size()));

            // Create diary exercise entity
            DuelDiaryExerciseEntity diaryExercise = new DuelDiaryExerciseEntity();
            diaryExercise.setDuel(duel);
            diaryExercise.setExercise(randomExercise);
            diaryExercise.setDate(currentDate);
            diaryExercise.setDayOfWeek(currentDate.getDayOfWeek());
            diaryExercise.setCompletedByChallenger(false);
            diaryExercise.setCompletedByChallenged(false);

            // Add to duel's exercises list
            duel.getDailyExercises().add(diaryExercise);

            // Move to next day
            currentDate = currentDate.plusDays(1);
        }

        // The diary exercise entities will be persisted when the duel is saved
        // because of CascadeType.ALL on the relationship
    }
    @Transactional
    public void acceptDuel(Long duelId, UserEntity user) {
        DuelEntity duel = duelRepository.findById(duelId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Duel not found"));

        // Verify that the user is the challenged one
        if (!duel.getChallenged().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Only the challenged user can accept the duel");
        }

        // Verify that the duel is pending
        if (duel.getStatus() != DuelStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "The duel is not pending");
        }

        // Check if bet amount is greater than 0
        if (duel.getBetAmount() > 0) {
            // Verify that the user has enough coins to match the bet
            if (user.getCoins() < duel.getBetAmount()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "You don't have enough coins to match the bet");
            }

            // Deduct coins from the challenged user
            user.setCoins(user.getCoins() - duel.getBetAmount());
            userRepository.save(user);
        }

        // Get all other pending duels where the user is either challenger or challenged
        List<DuelEntity> otherPendingDuels = duelRepository.findByUserAndStatus(user, DuelStatus.PENDING)
                .stream()
                .filter(d -> !d.getId().equals(duelId))
                .collect(Collectors.toList());

        // Reject all other pending duels and return bet amounts
        for (DuelEntity pendingDuel : otherPendingDuels) {
            // Return bet coins to the challenger if bet was made
            if (pendingDuel.getBetAmount() > 0) {
                // If the current user is the challenger, return coins to them
                if (pendingDuel.getChallenger().getId().equals(user.getId())) {
                    user.setCoins(user.getCoins() + pendingDuel.getBetAmount());
                } else {
                    // Return coins to the other challenger
                    UserEntity challenger = pendingDuel.getChallenger();
                    challenger.setCoins(challenger.getCoins() + pendingDuel.getBetAmount());
                    userRepository.save(challenger);
                }
            }
            pendingDuel.setStatus(DuelStatus.REJECTED);
            duelRepository.save(pendingDuel);
        }

        // After rejecting all other duels, accept this one
        duel.setStatus(DuelStatus.ACTIVE);
        duelRepository.save(duel);

        // Save the user if their coins were updated
        userRepository.save(user);
    }

    @Transactional
    public void rejectDuel(Long duelId, UserEntity user) {
        DuelEntity duel = duelRepository.findById(duelId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Duel not found"));

        // Verify that the user is the challenged one
        if (!duel.getChallenged().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Only the challenged user can reject the duel");
        }

        // Verify that the duel is pending
        if (duel.getStatus() != DuelStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "The duel is not pending");
        }

        // Return bet coins to the challenger if bet was made
        if (duel.getBetAmount() > 0) {
            UserEntity challenger = duel.getChallenger();
            challenger.setCoins(challenger.getCoins() + duel.getBetAmount());
            userRepository.save(challenger);
        }

        duel.setStatus(DuelStatus.REJECTED);
        duelRepository.save(duel);
    }

    @Transactional(readOnly = true)
    public List<DuelEntity> getPendingDuels(UserEntity user) {
        return duelRepository.findByUserAndStatus(user, DuelStatus.PENDING);
    }

    @Transactional(readOnly = true)
    public List<DuelEntity> getActiveDuels(UserEntity user) {
        return duelRepository.findByUserAndStatus(user, DuelStatus.ACTIVE);
    }

    @Transactional(readOnly = true)
    public List<DuelEntity> getFinishedDuels(UserEntity user) {
        return duelRepository.findByUserAndStatus(user, DuelStatus.FINISHED);
    }

    @Transactional(readOnly = true)
    public DuelDiaryExerciseEntity getTodaysExercise(Long duelId) {
        LocalDate today = LocalDate.now();
        List<DuelDiaryExerciseEntity> diaryExercises =
                diaryExerciseRepository.findByDuelIdAndDate(duelId, today);

        if (diaryExercises.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "No exercise scheduled for today in this duel");
        }

        return diaryExercises.get(0);
    }

    @Transactional
    public void markExerciseAsCompleted(Long duelId, Long diaryExerciseId, UserEntity user) {
        DuelEntity duel = duelRepository.findById(duelId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Duel not found"));

        // Verify that the duel is active
        if (duel.getStatus() != DuelStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "The duel is not active");
        }

        // Verify that the user is part of the duel
        boolean isChallenger = duel.getChallenger().getId().equals(user.getId());
        boolean isChallenged = duel.getChallenged().getId().equals(user.getId());

        if (!isChallenger && !isChallenged) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "The user is not part of this duel");
        }

        DuelDiaryExerciseEntity diaryExercise = diaryExerciseRepository.findById(diaryExerciseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Daily exercise not found"));

        // Verify that the exercise is for today
        if (!diaryExercise.getDate().equals(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "You can only complete today's exercise");
        }

        // Verify that it hasn't been completed already
        if (completionRepository.existsByDiaryExerciseIdAndUserId(diaryExercise.getId(), user.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "This exercise has already been completed by the user");
        }

        // Register the completion
        DuelCompletionEntity completion = new DuelCompletionEntity();
        completion.setDuel(duel);
        completion.setDiaryExercise(diaryExercise);
        completion.setUser(user);
        completionRepository.save(completion);

        // Update the daily exercise status
        if (isChallenger) {
            diaryExercise.setCompletedByChallenger(true);
            duel.setChallengerScore(duel.getChallengerScore() + 1);
        } else {
            diaryExercise.setCompletedByChallenged(true);
            duel.setChallengedScore(duel.getChallengedScore() + 1);
        }

        diaryExerciseRepository.save(diaryExercise);
        duelRepository.save(duel);

        // Check if the duel has ended
        if (duel.getEndDate().isBefore(LocalDate.now()) || duel.getEndDate().equals(LocalDate.now())) {
            duel.setStatus(DuelStatus.FINISHED);
            duelRepository.save(duel);
        }
    }

    @Transactional(readOnly = true)
    public List<DuelDiaryExerciseEntity> getDuelExercises(Long duelId) {
        return diaryExerciseRepository.findByDuelId(duelId);
    }

    @Transactional
    public void checkExpiredDuels() {
        LocalDate today = LocalDate.now();
        List<DuelEntity> activeDuels = duelRepository.findAll().stream()
                .filter(duel -> duel.getStatus() == DuelStatus.ACTIVE)
                .filter(duel -> duel.getEndDate().isBefore(today))
                .collect(Collectors.toList());

        for (DuelEntity duel : activeDuels) {
            duel.setStatus(DuelStatus.FINISHED);

            // Handle bet rewards only if there was a bet
            if (duel.getBetAmount() > 0) {
                // Determine the winner and award the bet amount
                UserEntity winner = duel.getWinner();
                if (winner != null) {
                    // Award twice the bet amount (the winner gets their bet back plus the opponent's bet)
                    Long totalReward = duel.getBetAmount() * 2;
                    winner.setCoins(winner.getCoins() + totalReward);
                    userRepository.save(winner);
                } else {
                    // It's a tie, return the bet to both players
                    UserEntity challenger = duel.getChallenger();
                    UserEntity challenged = duel.getChallenged();

                    challenger.setCoins(challenger.getCoins() + duel.getBetAmount());
                    challenged.setCoins(challenged.getCoins() + duel.getBetAmount());

                    userRepository.save(challenger);
                    userRepository.save(challenged);
                }
            }

            duelRepository.save(duel);
        }
    }

    @Transactional(readOnly = true)
    public DuelEntity getDuelById(Long duelId) {
        return duelRepository.findById(duelId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Duel not found"));
    }

    @Transactional(readOnly = true)
    public DuelDiaryExerciseEntity getDiaryExerciseById(Long exerciseId) {
        return diaryExerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Daily exercise not found"));
    }

    @Transactional
    public void checkExpiredPendingDuels() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        LocalDateTime oneDayAgo = LocalDateTime.now().minusDays(1);

        List<DuelEntity> expiredPendingDuels = duelRepository.findByStatusAndCreatedAtBefore(
                DuelStatus.PENDING, oneDayAgo);

        for (DuelEntity duel : expiredPendingDuels) {
            // Return bet coins to the challenger if bet was made
            if (duel.getBetAmount() > 0) {
                UserEntity challenger = duel.getChallenger();
                challenger.setCoins(challenger.getCoins() + duel.getBetAmount());
                userRepository.save(challenger);
            }

            duel.setStatus(DuelStatus.REJECTED);
            duelRepository.save(duel);
        }
    }
}