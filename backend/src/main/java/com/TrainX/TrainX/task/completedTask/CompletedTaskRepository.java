package com.TrainX.TrainX.task.completedTask;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface CompletedTaskRepository extends JpaRepository<CompletedTaskEntity, Long> {

    boolean existsByUser_IdAndTask_IdTaskAndWeekStartDate(Long userId, Long taskId, LocalDate weekStartDate);


    List<CompletedTaskEntity> findByUserIdAndCompletedDateBetween(
            Long userId, LocalDate startDate, LocalDate endDate);

    List<CompletedTaskEntity> findByUserIdAndWeekStartDate(Long userId, LocalDate weekStartDate);
}
