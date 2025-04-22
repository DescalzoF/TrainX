package com.TrainX.TrainX.task.weeklyTask;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WeeklyTaskService {

    @Autowired
    private WeeklyTaskRepository weeklyTaskRepository;

    public List<WeeklyTaskEntity> getTasksByLevel(Long levelId) {
        return weeklyTaskRepository.findByLevel_IdLevel(levelId);
    }

    public WeeklyTaskEntity getById(Long id) {
        return weeklyTaskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("WeeklyTask no encontrada con ID: " + id));
    }

    public List<WeeklyTaskEntity> getAllTasks() {
        return weeklyTaskRepository.findAll();
    }

    public WeeklyTaskEntity save(WeeklyTaskEntity task) {
        return weeklyTaskRepository.save(task);
    }

    public void delete(Long id) {
        weeklyTaskRepository.deleteById(id);
    }
}
