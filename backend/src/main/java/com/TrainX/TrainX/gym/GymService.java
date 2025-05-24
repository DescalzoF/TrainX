package com.TrainX.TrainX.gym;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class GymService {

    private final GymRepository gymRepository;

    @Autowired
    public GymService(GymRepository gymRepository) {
        this.gymRepository = gymRepository;
    }

    private GymDTO convertToDTO(GymEntity gymEntity) {
        GymDTO gymDTO = new GymDTO();
        gymDTO.setId(gymEntity.getId());
        gymDTO.setName(gymEntity.getName());
        gymDTO.setLatitud(gymEntity.getLatitud());
        gymDTO.setLongitud(gymEntity.getLongitud());
        gymDTO.setCalificacion(gymEntity.getCalificacion());
        gymDTO.setDireccion(gymEntity.getDireccion());
        return gymDTO;
    }

    // Convert DTO to Entity
    private GymEntity convertToEntity(GymDTO gymDTO) {
        GymEntity gymEntity = new GymEntity();
        gymEntity.setName(gymDTO.getName());
        gymEntity.setLatitud(gymDTO.getLatitud());
        gymEntity.setLongitud(gymDTO.getLongitud());
        gymEntity.setCalificacion(gymDTO.getCalificacion());
        gymEntity.setDireccion(gymDTO.getDireccion());

        if (gymDTO.getId() != null) {
            gymEntity.setId(gymDTO.getId());
        }

        return gymEntity;
    }

    // Create a new gym
    public GymDTO createGym(GymDTO gymDTO) {
        GymEntity gymEntity = convertToEntity(gymDTO);
        GymEntity savedGym = gymRepository.save(gymEntity);
        return convertToDTO(savedGym);
    }

    // Get all gyms
    public List<GymDTO> getAllGyms() {
        return gymRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Get gym by id
    public Optional<GymDTO> getGymById(Long id) {
        return gymRepository.findById(id)
                .map(this::convertToDTO);
    }

    // Update gym
    public GymDTO updateGym(Long id, GymDTO gymDTO) {
        if (gymRepository.existsById(id)) {
            GymEntity gymEntity = convertToEntity(gymDTO);
            gymEntity.setId(id);
            GymEntity updatedGym = gymRepository.save(gymEntity);
            return convertToDTO(updatedGym);
        }
        return null; // Handle this better in production code
    }

    // Delete gym
    public void deleteGym(Long id) {
        gymRepository.deleteById(id);
    }
}
