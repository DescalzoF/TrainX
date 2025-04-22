package com.TrainX.TrainX.task.weeklyTask;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WeeklyTaskRepository extends JpaRepository<WeeklyTaskEntity, Long> {
    List<WeeklyTaskEntity> findByLevel_IdLevel(Long levelId);
}
