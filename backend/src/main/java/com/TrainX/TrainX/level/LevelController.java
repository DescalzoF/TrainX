package com.TrainX.TrainX.level;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/levels")
public class LevelController {

    @Autowired
    private LevelService levelService;

    // Obtener todos los niveles de un camino fitness específico
    @GetMapping("/by-camino")
    public List<LevelEntity> getLevelsByCaminoFitness(@RequestParam Long caminoFitnessId) {
        return levelService.getLevelsByCaminoFitness(caminoFitnessId);
    }

    // Obtener un nivel por nombre (ej. Principiante, Intermedio, etc.)
    @GetMapping("/by-name")
    public LevelEntity getLevelByName(@RequestParam String nameLevel) {
        return levelService.getLevelByName(nameLevel);
    }

    // Obtener todos los niveles disponibles
    @GetMapping("/")
    public List<LevelEntity> getAllLevels() {
        return levelService.getAllLevels();
    }
}
