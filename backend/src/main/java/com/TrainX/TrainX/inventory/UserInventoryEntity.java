package com.TrainX.TrainX.inventory;

import com.TrainX.TrainX.User.UserEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "user_inventory")
@Data
@NoArgsConstructor
public class UserInventoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Column(nullable = false)
    private String itemType; // "PROFILE_PICTURE", "BANNER", "EMBLEM"

    @Column(nullable = false)
    private String itemName; // Name of the item (e.g., "avatar1", "banner2", "emblem3")

    @Column(nullable = false)
    private Boolean isActive = false; // Whether this item is currently being used

    public UserInventoryEntity(UserEntity user, String itemType, String itemName) {
        this.user = user;
        this.itemType = itemType;
        this.itemName = itemName;
        this.isActive = false;
    }
}