package com.TrainX.TrainX.desafioSemanal;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface DesafioCompletionRepository extends JpaRepository<DesafioCompletion, Long> {

    Optional<DesafioCompletion> findByUsuarioIdAndDesafioIdAndFechaCompletadoAfter(
            Long userId, Long desafioId, LocalDateTime date);

    Optional<DesafioCompletion> findFirstByUsuarioIdAndFechaCompletadoAfterOrderByFechaCompletadoDesc(
            Long userId, LocalDateTime date);

    Optional<DesafioCompletion> findFirstByUsuarioIdOrderByFechaCompletadoDesc(Long userId);
}