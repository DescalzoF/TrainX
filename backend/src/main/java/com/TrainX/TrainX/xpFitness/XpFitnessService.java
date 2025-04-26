package com.TrainX.TrainX.xpFitness;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class XpFitnessService {

    @Autowired
    private XpFitnessRepository xpFitnessRepository;

    // Método para obtener XP Fitness por usuario
    public XpFitnessEntity getXpFitnessByUser(Long userId) {
        return xpFitnessRepository.findById(userId).orElse(null); // Retorna null si no lo encuentra
    }

    // Método para actualizar XP Fitness
    public XpFitnessEntity updateXpFitness(Long userId, Long xpToAdd) {
        XpFitnessEntity xpFitness = getXpFitnessByUser(userId);
        if (xpFitness != null) {
            xpFitness.addXp(xpToAdd); // Suma el XP nuevo
            return xpFitnessRepository.save(xpFitness); // Guarda los cambios en la base de datos
        }
        return null;
    }

    // Método para crear un nuevo XpFitnessEntity (si no existe)
    public XpFitnessEntity createXpFitness(Long userId, Long initialXp) {
        XpFitnessEntity xpFitness = new XpFitnessEntity();
        xpFitness.setTotalXp(initialXp); // Asignamos XP inicial
        // Aquí deberías asociar el usuario a XpFitnessEntity, si es necesario
        // xpFitness.setUser(user);
        return xpFitnessRepository.save(xpFitness);
    }
}
