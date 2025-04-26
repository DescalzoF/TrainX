package com.TrainX.TrainX.level;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/levels")
public class LevelController {

    @Autowired
    private LevelService levelService;

    /**
     * Obtener todos los niveles de un camino fitness específico
     */
    @GetMapping("/by-camino")
    public ResponseEntity<List<LevelEntity>> getLevelsByCaminoFitness(@RequestParam Long caminoFitnessId) {
        if (caminoFitnessId == null || caminoFitnessId <= 0) {
            return ResponseEntity.badRequest().build();
        }
        try {
            List<LevelEntity> levels = levelService.getLevelsByCaminoFitness(caminoFitnessId);
            if (levels.isEmpty()) {
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.ok(levels);
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Obtener un nivel por nombre y camino fitness asociado
     */
    @GetMapping("/by-name-and-camino")
    public ResponseEntity<LevelEntity> getLevelByNameAndCamino(
            @RequestParam String nameLevel,
            @RequestParam Long caminoFitnessId) {
        if (nameLevel == null || nameLevel.isEmpty() || caminoFitnessId == null || caminoFitnessId <= 0) {
            return ResponseEntity.badRequest().build();
        }

        try {
            LevelEntity level = levelService.getLevelByNameAndCamino(nameLevel, caminoFitnessId);
            return ResponseEntity.ok(level);
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Obtener todos los niveles disponibles
     */
    @GetMapping
    public ResponseEntity<List<LevelEntity>> getAllLevels() {
        List<LevelEntity> levels = levelService.getAllLevels();
        return ResponseEntity.ok(levels);
    }

    /**
     * Crear un nuevo nivel
     */
    @PostMapping
    public ResponseEntity<LevelEntity> createLevel(@RequestBody LevelEntity levelEntity) {
        LevelEntity created = levelService.createLevel(levelEntity);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Actualizar un nivel existente
     */
    @PutMapping("/{id}")
    public ResponseEntity<LevelEntity> updateLevel(
            @PathVariable Long id,
            @RequestBody LevelEntity levelEntity) {
        try {
            LevelEntity updated = levelService.updateLevel(id, levelEntity);
            return ResponseEntity.ok(updated);
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).build();
        }
    }

    /**
     * Eliminar un nivel
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLevel(@PathVariable Long id) {
        try {
            levelService.deleteLevel(id);
            return ResponseEntity.noContent().build();
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).build();
        }
    }
}
