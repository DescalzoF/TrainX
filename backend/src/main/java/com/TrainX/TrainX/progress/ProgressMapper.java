package com.TrainX.TrainX.progress;

import org.springframework.stereotype.Component;

@Component
public class ProgressMapper {

    public ProgressDTO toDTO(ProgressEntity entity) {
        if (entity == null) return null;

        ProgressDTO dto = new ProgressDTO();
        dto.setPhotoOne(entity.getPhotoOne());
        dto.setPhotoTwo(entity.getPhotoTwo());
        dto.setPhotoThree(entity.getPhotoThree());
        dto.setPhotoFour(entity.getPhotoFour());
        dto.setPhotoFive(entity.getPhotoFive());
        return dto;
    }

    public ProgressEntity toEntity(ProgressDTO dto, ProgressEntity entity) {
        if (dto == null) return entity;
        if (entity == null) entity = new ProgressEntity();
        // Sólo actualizamos las fotos si vienen no nulas en el DTO
        if (dto.getPhotoOne() != null)   entity.setPhotoOne(dto.getPhotoOne());
        if (dto.getPhotoTwo() != null)   entity.setPhotoTwo(dto.getPhotoTwo());
        if (dto.getPhotoThree() != null) entity.setPhotoThree(dto.getPhotoThree());
        if (dto.getPhotoFour() != null)  entity.setPhotoFour(dto.getPhotoFour());
        if (dto.getPhotoFive() != null)  entity.setPhotoFive(dto.getPhotoFive());
        return entity;
    }
}
