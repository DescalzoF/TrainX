// ProfileController.java updates
package com.TrainX.TrainX.Profile;

import com.TrainX.TrainX.User.MessageResponse;
import com.TrainX.TrainX.User.UserEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {
    private final ProfileService profileService;

    @Autowired
    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserEntity> getCurrentUserProfile() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();

            UserEntity user = profileService.getUserByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            throw new RuntimeException("User not found: " + e.getMessage());
        } catch (Exception e) {
            throw new RuntimeException("Error retrieving user profile: " + e.getMessage());
        }
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateUser(@RequestBody UserEntity userDetails) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserEntity currentUser = (UserEntity) authentication.getPrincipal();
            UserEntity updatedUser = profileService.updateUser(currentUser.getId(), userDetails);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Error updating profile: " + e.getMessage()));
        }
    }

    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteUserAccount() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserEntity currentUser = (UserEntity) authentication.getPrincipal();
            profileService.deleteUserAccount(currentUser.getId());
            return ResponseEntity.ok(new MessageResponse("User account successfully deleted"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error deleting account: " + e.getMessage()));
        }
    }
}