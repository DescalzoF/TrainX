package com.TrainX.TrainX.task.completedTask;

import com.TrainX.TrainX.User.UserEntity;
import com.TrainX.TrainX.User.UserService;
import com.TrainX.TrainX.task.weeklyTask.WeeklyTaskEntity;
import com.TrainX.TrainX.task.weeklyTask.WeeklyTaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/completed-tasks")
public class CompletedTaskController {

    @Autowired
    private CompletedTaskService completedTaskService;

    @Autowired
    private WeeklyTaskService weeklyTaskService;

    @Autowired
    private UserService userService;

    @PostMapping("/complete")
    public void completeTask(@RequestParam Long userId, @RequestParam Long taskId) {
        UserEntity user = userService.getUserById(userId);
        WeeklyTaskEntity task = weeklyTaskService.getById(taskId);

        if (!completedTaskService.isTaskCompletedThisWeek(userId, taskId)) {
            completedTaskService.saveCompletedTask(user, task);
        }
    }

    @GetMapping("/is-completed")
    public boolean isTaskCompletedThisWeek(@RequestParam Long userId, @RequestParam Long taskId) {
        return completedTaskService.isTaskCompletedThisWeek(userId, taskId);
    }

    @GetMapping("/this-week")
    public List<CompletedTaskEntity> getCompletedTasksForThisWeek(@RequestParam Long userId) {
        return completedTaskService.getCompletedTasksForCurrentWeek(userId);
    }
}
