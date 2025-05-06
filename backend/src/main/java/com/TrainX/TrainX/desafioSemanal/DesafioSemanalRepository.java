package com.TrainX.TrainX.desafioSemanal;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DesafioSemanalRepository extends JpaRepository<DesafioSemanal, Long> {

    List<DesafioSemanal> findByActivoTrue();

    @Query("SELECT d FROM DesafioSemanal d WHERE d.activo = true AND NOT EXISTS " +
            "(SELECT 1 FROM UserEntity u JOIN u.desafiosCompletados dc " +
            "WHERE dc.id = d.id AND u.id = :userId)")
    List<DesafioSemanal> findActiveDesafiosNotCompletedByUser(Long userId);
}