package com.TrainX.TrainX.caminoFitness;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CaminoFitnessRepository extends JpaRepository<CaminoFitnessEntity, Long> {
}
