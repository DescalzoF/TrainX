package com.TrainX.TrainX.gym;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GymRepository extends JpaRepository<GymEntity, Long> {
}
