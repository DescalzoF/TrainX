package com.TrainX.TrainX.task.completedTask;

import com.TrainX.TrainX.User.UserEntity;
import com.TrainX.TrainX.task.weeklyTask.WeeklyTaskEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;


@Service
public class CompletedTaskService {

    @Autowired
    private CompletedTaskRepository completedTaskRepository;

    private LocalDate getStartOfCurrentWeek() {
        LocalDate today = LocalDate.now();
        return today.with(java.time.DayOfWeek.MONDAY);
    }

    public boolean isTaskCompletedThisWeek(Long userId, Long taskId) {
        LocalDate currentWeekStart = getStartOfCurrentWeek();
        return completedTaskRepository.existsByUser_IdAndTask_IdTaskAndWeekStartDate(
                userId, taskId, currentWeekStart
        );
    }

    public void saveCompletedTask(UserEntity user, WeeklyTaskEntity task) {
        LocalDate today = LocalDate.now();
        LocalDate weekStart = getStartOfCurrentWeek();

        CompletedTaskEntity completedTask = new CompletedTaskEntity();
        completedTask.setUser(user);
        completedTask.setTask(task);
        completedTask.setCompletedDate(today);
        completedTask.setWeekStartDate(weekStart);

        completedTaskRepository.save(completedTask);
    }

    public List<CompletedTaskEntity> getCompletedTasksForCurrentWeek(Long userId) {
        LocalDate currentWeekStart = getStartOfCurrentWeek();
        return completedTaskRepository.findByUserIdAndWeekStartDate(userId, currentWeekStart);
    }
}
