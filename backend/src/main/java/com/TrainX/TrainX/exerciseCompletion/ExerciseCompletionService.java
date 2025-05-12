package com.TrainX.TrainX.exerciseCompletion;

import com.TrainX.TrainX.User.UserEntity;
import com.TrainX.TrainX.User.UserRepository;
import com.TrainX.TrainX.exercise.ExerciseEntity;
import com.TrainX.TrainX.exercise.ExerciseRepository;
import com.TrainX.TrainX.xpFitness.XpFitnessService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.time.temporal.WeekFields;
import java.util.*;
import java.util.stream.Collectors;
import java.util.Locale;

@Service
public class ExerciseCompletionService {

    private final ExerciseCompletionRepository exerciseCompletionRepository;
    private final UserRepository userRepository;
    private final ExerciseRepository exerciseRepository;

    @Autowired
    public ExerciseCompletionService(
            ExerciseCompletionRepository exerciseCompletionRepository,
            UserRepository userRepository,
            ExerciseRepository exerciseRepository,
            XpFitnessService xpFitnessService) {
        this.exerciseCompletionRepository = exerciseCompletionRepository;
        this.userRepository = userRepository;
        this.exerciseRepository = exerciseRepository;
    }

    @Transactional
    public ExerciseCompletionEntity completeExercise(Long userId, Long exerciseId, Integer sets, Integer reps, Double weight) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        ExerciseEntity exercise = exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Exercise not found"));

        ExerciseCompletionEntity completion = new ExerciseCompletionEntity(
                user,
                exercise,
                sets != null ? sets : exercise.getSets(),
                reps != null ? reps : exercise.getReps(),
                weight != null ? weight : exercise.getWeight(),
                exercise.getXpFitnessReward()
        );

        return exerciseCompletionRepository.save(completion);
    }

    @Transactional(readOnly = true)
    public List<ExerciseCompletionEntity> getUserCompletions(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }

        return exerciseCompletionRepository.findByUserId(userId);
    }

    @Transactional(readOnly = true)
    public ExerciseCompletionStatisticsDTO getUserSummaryStatistics(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }

        List<ExerciseCompletionEntity> completions = exerciseCompletionRepository.findByUserId(userId);

        long totalXp = completions.stream()
                .mapToLong(ExerciseCompletionEntity::getXpReward)
                .sum();

        int totalCompletions = completions.size();

        double averageWeight = completions.isEmpty() ? 0 :
                completions.stream()
                        .mapToDouble(ExerciseCompletionEntity::getWeight)
                        .average()
                        .orElse(0);

        String favoriteExercise = "";
        if (!completions.isEmpty()) {
            Map<String, Long> exerciseCounts = completions.stream()
                    .collect(Collectors.groupingBy(
                            comp -> comp.getExercise().getName(),
                            Collectors.counting()
                    ));

            favoriteExercise = exerciseCounts.entrySet().stream()
                    .max(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey)
                    .orElse("");
        }

        return new ExerciseCompletionStatisticsDTO(
                totalXp,
                totalCompletions,
                averageWeight,
                favoriteExercise
        );
    }

    @Transactional(readOnly = true)
    public ExtendedExerciseCompletionStatisticsDTO getExtendedStatsForUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }

        List<ExerciseCompletionEntity> completions = exerciseCompletionRepository.findByUserId(userId);

        if (completions.isEmpty()) {
            return new ExtendedExerciseCompletionStatisticsDTO(
                    0.0, null, 0, 0, 0.0, 0, 0,
                    createEmptyWeeklyActivity(),
                    new ArrayList<>(),
                    new ArrayList<>()
            );
        }

        // Create a sorted list of completion dates for streak calculations
        List<ExerciseCompletionEntity> sortedCompletions = completions.stream()
                .sorted(Comparator.comparing(ExerciseCompletionEntity::getCompletedAt))
                .collect(Collectors.toList());

        // Basic extended stats (from original code)
        double maxWeight = completions.stream()
                .mapToDouble(ExerciseCompletionEntity::getWeight)
                .max()
                .orElse(0.0);

        Map<DayOfWeek, Long> frequencyMap = completions.stream()
                .collect(Collectors.groupingBy(
                        c -> c.getCompletedAt().toLocalDate().getDayOfWeek(),
                        Collectors.counting()
                ));

        String mostFrequentDay = frequencyMap.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(entry -> entry.getKey().getDisplayName(TextStyle.FULL, new Locale("es", "ES")))
                .orElse(null);

        TreeSet<LocalDate> dates = completions.stream()
                .map(c -> c.getCompletedAt().toLocalDate())
                .collect(Collectors.toCollection(TreeSet::new));

        // Calculate longest streak
        int longestStreak = calculateLongestStreak(dates);

        // Calculate current streak
        int currentStreak = calculateCurrentStreak(dates);

        int totalSessions = dates.size();

        double averageRepsPerSet = completions.stream()
                .mapToInt(ExerciseCompletionEntity::getReps)
                .average()
                .orElse(0.0);

        // Calculate weekly activity
        Map<String, Integer> weeklyActivity = calculateWeeklyActivity(completions);

        // Calculate weekly goal progress (assume goal is 10 exercises per week)
        int weeklyGoalProgress = calculateWeeklyGoalProgress(completions, 10);

        // Generate weekly performance data
        List<WeeklyPerformanceDTO> weeklyPerformance = generateWeeklyPerformanceData(completions);

        // Get recent activity
        List<RecentActivityDTO> recentActivity = getRecentActivity(completions);

        return new ExtendedExerciseCompletionStatisticsDTO(
                maxWeight,
                mostFrequentDay,
                longestStreak,
                totalSessions,
                averageRepsPerSet,
                currentStreak,
                weeklyGoalProgress,
                weeklyActivity,
                weeklyPerformance,
                recentActivity
        );
    }

    private int calculateLongestStreak(TreeSet<LocalDate> dates) {
        if (dates.isEmpty()) {
            return 0;
        }

        int longestStreak = 1;
        int currentStreak = 1;
        LocalDate previousDate = null;

        for (LocalDate date : dates) {
            if (previousDate != null) {
                if (date.equals(previousDate.plusDays(1))) {
                    currentStreak++;
                } else if (!date.equals(previousDate)) { // Skip duplicate dates
                    longestStreak = Math.max(longestStreak, currentStreak);
                    currentStreak = 1;
                }
            }
            previousDate = date;
        }

        // Check last streak
        longestStreak = Math.max(longestStreak, currentStreak);

        return longestStreak;
    }

    private int calculateCurrentStreak(TreeSet<LocalDate> dates) {
        if (dates.isEmpty()) {
            return 0;
        }

        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);

        // If the user worked out today, check backwards
        if (dates.contains(today)) {
            int streak = 1;
            LocalDate checkDate = yesterday;

            while (dates.contains(checkDate)) {
                streak++;
                checkDate = checkDate.minusDays(1);
            }

            return streak;
        }

        // If user worked out yesterday, check backwards
        if (dates.contains(yesterday)) {
            int streak = 1;
            LocalDate checkDate = yesterday.minusDays(1);

            while (dates.contains(checkDate)) {
                streak++;
                checkDate = checkDate.minusDays(1);
            }

            return streak;
        }

        // If last workout was before yesterday, no current streak
        return 0;
    }

    private Map<String, Integer> calculateWeeklyActivity(List<ExerciseCompletionEntity> completions) {
        // Setup day names in Spanish
        String[] dayNames = {"Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"};
        Map<String, Integer> weeklyActivity = new LinkedHashMap<>();

        // Initialize with zero counts
        for (String day : dayNames) {
            weeklyActivity.put(day, 0);
        }

        // Get current week's Monday and Sunday
        LocalDate today = LocalDate.now();
        LocalDate startOfWeek = today.with(WeekFields.of(Locale.forLanguageTag("es")).dayOfWeek(), 1);
        LocalDate endOfWeek = startOfWeek.plusDays(6);

        // Count exercises by day of week for current week
        for (ExerciseCompletionEntity completion : completions) {
            LocalDate completionDate = completion.getCompletedAt().toLocalDate();
            if (!completionDate.isBefore(startOfWeek) && !completionDate.isAfter(endOfWeek)) {
                int dayOfWeekValue = completionDate.getDayOfWeek().getValue(); // 1 = Monday, 7 = Sunday
                String dayName = dayNames[dayOfWeekValue - 1];
                weeklyActivity.put(dayName, weeklyActivity.getOrDefault(dayName, 0) + 1);
            }
        }

        return weeklyActivity;
    }

    private Map<String, Integer> createEmptyWeeklyActivity() {
        String[] dayNames = {"Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"};
        Map<String, Integer> weeklyActivity = new LinkedHashMap<>();

        for (String day : dayNames) {
            weeklyActivity.put(day, 0);
        }

        return weeklyActivity;
    }

    private int calculateWeeklyGoalProgress(List<ExerciseCompletionEntity> completions, int weeklyGoal) {
        // Get current week's Monday and Sunday
        LocalDate today = LocalDate.now();
        LocalDate startOfWeek = today.with(WeekFields.of(Locale.forLanguageTag("es")).dayOfWeek(), 1);
        LocalDate endOfWeek = startOfWeek.plusDays(6);

        // Count exercises completed this week
        long exercisesThisWeek = completions.stream()
                .filter(completion -> {
                    LocalDate completionDate = completion.getCompletedAt().toLocalDate();
                    return !completionDate.isBefore(startOfWeek) && !completionDate.isAfter(endOfWeek);
                })
                .count();

        // Calculate progress as percentage
        int progress = (int) Math.min(100, (exercisesThisWeek * 100) / weeklyGoal);
        return progress;
    }

    private List<WeeklyPerformanceDTO> generateWeeklyPerformanceData(List<ExerciseCompletionEntity> completions) {
        // Get the date 5 weeks ago
        LocalDate today = LocalDate.now();
        LocalDate fiveWeeksAgo = today.minusWeeks(5);

        // Filter completions from the last 5 weeks
        List<ExerciseCompletionEntity> recentCompletions = completions.stream()
                .filter(completion -> completion.getCompletedAt().toLocalDate().isAfter(fiveWeeksAgo))
                .collect(Collectors.toList());

        // Group by week number
        Map<Integer, List<ExerciseCompletionEntity>> weeklyCompletions = new HashMap<>();

        for (ExerciseCompletionEntity completion : recentCompletions) {
            LocalDate completionDate = completion.getCompletedAt().toLocalDate();
            LocalDate weekStart = completionDate.with(WeekFields.of(Locale.forLanguageTag("es")).dayOfWeek(), 1);
            int weekNumber = (int) ChronoUnit.WEEKS.between(fiveWeeksAgo, weekStart) + 1;

            weeklyCompletions.computeIfAbsent(weekNumber, k -> new ArrayList<>()).add(completion);
        }

        // Calculate performance metrics for each week
        List<WeeklyPerformanceDTO> weeklyPerformance = new ArrayList<>();

        for (int i = 1; i <= 5; i++) {
            List<ExerciseCompletionEntity> weekComps = weeklyCompletions.getOrDefault(i, Collections.emptyList());
            String weekName = "Sem " + i;

            if (weekComps.isEmpty()) {
                // Add empty data for weeks with no completions
                weeklyPerformance.add(new WeeklyPerformanceDTO(weekName, 0.0, 0, 0));
            } else {
                // Calculate average weight and reps, and total XP
                double avgWeight = weekComps.stream()
                        .mapToDouble(ExerciseCompletionEntity::getWeight)
                        .average()
                        .orElse(0.0);

                int avgReps = (int) weekComps.stream()
                        .mapToInt(ExerciseCompletionEntity::getReps)
                        .average()
                        .orElse(0.0);

                int totalXp = weekComps.stream()
                        .mapToInt(comp -> comp.getXpReward().intValue())
                        .sum();

                weeklyPerformance.add(new WeeklyPerformanceDTO(weekName, avgWeight, avgReps, totalXp));
            }
        }

        return weeklyPerformance;
    }

    private List<RecentActivityDTO> getRecentActivity(List<ExerciseCompletionEntity> completions) {
        // Get the 3 most recent exercise completions
        return completions.stream()
                .sorted(Comparator.comparing(ExerciseCompletionEntity::getCompletedAt).reversed())
                .limit(3)
                .map(completion -> new RecentActivityDTO(
                        completion.getId(),
                        completion.getExercise().getName(),
                        completion.getWeight(),
                        completion.getReps(),
                        completion.getSets(),
                        completion.getCompletedAt(),
                        completion.getXpReward().intValue()
                ))
                .collect(Collectors.toList());
    }
}