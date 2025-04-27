package com.TrainX.TrainX.progress;

import com.TrainX.TrainX.User.UserEntity;
import com.TrainX.TrainX.User.UserRepository;
import com.TrainX.TrainX.xpFitness.XpFitnessEntity;
import com.TrainX.TrainX.xpFitness.XpFitnessRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.time.temporal.WeekFields;
import java.util.*;

@Service
public class ProgressService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private XpFitnessRepository xpFitnessRepository;

    @Autowired
    private WorkoutSessionRepository workoutSessionRepository;

    /**
     * Get weekly progress data for a user
     */
    public WeekProgressDTO getWeeklyProgress(Long userId) {
        // Validate user exists
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Get current week's start and end dates
        LocalDate today = LocalDate.now();
        LocalDate startOfWeek = today.with(DayOfWeek.MONDAY);
        LocalDate endOfWeek = today.with(DayOfWeek.SUNDAY);

        // Fetch workout sessions for this week
        List<WorkoutSessionEntity> weekSessions = workoutSessionRepository
                .findByUserIdAndCompletedDateBetween(userId, startOfWeek, endOfWeek);

        // Create daily breakdowns
        Map<DayOfWeek, DailyProgressDTO> dailyBreakdown = new HashMap<>();

        // Initialize all days of the week
        for (DayOfWeek day : DayOfWeek.values()) {
            dailyBreakdown.put(day, new DailyProgressDTO(day.toString(), 0L, 0, 0, 0L));
        }

        // Calculate daily totals from sessions
        long totalWeight = 0;
        int totalReps = 0;
        int totalSets = 0;
        long totalXp = 0;

        for (WorkoutSessionEntity session : weekSessions) {
            DayOfWeek sessionDay = session.getCompletedDate().getDayOfWeek();
            DailyProgressDTO dayProgress = dailyBreakdown.get(sessionDay);

            // Update daily stats
            dayProgress.setWeight(dayProgress.getWeight() + session.getTotalWeight());
            dayProgress.setReps(dayProgress.getReps() + session.getTotalReps());
            dayProgress.setSets(dayProgress.getSets() + session.getTotalSets());
            dayProgress.setXp(dayProgress.getXp() + session.getXpEarned());

            // Update totals
            totalWeight += session.getTotalWeight();
            totalReps += session.getTotalReps();
            totalSets += session.getTotalSets();
            totalXp += session.getXpEarned();
        }

        // Build sorted daily progress list
        List<DailyProgressDTO> dailyProgress = new ArrayList<>();
        for (int i = 1; i <= 7; i++) {
            DayOfWeek day = DayOfWeek.of(i);
            dailyProgress.add(dailyBreakdown.get(day));
        }

        // Create and return the weekly progress response
        return new WeekProgressDTO(
                totalWeight,
                totalReps,
                totalSets,
                totalXp,
                dailyProgress
        );
    }

    /**
     * Get monthly progress data for a user
     */
    public MonthProgressDTO getMonthlyProgress(Long userId) {
        // Validate user exists
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Get current month's start and end dates
        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.withDayOfMonth(1);
        LocalDate endOfMonth = today.with(TemporalAdjusters.lastDayOfMonth());

        // Fetch workout sessions for this month
        List<WorkoutSessionEntity> monthSessions = workoutSessionRepository
                .findByUserIdAndCompletedDateBetween(userId, startOfMonth, endOfMonth);

        // Create weekly breakdowns
        Map<Integer, WeeklyProgressDTO> weeklyBreakdown = new HashMap<>();

        // Get the current locale for week fields
        WeekFields weekFields = WeekFields.of(Locale.getDefault());

        // Calculate week numbers for this month
        int firstWeekOfMonth = startOfMonth.get(weekFields.weekOfMonth());
        int lastWeekOfMonth = endOfMonth.get(weekFields.weekOfMonth());

        // Initialize all weeks of the month
        for (int weekNum = firstWeekOfMonth; weekNum <= lastWeekOfMonth; weekNum++) {
            weeklyBreakdown.put(weekNum, new WeeklyProgressDTO("Week " + weekNum, 0L, 0, 0, 0L));
        }

        // Calculate weekly totals from sessions
        long totalWeight = 0;
        int totalReps = 0;
        int totalSets = 0;
        long totalXp = 0;

        for (WorkoutSessionEntity session : monthSessions) {
            int weekOfMonth = session.getCompletedDate().get(weekFields.weekOfMonth());
            WeeklyProgressDTO weekProgress = weeklyBreakdown.get(weekOfMonth);

            // Update weekly stats
            weekProgress.setWeight(weekProgress.getWeight() + session.getTotalWeight());
            weekProgress.setReps(weekProgress.getReps() + session.getTotalReps());
            weekProgress.setSets(weekProgress.getSets() + session.getTotalSets());
            weekProgress.setXp(weekProgress.getXp() + session.getXpEarned());

            // Update totals
            totalWeight += session.getTotalWeight();
            totalReps += session.getTotalReps();
            totalSets += session.getTotalSets();
            totalXp += session.getXpEarned();
        }

        // Build sorted weekly progress list
        List<WeeklyProgressDTO> weeklyProgress = new ArrayList<>();
        for (int weekNum = firstWeekOfMonth; weekNum <= lastWeekOfMonth; weekNum++) {
            weeklyProgress.add(weeklyBreakdown.get(weekNum));
        }

        // Create and return the monthly progress response
        return new MonthProgressDTO(
                totalWeight,
                totalReps,
                totalSets,
                totalXp,
                weeklyProgress
        );
    }

    public WorkoutSessionEntity saveWorkoutSession(WorkoutSessionEntity session) {
        // Validate user exists
        UserEntity user = userRepository.findById(session.getUser().getId())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + session.getUser().getId()));

        // Set user to ensure the relationship is maintained
        session.setUser(user);

        // If completedDate is not set, use current date
        if (session.getCompletedDate() == null) {
            session.setCompletedDate(LocalDate.now());
        }

        // Save and return the session
        return workoutSessionRepository.save(session);
    }

    /**
     * Get a workout session by ID
     */
    public WorkoutSessionEntity getSessionById(Long sessionId) {
        return workoutSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Workout session not found with id: " + sessionId));
    }

    /**
     * Get all workout sessions for a user
     */
    public List<WorkoutSessionEntity> getUserSessions(Long userId) {
        // Validate user exists
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Using a custom repository method that would need to be added
        return workoutSessionRepository.findByUserId(userId);
    }

    /**
     * Delete a workout session
     */
    public void deleteSession(Long sessionId) {
        // Check if session exists
        if (!workoutSessionRepository.existsById(sessionId)) {
            throw new RuntimeException("Workout session not found with id: " + sessionId);
        }

        workoutSessionRepository.deleteById(sessionId);
    }

    /**
     * Update a workout session
     */
    public WorkoutSessionEntity updateSession(WorkoutSessionEntity session) {
        // Check if session exists
        WorkoutSessionEntity existingSession = workoutSessionRepository.findById(session.getId())
                .orElseThrow(() -> new RuntimeException("Workout session not found with id: " + session.getId()));

        // Validate user exists if user is being updated
        if (session.getUser() != null && session.getUser().getId() != null) {
            UserEntity user = userRepository.findById(session.getUser().getId())
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + session.getUser().getId()));
            session.setUser(user);
        } else {
            // Keep the existing user if not updated
            session.setUser(existingSession.getUser());
        }

        // Save and return the updated session
        return workoutSessionRepository.save(session);
    }
}