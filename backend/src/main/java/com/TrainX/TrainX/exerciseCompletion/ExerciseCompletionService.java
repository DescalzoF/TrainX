package com.TrainX.TrainX.exerciseCompletion;

import com.TrainX.TrainX.User.UserEntity;
import com.TrainX.TrainX.User.UserRepository;
import com.TrainX.TrainX.exercise.ExerciseEntity;
import com.TrainX.TrainX.exercise.ExerciseRepository;
import com.TrainX.TrainX.leaderboards.LeaderboardGeneralDTO;
import com.TrainX.TrainX.leaderboards.LeaderboardSemanalDTO;
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

    @Transactional(readOnly = true)
    public ExerciseCompletionEntity getLatestExerciseCompletion(Long userId, Long exerciseId) {
        if (!userRepository.existsById(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }

        if (!exerciseRepository.existsById(exerciseId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Exercise not found");
        }

        return exerciseCompletionRepository.findTopByUserIdAndExerciseIdOrderByCompletedAtDesc(userId, exerciseId)
                .orElse(null);
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
        // Get the date of the most recent completion
        LocalDate today = LocalDate.now();
        LocalDate mostRecentDate = completions.stream()
                .map(comp -> comp.getCompletedAt().toLocalDate())
                .max(LocalDate::compareTo)
                .orElse(today);

        // Calculate the start of the most recent week
        LocalDate weekStart = mostRecentDate.with(WeekFields.of(Locale.forLanguageTag("es")).dayOfWeek(), 1);
        LocalDate fourWeeksAgo = weekStart.minusWeeks(3);

        // Filter completions from the last 4 weeks
        List<ExerciseCompletionEntity> recentCompletions = completions.stream()
                .filter(completion -> {
                    LocalDate completionDate = completion.getCompletedAt().toLocalDate();
                    return !completionDate.isBefore(fourWeeksAgo) && !completionDate.isAfter(weekStart.plusWeeks(3));
                })
                .collect(Collectors.toList());

        // Group by week number
        Map<Integer, List<ExerciseCompletionEntity>> weeklyCompletions = new LinkedHashMap<>();

        for (ExerciseCompletionEntity completion : recentCompletions) {
            LocalDate completionDate = completion.getCompletedAt().toLocalDate();
            LocalDate completionWeekStart = completionDate.with(WeekFields.of(Locale.forLanguageTag("es")).dayOfWeek(), 1);

            // Calculate weeks relative to the most recent week's start
            int weekNumber = (int) ChronoUnit.WEEKS.between(fourWeeksAgo, completionWeekStart) + 1;

            weeklyCompletions.computeIfAbsent(weekNumber, k -> new ArrayList<>()).add(completion);
        }

        // Calculate performance metrics for each week
        List<WeeklyPerformanceDTO> weeklyPerformance = new ArrayList<>();

        for (int i = 1; i <= 4; i++) {
            List<ExerciseCompletionEntity> weekComps = weeklyCompletions.getOrDefault(i, Collections.emptyList());
            String weekName = "Sem " + i;

            if (weekComps.isEmpty()) {
                // Add empty data for weeks with no completions
                weeklyPerformance.add(new WeeklyPerformanceDTO(weekName, 0.0, 0, 0));
            } else {
                // Calculate total weight and reps, and total XP
                double totalWeight = weekComps.stream()
                        .mapToDouble(comp -> comp.getWeight() * comp.getSets() * comp.getReps())
                        .sum();

                int totalReps = weekComps.stream()
                        .mapToInt(comp -> comp.getReps() * comp.getSets())
                        .sum();

                int totalXp = weekComps.stream()
                        .mapToInt(comp -> comp.getXpReward().intValue())
                        .sum();

                weeklyPerformance.add(new WeeklyPerformanceDTO(weekName, totalWeight, totalReps, totalXp));
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

    @Transactional(readOnly = true)
    public List<LeaderboardGeneralDTO> getGeneralLeaderboard() {
        List<UserEntity> users = userRepository.findAll();

        return users.stream()
                .map(user -> {
                    ExtendedExerciseCompletionStatisticsDTO stats = getExtendedStatsForUser(user.getId());
                    Long totalXp = 0L;
                    if (user.getXpFitnessEntity() != null) {
                        // Reemplaza 'getTotalXp()' con el método o campo correcto de tu XpFitnessEntity
                        totalXp = user.getXpFitnessEntity().getTotalXp(); // <-- Cambia esto si el nombre es diferente
                    }

                    return new LeaderboardGeneralDTO(
                            user.getId(),
                            user.getUsername(),
                            user.getUserPhoto(),
                            user.getCaminoFitnessActual() != null ? user.getCaminoFitnessActual().getNameCF() : "N/A",
                            user.getLevel() != null ? user.getLevel().getNameLevel() : "N/A",
                            totalXp,
                            stats != null ? stats.getCurrentStreak() : 0,
                            stats != null ? stats.getMostFrequentDay() : "N/A",
                            stats != null ? stats.getTotalSessions() : 0
                    );
                })
                .sorted(Comparator.comparingLong(LeaderboardGeneralDTO::getTotalXp).reversed())
                .collect(Collectors.toList());
    }
    @Transactional(readOnly = true)
    public List<LeaderboardSemanalDTO> getWeeklyLeaderboard() {
        List<UserEntity> users = userRepository.findAll(); // Obtener todos los usuarios

        List<LeaderboardSemanalDTO> weeklyLeaderboard = users.stream()
                .map(user -> {
                    // Para cada usuario, obtener sus finalizaciones de ejercicio
                    List<ExerciseCompletionEntity> completions = exerciseCompletionRepository.findByUserId(user.getId());

                    // Calcular el inicio y fin de la semana actual
                    LocalDate today = LocalDate.now();
                    LocalDate startOfWeek = today.with(WeekFields.of(Locale.forLanguageTag("es")).dayOfWeek(), 1); // Lunes
                    LocalDate endOfWeek = startOfWeek.plusDays(6); // Domingo

                    // Filtrar las finalizaciones de la semana actual y calcular métricas
                    int weeklyXp = 0;
                    double totalWeight = 0.0; // Total de peso levantado en la semana
                    Set<LocalDate> weeklyWorkoutDays = new HashSet<>(); // Para contar sesiones/días de entrenamiento
                    int weeklyExercises = 0; // Contador de ejercicios completados

                    for (ExerciseCompletionEntity completion : completions) {
                        LocalDate completionDate = completion.getCompletedAt().toLocalDate();
                        // Verificar si la finalización está dentro de la semana actual
                        if (!completionDate.isBefore(startOfWeek) && !completionDate.isAfter(endOfWeek)) {
                            weeklyXp += completion.getXpReward().intValue();
                            totalWeight += completion.getWeight() * completion.getSets() * completion.getReps(); // Total de peso levantado
                            weeklyWorkoutDays.add(completionDate); // Añadir el día para contar sesiones
                            weeklyExercises++; // Contar el ejercicio individual
                        }
                    }

                    // Aquí decides si weeklyExercisesCompleted cuenta ejercicios individuales o días de entrenamiento
                    // Usaremos weeklyExercises para contar el total de actividades en la semana.
                    // Si quieres contar días de entrenamiento, usa weeklyWorkoutDays.size().
                    int weeklyActivityCount = weeklyExercises;


                    // Crear el DTO Semanal para el usuario
                    return new LeaderboardSemanalDTO(
                            user.getId(),
                            user.getUsername(),
                            user.getUserPhoto(),
                            weeklyXp,
                            weeklyActivityCount,
                            totalWeight

                    );
                })
                // Ordenar por XP Semanal de forma descendente
                .sorted(Comparator.comparingInt(LeaderboardSemanalDTO::getWeeklyXp).reversed())
                .collect(Collectors.toList());

        return weeklyLeaderboard;
    }

}