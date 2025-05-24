package com.TrainX.TrainX.shop;

import com.TrainX.TrainX.User.UserEntity;
import com.TrainX.TrainX.User.UserService;
import com.TrainX.TrainX.inventory.UserInventoryEntity;
import com.TrainX.TrainX.inventory.UserInventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class ShopService {

    @Autowired
    private UserInventoryRepository userInventoryRepository;

    @Autowired
    private UserService userService;

    // Define shop items with their prices
    private final Map<String, Map<String, Long>> SHOP_ITEMS = Map.of(
            "PROFILE_PICTURE", Map.of(
                    "avatar1", 100L,
                    "avatar2", 150L,
                    "avatar3", 200L,
                    "avatar4", 250L,
                    "avatar5", 300L
            ),
            "BANNER", Map.of(
                    "banner1", 200L,
                    "banner2", 250L,
                    "banner3", 300L,
                    "banner4", 350L,
                    "banner5", 400L
            ),
            "EMBLEM", Map.of(
                    "emblem1", 150L,
                    "emblem2", 200L,
                    "emblem3", 250L,
                    "emblem4", 300L,
                    "emblem5", 350L
            )
    );

    public Map<String, Map<String, Long>> getAllShopItems() {
        return SHOP_ITEMS;
    }

    public Map<String, Object> getShopItemsWithOwnership(Long userId) {
        UserEntity user = userService.getUserById(userId);
        List<UserInventoryEntity> userInventory = userInventoryRepository.findByUser(user);

        Map<String, Object> result = new HashMap<>();

        for (String itemType : SHOP_ITEMS.keySet()) {
            Map<String, Long> items = SHOP_ITEMS.get(itemType);
            Map<String, Map<String, Object>> itemsWithOwnership = new HashMap<>();

            for (Map.Entry<String, Long> item : items.entrySet()) {
                String itemName = item.getKey();
                Long price = item.getValue();

                boolean owned = userInventory.stream()
                        .anyMatch(inv -> inv.getItemType().equals(itemType) && inv.getItemName().equals(itemName));

                boolean active = userInventory.stream()
                        .anyMatch(inv -> inv.getItemType().equals(itemType) &&
                                inv.getItemName().equals(itemName) && inv.getIsActive());

                Map<String, Object> itemInfo = Map.of(
                        "price", price,
                        "owned", owned,
                        "active", active
                );

                itemsWithOwnership.put(itemName, itemInfo);
            }

            result.put(itemType, itemsWithOwnership);
        }

        return result;
    }

    @Transactional
    public String purchaseItem(Long userId, String itemType, String itemName) {
        UserEntity user = userService.getUserById(userId);

        // Check if item exists in shop
        if (!SHOP_ITEMS.containsKey(itemType) || !SHOP_ITEMS.get(itemType).containsKey(itemName)) {
            throw new RuntimeException("Item not found in shop");
        }

        // Check if user already owns the item
        if (userInventoryRepository.existsByUserAndItemTypeAndItemName(user, itemType, itemName)) {
            throw new RuntimeException("You already own this item");
        }

        Long itemPrice = SHOP_ITEMS.get(itemType).get(itemName);

        // Check if user has enough coins
        if (user.getCoins() < itemPrice) {
            throw new RuntimeException("Insufficient coins");
        }

        // Deduct coins
        user.setCoins(user.getCoins() - itemPrice);
        userService.saveUser(user);

        // Add item to inventory
        UserInventoryEntity inventoryItem = new UserInventoryEntity(user, itemType, itemName);
        userInventoryRepository.save(inventoryItem);

        return "Item purchased successfully";
    }

    @Transactional
    public String equipItem(Long userId, String itemType, String itemName) {
        UserEntity user = userService.getUserById(userId);

        // Check if user owns the item
        Optional<UserInventoryEntity> inventoryItem =
                userInventoryRepository.findByUserAndItemTypeAndItemName(user, itemType, itemName);

        if (inventoryItem.isEmpty()) {
            throw new RuntimeException("You don't own this item");
        }

        UserInventoryEntity item = inventoryItem.get();

        // Check if item is already equipped
        if (item.getIsActive()) {
            throw new RuntimeException("This item is already equipped");
        }

        // Deactivate all items of the same type
        userInventoryRepository.deactivateAllItemsByType(user, itemType);

        // Activate the selected item
        item.setIsActive(true);
        userInventoryRepository.save(item);

        return "Item equipped successfully";
    }

    @Transactional
    public String unequipItem(Long userId, String itemType, String itemName) {
        UserEntity user = userService.getUserById(userId);

        // Check if user owns the item
        Optional<UserInventoryEntity> inventoryItem =
                userInventoryRepository.findByUserAndItemTypeAndItemName(user, itemType, itemName);

        if (inventoryItem.isEmpty()) {
            throw new RuntimeException("You don't own this item");
        }

        UserInventoryEntity item = inventoryItem.get();

        // Check if item is currently equipped
        if (!item.getIsActive()) {
            throw new RuntimeException("This item is not currently equipped");
        }

        // Deactivate the item
        item.setIsActive(false);
        userInventoryRepository.save(item);

        return "Item unequipped successfully";
    }

    // Keep the old method for backward compatibility
    @Transactional
    public String activateItem(Long userId, String itemType, String itemName) {
        return equipItem(userId, itemType, itemName);
    }

    public List<UserInventoryEntity> getUserInventory(Long userId) {
        UserEntity user = userService.getUserById(userId);
        return userInventoryRepository.findByUser(user);
    }

    public Map<String, String> getActiveItems(Long userId) {
        UserEntity user = userService.getUserById(userId);
        List<UserInventoryEntity> inventory = userInventoryRepository.findByUser(user);

        Map<String, String> activeItems = new HashMap<>();

        for (UserInventoryEntity item : inventory) {
            if (item.getIsActive()) {
                activeItems.put(item.getItemType(), item.getItemName());
            }
        }

        return activeItems;
    }
}