package com.TrainX.TrainX.shop;

import com.TrainX.TrainX.User.MessageResponse;
import com.TrainX.TrainX.User.UserEntity;
import com.TrainX.TrainX.User.UserService;
import com.TrainX.TrainX.inventory.UserInventoryEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/shop")
public class ShopController {

    @Autowired
    private ShopService shopService;

    @Autowired
    private UserService userService;

    @GetMapping("/items")
    public ResponseEntity<?> getShopItems() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            UserEntity currentUser = userService.getUserByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Map<String, Object> shopItems = shopService.getShopItemsWithOwnership(currentUser.getId());
            return ResponseEntity.ok(shopItems);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error retrieving shop items: " + e.getMessage()));
        }
    }

    @PostMapping("/purchase")
    public ResponseEntity<?> purchaseItem(@RequestBody Map<String, String> request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            UserEntity currentUser = userService.getUserByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String itemType = request.get("itemType");
            String itemName = request.get("itemName");

            String result = shopService.purchaseItem(currentUser.getId(), itemType, itemName);
            return ResponseEntity.ok(new MessageResponse(result));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error purchasing item: " + e.getMessage()));
        }
    }

    @PostMapping("/equip")
    public ResponseEntity<?> equipItem(@RequestBody Map<String, String> request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            UserEntity currentUser = userService.getUserByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String itemType = request.get("itemType");
            String itemName = request.get("itemName");

            String result = shopService.equipItem(currentUser.getId(), itemType, itemName);
            return ResponseEntity.ok(new MessageResponse(result));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error equipping item: " + e.getMessage()));
        }
    }

    @PostMapping("/unequip")
    public ResponseEntity<?> unequipItem(@RequestBody Map<String, String> request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            UserEntity currentUser = userService.getUserByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String itemType = request.get("itemType");
            String itemName = request.get("itemName");

            String result = shopService.unequipItem(currentUser.getId(), itemType, itemName);
            return ResponseEntity.ok(new MessageResponse(result));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error unequipping item: " + e.getMessage()));
        }
    }

    // Keep the old activate endpoint for backward compatibility
    @PostMapping("/activate")
    public ResponseEntity<?> activateItem(@RequestBody Map<String, String> request) {
        return equipItem(request);
    }

    @GetMapping("/inventory")
    public ResponseEntity<?> getUserInventory() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            UserEntity currentUser = userService.getUserByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<UserInventoryEntity> inventory = shopService.getUserInventory(currentUser.getId());
            return ResponseEntity.ok(inventory);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error retrieving inventory: " + e.getMessage()));
        }
    }

    @GetMapping("/active-items")
    public ResponseEntity<?> getActiveItems() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            UserEntity currentUser = userService.getUserByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Map<String, String> activeItems = shopService.getActiveItems(currentUser.getId());
            return ResponseEntity.ok(activeItems);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error retrieving active items: " + e.getMessage()));
        }
    }
}