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

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

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
        // Find user
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // Find exercise
        ExerciseEntity exercise = exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Exercise not found"));

        // Create exercise completion record
        ExerciseCompletionEntity completion = new ExerciseCompletionEntity(
                user,
                exercise,
                sets != null ? sets : exercise.getSets(),
                reps != null ? reps : exercise.getReps(),
                weight != null ? weight : exercise.getWeight(),
                exercise.getXpFitnessReward()
        );

        // Save completion record
        completion = exerciseCompletionRepository.save(completion);

        return completion;
    }
    /**
     * Get all exercise completions for a specific user
     */
    @Transactional(readOnly = true)
    public List<ExerciseCompletionEntity> getUserCompletions(Long userId) {
        // Check if user exists
        if (!userRepository.existsById(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }

        // Custom query to get all completions for user
        // Note: You might want to add this method to ExerciseCompletionRepository
        return exerciseCompletionRepository.findByUserId(userId);
    }

    /**
     * Calculate exercise completion statistics for a user
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getCompletionStats(Long userId) {
        List<ExerciseCompletionEntity> completions = getUserCompletions(userId);

        if (completions.isEmpty()) {
            return Collections.emptyMap();
        }

        Map<String, Object> stats = new HashMap<>();

        // Basic stats
        int totalCompletions = completions.size();
        int totalSets = completions.stream().mapToInt(ExerciseCompletionEntity::getSets).sum();
        int totalReps = completions.stream().mapToInt(c -> c.getSets() * c.getReps()).sum();
        double totalWeight = completions.stream().mapToDouble(c -> c.getSets() * c.getReps() * c.getWeight()).sum();
        Long totalXP = completions.stream().mapToLong(ExerciseCompletionEntity::getXpReward).sum();

        // Averages
        double avgSets = totalSets / (double) totalCompletions;
        double avgReps = totalSets > 0 ? totalReps / (double) totalSets : 0;
        double avgWeight = totalReps > 0 ? totalWeight / totalReps : 0;
        double avgXpPerWorkout = totalCompletions > 0 ? totalXP / (double) totalCompletions : 0;

        // Group by exercise
        Map<Long, List<ExerciseCompletionEntity>> byExercise = completions.stream()
                .collect(Collectors.groupingBy(c -> c.getExercise().getId()));

        // Calculate stats by exercise
        Map<Long, Map<String, Object>> exerciseStats = new HashMap<>();

        for (Map.Entry<Long, List<ExerciseCompletionEntity>> entry : byExercise.entrySet()) {
            Long exerciseId = entry.getKey();
            List<ExerciseCompletionEntity> exerciseCompletions = entry.getValue();

            int exerciseTotalSets = exerciseCompletions.stream().mapToInt(ExerciseCompletionEntity::getSets).sum();
            int exerciseTotalReps = exerciseCompletions.stream().mapToInt(c -> c.getSets() * c.getReps()).sum();
            double exerciseTotalWeight = exerciseCompletions.stream()
                    .mapToDouble(c -> c.getSets() * c.getReps() * c.getWeight()).sum();
            Long exerciseTotalXP = exerciseCompletions.stream().mapToLong(ExerciseCompletionEntity::getXpReward).sum();
            double maxWeight = exerciseCompletions.stream().mapToDouble(ExerciseCompletionEntity::getWeight).max().orElse(0);

            // Calculate progress over time
            List<Map<String, Object>> progress = exerciseCompletions.stream()
                    .sorted(Comparator.comparing(ExerciseCompletionEntity::getCompletedAt))
                    .map(c -> {
                        Map<String, Object> point = new HashMap<>();
                        point.put("date", c.getCompletedAt().format(DateTimeFormatter.ISO_DATE));
                        point.put("weight", c.getWeight());
                        point.put("sets", c.getSets());
                        point.put("reps", c.getReps());
                        point.put("xp", c.getXpReward());
                        return point;
                    })
                    .collect(Collectors.toList());

            Map<String, Object> exerciseStat = new HashMap<>();
            exerciseStat.put("totalSets", exerciseTotalSets);
            exerciseStat.put("totalReps", exerciseTotalReps);
            exerciseStat.put("totalWeight", exerciseTotalWeight);
            exerciseStat.put("totalXP", exerciseTotalXP);
            exerciseStat.put("maxWeight", maxWeight);
            exerciseStat.put("completionCount", exerciseCompletions.size());
            exerciseStat.put("progress", progress);
            exerciseStat.put("name", exerciseCompletions.get(0).getExercise().getName());

            exerciseStats.put(exerciseId, exerciseStat);
        }

        // Add all stats to the result map
        stats.put("totalCompletions", totalCompletions);
        stats.put("totalSets", totalSets);
        stats.put("totalReps", totalReps);
        stats.put("totalWeight", totalWeight);
        stats.put("totalXP", totalXP);
        stats.put("avgSets", avgSets);
        stats.put("avgReps", avgReps);
        stats.put("avgWeight", avgWeight);
        stats.put("avgXpPerWorkout", avgXpPerWorkout);
        stats.put("byExercise", exerciseStats);

        // Generate progress over time data (grouped by week)
        List<Map<String, Object>> progressByWeek = generateProgressByWeek(completions);
        stats.put("progressOverTime", progressByWeek);

        return stats;
    }

    /**
     * Generate weekly progress data for the user
     */
    private List<Map<String, Object>> generateProgressByWeek(List<ExerciseCompletionEntity> completions) {
        // Group completions by week
        Map<String, List<ExerciseCompletionEntity>> byWeek = new HashMap<>();

        for (ExerciseCompletionEntity completion : completions) {
            LocalDateTime date = completion.getCompletedAt();
            int year = date.getYear();
            int quarter = (date.getMonthValue() - 1) / 3 + 1;
            int weekOfMonth = (date.getDayOfMonth() - 1) / 7 + 1;

            String weekKey = year + "-" + quarter + "Q-" + weekOfMonth + "W";

            if (!byWeek.containsKey(weekKey)) {
                byWeek.put(weekKey, new ArrayList<>());
            }

            byWeek.get(weekKey).add(completion);
        }

        // Calculate stats for each week
        List<Map<String, Object>> result = new ArrayList<>();

        for (Map.Entry<String, List<ExerciseCompletionEntity>> entry : byWeek.entrySet()) {
            String weekKey = entry.getKey();
            List<ExerciseCompletionEntity> weekCompletions = entry.getValue();

            Long xp = weekCompletions.stream().mapToLong(ExerciseCompletionEntity::getXpReward).sum();
            int sets = weekCompletions.stream().mapToInt(ExerciseCompletionEntity::getSets).sum();
            int reps = weekCompletions.stream().mapToInt(c -> c.getSets() * c.getReps()).sum();
            double totalVolume = weekCompletions.stream()
                    .mapToDouble(c -> c.getSets() * c.getReps() * c.getWeight()).sum();

            Map<String, Object> weekData = new HashMap<>();
            weekData.put("period", weekKey);
            weekData.put("xp", xp);
            weekData.put("sets", sets);
            weekData.put("reps", reps);
            weekData.put("totalVolume", totalVolume);
            weekData.put("count", weekCompletions.size());

            result.add(weekData);
        }

        // Sort by period
        result.sort(Comparator.comparing(m -> (String) m.get("period")));

        return result;
    }
}
