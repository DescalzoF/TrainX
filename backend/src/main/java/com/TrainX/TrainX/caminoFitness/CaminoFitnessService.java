package com.TrainX.TrainX.caminoFitness;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.Optional;

@Service
public class CaminoFitnessService {

    private final CaminoFitnessRepository caminoFitnessRepository;

    @Autowired
    public CaminoFitnessService(CaminoFitnessRepository caminoFitnessRepository) {
        this.caminoFitnessRepository = caminoFitnessRepository;
    }

    public List<CaminoFitnessEntity> getAllCaminoFitness() {
        return caminoFitnessRepository.findAll();
    }

    public Optional<CaminoFitnessEntity> getCaminoFitnessById(Long id) {
        return caminoFitnessRepository.findById(id);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public CaminoFitnessEntity createCaminoFitness(CaminoFitnessEntity caminoFitness) {
        return caminoFitnessRepository.save(caminoFitness);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public CaminoFitnessEntity updateCaminoFitness(Long id, CaminoFitnessEntity updatedCF) {
        Optional<CaminoFitnessEntity> existingCF = caminoFitnessRepository.findById(id);

        if (existingCF.isPresent()) {
            CaminoFitnessEntity caminoFitness = existingCF.get();
            caminoFitness.setNameCF(updatedCF.getNameCF());
            caminoFitness.setDescriptionCF(updatedCF.getDescriptionCF());
            return caminoFitnessRepository.save(caminoFitness);
        } else {
            throw new RuntimeException("Camino Fitness program not found with id: " + id);
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void deleteCaminoFitness(Long id) {
        if (caminoFitnessRepository.existsById(id)) {
            caminoFitnessRepository.deleteById(id);
        } else {
            throw new RuntimeException("Camino Fitness program not found with id: " + id);
        }
    }
}