package com.TrainX.TrainX.User;

import com.TrainX.TrainX.jwt.dtos.UserXpWithLevelDTO;
import com.TrainX.TrainX.level.LevelEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;


public interface UserRepository extends JpaRepository<UserEntity,Long> {
    Optional<UserEntity> findByUsername(String username);
    Optional<UserEntity> findByEmail(String email);
    Optional<UserEntity> findById(Long id);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);

    boolean existsByRole(Role role);

    @Query("SELECT new com.TrainX.TrainX.jwt.dtos.UserXpWithLevelDTO(" +
            "u.id, xp.totalXp, l.nameLevel, l.xpMin, l.xpMax) " +
            "FROM UserEntity u " +
            "JOIN u.xpFitnessEntity xp " +
            "JOIN u.level l " +
            "WHERE u.id = :userId")
    UserXpWithLevelDTO getUserXpWithLevel(@Param("userId") Long userId);


    List<UserEntity> findByLevel(LevelEntity level);

    // En UserRepository.java, agregar:
    Optional<UserEntity> findByVerificationToken(String token);

    // Nuevo método para limpiar usuarios expirados
    @Modifying
    @Query("DELETE FROM UserEntity u WHERE u.isVerified = false AND u.verificationTokenExpires < :now")
    int deleteByIsVerifiedFalseAndVerificationTokenExpiresIsBefore(@Param("now") LocalDateTime now);

}
