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

    @GetMapping
    public ResponseEntity<List<LevelEntity>> getAllLevels() {
        List<LevelEntity> levels = levelService.getAllLevels();
        return ResponseEntity.ok(levels);
    }

    @PostMapping
    public ResponseEntity<LevelEntity> createLevel(@RequestBody LevelEntity levelEntity) {
        LevelEntity created = levelService.createLevel(levelEntity);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLevel(@PathVariable Long id) {
        try {
            levelService.deleteLevel(id);
            return ResponseEntity.noContent().build();
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).build();
        }
    }

    @GetMapping("/by-xp/{xp}")
    public ResponseEntity<LevelEntity> getLevelByXP(@PathVariable Long xp) {
        if (xp == null || xp < 0) {
            return ResponseEntity.badRequest().build();
        }

        try {
            return levelService.getLevelByXP(xp)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}