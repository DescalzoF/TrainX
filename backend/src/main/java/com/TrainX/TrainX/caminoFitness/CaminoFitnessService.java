package com.TrainX.TrainX.caminoFitness;

import com.TrainX.TrainX.User.UserEntity;
import com.TrainX.TrainX.User.UserService;
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

    /**
     * Obtener todos los caminos fitness.
     * @return lista de caminos fitness
     */
    public List<CaminoFitnessEntity> getAllCaminoFitness() {
        List<CaminoFitnessEntity> caminos = caminoFitnessRepository.findAll();

        for (CaminoFitnessEntity camino : caminos) {
            camino.setLevels(null); // o setea a lista vacía
        }

        return caminos;
    }


    /**
     * Buscar un camino fitness por ID.
     * @param id identificador del camino fitness
     * @return Optional conteniendo el camino, si existe
     */
    public Optional<CaminoFitnessEntity> getCaminoFitnessById(Long id) {
        System.out.println("Buscando camino fitness con ID: " + id);
        return caminoFitnessRepository.findById(id);
    }

    /**
     * Crear un nuevo camino fitness. Solo accesible para administradores.
     * @param caminoFitness entidad a crear
     * @return camino fitness creado
     */
    @PreAuthorize("hasRole('ADMIN')")
    public CaminoFitnessEntity createCaminoFitness(CaminoFitnessEntity caminoFitness) {
        return caminoFitnessRepository.save(caminoFitness);
    }

    /**
     * Actualizar un camino fitness existente. Solo accesible para administradores.
     * @param id identificador del camino a actualizar
     * @param updatedCF datos nuevos del camino
     * @return camino fitness actualizado
     */
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

    /**
     * Eliminar un camino fitness por ID. Solo accesible para administradores.
     * @param id identificador del camino a eliminar
     */
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteCaminoFitness(Long id) {
        if (caminoFitnessRepository.existsById(id)) {
            caminoFitnessRepository.deleteById(id);
        } else {
            throw new RuntimeException("Camino Fitness program not found with id: " + id);
        }
    }
}
