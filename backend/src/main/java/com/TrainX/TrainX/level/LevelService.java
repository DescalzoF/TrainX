
package com.TrainX.TrainX.level;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LevelService {

    @Autowired
    private LevelRepository levelRepository;

    // Obtener todos los niveles de un camino fitness específico
    public List<LevelEntity> getLevelsByCaminoFitness(Long caminoFitnessId) {
        return levelRepository.findByCaminoFitnessEntity_IdCF(caminoFitnessId);
    }

    // Obtener un nivel por su nombre
    public LevelEntity getLevelByName(String nameLevel) {
        return levelRepository.findByNameLevel(nameLevel);
    }

    // Obtener todos los niveles disponibles
    public List<LevelEntity> getAllLevels() {
        return levelRepository.findAll();
    }

    // Add to LevelService.java
    public LevelEntity getLevelByXP(Long xpFitness) {
        List<LevelEntity> allLevels = levelRepository.findAll();
        return allLevels.stream()
                .filter(level -> xpFitness >= level.getXpMin() && xpFitness <= level.getXpMax())
                .findFirst()
                .orElse(null);
    }

}
