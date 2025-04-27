package com.TrainX.TrainX.xpFitness;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/xpfitness")
public class XpFitnessController {

    @Autowired
    private XpFitnessService xpFitnessService;

    // Endpoint para obtener los XP Fitness de un usuario
    @GetMapping("/{userId}")
    public ResponseEntity<XpFitnessEntity> getXpFitness(@PathVariable Long userId) {
        XpFitnessEntity xpFitness = xpFitnessService.getXpFitnessByUser(userId);
        if (xpFitness == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND); // Si no existe el XP para ese usuario
        }
        return new ResponseEntity<>(xpFitness, HttpStatus.OK);
    }

    // Endpoint para actualizar XP Fitness de un usuario
    @PutMapping("/{userId}/addXp/{xpToAdd}")
    public ResponseEntity<XpFitnessEntity> addXpToUser(@PathVariable Long userId, @PathVariable Long xpToAdd) {
        XpFitnessEntity updatedXpFitness = xpFitnessService.updateXpFitness(userId, xpToAdd);
        if (updatedXpFitness == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND); // Si no existe el usuario o el XP Fitness
        }
        return new ResponseEntity<>(updatedXpFitness, HttpStatus.OK);
    }

    // Endpoint para crear un nuevo XpFitness si no existe para un usuario
    @PostMapping("/{userId}/createXpFitness")
    public ResponseEntity<XpFitnessEntity> createXpFitness(@PathVariable Long userId, @RequestParam Long initialXp) {
        XpFitnessEntity xpFitness = xpFitnessService.createXpFitness(userId, initialXp);
        if (xpFitness == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST); // Si no se pudo crear correctamente
        }
        return new ResponseEntity<>(xpFitness, HttpStatus.CREATED);
    }
}

