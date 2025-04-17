package com.TrainX.TrainX.caminoFitness;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/caminoFitness")
public class CaminoFitnessController {

    private final CaminoFitnessService caminoFitnessService;

    @Autowired
    public CaminoFitnessController(CaminoFitnessService caminoFitnessService) {
        this.caminoFitnessService = caminoFitnessService;
    }

    @GetMapping
    public ResponseEntity<List<CaminoFitnessEntity>> getAllCaminoFitness() {
        List<CaminoFitnessEntity> caminoFitnessList = caminoFitnessService.getAllCaminoFitness();
        return ResponseEntity.ok(caminoFitnessList);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CaminoFitnessEntity> getCaminoFitnessById(@PathVariable Long id) {
        Optional<CaminoFitnessEntity> caminoFitness = caminoFitnessService.getCaminoFitnessById(id);
        return caminoFitness.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CaminoFitnessEntity> createCaminoFitness(@RequestBody CaminoFitnessEntity caminoFitness) {
        CaminoFitnessEntity createdCF = caminoFitnessService.createCaminoFitness(caminoFitness);
        return new ResponseEntity<>(createdCF, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CaminoFitnessEntity> updateCaminoFitness(
            @PathVariable Long id,
            @RequestBody CaminoFitnessEntity caminoFitness) {
        try {
            CaminoFitnessEntity updatedCF = caminoFitnessService.updateCaminoFitness(id, caminoFitness);
            return ResponseEntity.ok(updatedCF);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCaminoFitness(@PathVariable Long id) {
        try {
            caminoFitnessService.deleteCaminoFitness(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}