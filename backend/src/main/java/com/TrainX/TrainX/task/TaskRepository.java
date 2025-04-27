package com.TrainX.TrainX.task;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<TaskEntity, Long> {
    // Aquí puedes agregar métodos personalizados si es necesario
}
