package com.TrainX.TrainX.caminoFitness;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio para operaciones CRUD y consultas personalizadas sobre CaminoFitnessEntity.
 */
@Repository
public interface CaminoFitnessRepository extends JpaRepository<CaminoFitnessEntity, Long> {

    /**
     * Busca un CaminoFitness por descripción exacta.
     * @param descriptionCF descripción a buscar
     * @return entidad encontrada
     */
    List<CaminoFitnessEntity> findByDescriptionCF(String descriptionCF);

    /**
     * Busca un CaminoFitness por nombre, ignorando mayúsculas/minúsculas.
     * @param name nombre a buscar
     * @return optional con la entidad, si existe
     */
    Optional<CaminoFitnessEntity> findByNameCFIgnoreCase(String name);

    /**
     * Todos los caminos que incluyen un nivel con el id especificado.
     * @param levelId id del nivel
     * @return lista de caminos asociados
     */
    List<CaminoFitnessEntity> findByLevels_IdLevel(Long levelId);

    /**
     * Filtrar caminos por nivel y fragmento de nombre (insensible a mayúsculas).
     * @param levelId id del nivel
     * @param fragment fragmento del nombre del camino
     * @return lista de caminos que cumplen ambos criterios
     */
    List<CaminoFitnessEntity> findByLevels_IdLevelAndNameCFContainingIgnoreCase(Long levelId, String fragment);


}
