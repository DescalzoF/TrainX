package com.TrainX.TrainX.desafioSemanal;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DesafioCompletionRepository extends JpaRepository<DesafioCompletion, Long> {

    List<DesafioCompletion> findByUsuarioId(Long userId);

    List<DesafioCompletion> findByDesafioId(Long desafioId);

    Optional<DesafioCompletion> findByUsuarioIdAndDesafioIdAndFechaCompletadoAfter(
            Long userId, Long desafioId, LocalDateTime fecha);
}