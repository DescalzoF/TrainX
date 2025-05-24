package com.TrainX.TrainX.inventory;

import com.TrainX.TrainX.User.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserInventoryRepository extends JpaRepository<UserInventoryEntity, Long> {

    List<UserInventoryEntity> findByUserAndItemType(UserEntity user, String itemType);

    List<UserInventoryEntity> findByUser(UserEntity user);

    Optional<UserInventoryEntity> findByUserAndItemTypeAndItemName(UserEntity user, String itemType, String itemName);

    Optional<UserInventoryEntity> findByUserAndItemTypeAndIsActive(UserEntity user, String itemType, Boolean isActive);

    @Modifying
    @Query("UPDATE UserInventoryEntity u SET u.isActive = false WHERE u.user = :user AND u.itemType = :itemType")
    void deactivateAllItemsByType(@Param("user") UserEntity user, @Param("itemType") String itemType);

    boolean existsByUserAndItemTypeAndItemName(UserEntity user, String itemType, String itemName);
}