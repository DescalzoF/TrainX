package com.TrainX.TrainX.caminoFitness;

import com.TrainX.TrainX.User.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CaminoFitnessRepository extends JpaRepository<CaminoFitnessEntity, Long> {
    // Aquí puedes agregar métodos personalizados si es necesario
    // Por ejemplo, para buscar por nombre o descripción
    CaminoFitnessEntity findByDescriptionCF(String descriptionCF);
    Optional<CaminoFitnessEntity>findByNameCF(String nameCF);

}
