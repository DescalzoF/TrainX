package com.TrainX.TrainX.task;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TaskService {
    private final TaskRepository taskRepository;

    @Autowired
    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public List<TaskEntity> findAll() {
        return taskRepository.findAll();
    }

    public Optional<TaskEntity> findById(Long id) {
        return taskRepository.findById(id);
    }

    public TaskEntity save(TaskEntity task) {
        return taskRepository.save(task);
    }

    public TaskEntity update(Long id, TaskEntity updated) {
        return taskRepository.findById(id)
                .map(existing -> {
                    existing.setTitle(updated.getTitle());
                    existing.setDescription(updated.getDescription());
                    existing.setXpReward(updated.getXpReward());
                    existing.setRecurrenceDays(updated.getRecurrenceDays());
                    existing.setCamino(updated.getCamino());
                    return taskRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Task not found with id " + id));
    }

    public void delete(Long id) {
        taskRepository.deleteById(id);
    }
}
