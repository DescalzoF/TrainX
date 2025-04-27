package com.TrainX.TrainX.level;

import com.TrainX.TrainX.level.LevelEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
public class LevelService {

    @Autowired
    private LevelRepository levelRepository;

    /**
     * Obtener todos los niveles de un camino fitness específico
     */
    public List<LevelEntity> getLevelsByCaminoFitness(Long caminoFitnessId) {
        List<LevelEntity> levels = levelRepository.findByCaminos_IdCF(caminoFitnessId);
        if (levels.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No levels found for this Camino Fitness.");
        }
        return levels;
    }

    /**
     * Obtener un nivel por su nombre y su camino fitness asociado
     */
    public LevelEntity getLevelByNameAndCamino(String nameLevel, Long caminoFitnessId) {
        return levelRepository.findByNameLevelAndCaminos_IdCF(nameLevel, caminoFitnessId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Level not found for the given Camino Fitness."));
    }

    /**
     * Obtener todos los niveles disponibles
     */
    public List<LevelEntity> getAllLevels() {
        return levelRepository.findAll();
    }

    /**
     * Crear un nuevo nivel
     */
    public LevelEntity createLevel(LevelEntity levelEntity) {
        return levelRepository.save(levelEntity);
    }

    /**
     * Actualizar un nivel existente
     */
    public LevelEntity updateLevel(Long id, LevelEntity levelEntity) {
        if (!levelRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Level not found.");
        }
        levelEntity.setIdLevel(id);
        return levelRepository.save(levelEntity);
    }

    /**
     * Eliminar un nivel
     */
    public void deleteLevel(Long id) {
        if (!levelRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Level not found.");
        }
        levelRepository.deleteById(id);
    }

    public Optional<LevelEntity> getLevelByXP(Long xpFitness) {
        // Llamada al repositorio para encontrar el nivel cuyo rango de XP contiene el valor xpFitness.
        return levelRepository.findByXpMinLessThanEqualAndXpMaxGreaterThanEqual(xpFitness, xpFitness);
    }

    public Optional<LevelEntity> getLevelById(Long levelId) {
        // Llamada al repositorio para encontrar el nivel por su ID.
        return levelRepository.findById(levelId);
    }
}
