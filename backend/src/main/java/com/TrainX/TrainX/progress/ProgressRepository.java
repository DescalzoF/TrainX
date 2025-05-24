package com.TrainX.TrainX.progress;

import com.TrainX.TrainX.User.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ProgressRepository extends JpaRepository<ProgressEntity, Long> {
    Optional<ProgressEntity> findByUser(UserEntity user);
}

