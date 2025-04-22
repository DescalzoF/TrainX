package com.TrainX.TrainX.task.weeklyTask;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/weekly-tasks")
public class WeeklyTaskController {

    @Autowired
    private WeeklyTaskService weeklyTaskService;

    // Obtener tareas de un nivel específico (por ejemplo, nivel "Principiante")
    @GetMapping("/by-level")
    public List<WeeklyTaskEntity> getTasksByLevel(@RequestParam Long levelId) {
        return weeklyTaskService.getTasksByLevel(levelId);
    }

    // Obtener todas las tareas (por si necesitas una vista general)
    @GetMapping("/")
    public List<WeeklyTaskEntity> getAllTasks() {
        return weeklyTaskService.getAllTasks();
    }

    // Obtener una tarea por ID (esto puede ser útil para detalles específicos)
    @GetMapping("/{id}")
    public WeeklyTaskEntity getTaskById(@PathVariable Long id) {
        return weeklyTaskService.getById(id);
    }

    // Crear o actualizar una tarea semanal
    @PostMapping("/")
    public WeeklyTaskEntity createOrUpdateTask(@RequestBody WeeklyTaskEntity task) {
        return weeklyTaskService.save(task);
    }

    // Eliminar una tarea semanal
    @DeleteMapping("/{id}")
    public void deleteTask(@PathVariable Long id) {
        weeklyTaskService.delete(id);
    }
}
