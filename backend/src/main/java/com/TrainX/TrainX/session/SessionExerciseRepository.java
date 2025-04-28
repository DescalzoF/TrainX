package com.TrainX.TrainX.session;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SessionExerciseRepository extends JpaRepository<SessionExerciseEntity, Long> {
    // You can add custom query methods here if needed
}
