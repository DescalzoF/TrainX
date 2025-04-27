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
    private final ProfileMapper profileMapper;

    @Autowired
    public ProfileController(ProfileService profileService, ProfileMapper profileMapper) {
        this.profileService = profileService;
        this.profileMapper = profileMapper;
    }

    @GetMapping("/me")
    public ResponseEntity<ProfileDTO> getCurrentUserProfile() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();

            System.out.println("Getting profile for: " + username);

            UserEntity user = profileService.getUserByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            System.out.println("User found: " + user.getUsername());

            // Convert to DTO before sending
            ProfileDTO profileDTO = profileMapper.toProfileDTO(user);
            return ResponseEntity.ok(profileDTO);
        } catch (Exception e) {
            System.err.println("Error in /me endpoint: " + e.getMessage());
            throw new RuntimeException("Error retrieving user profile: " + e.getMessage());
        }
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateUser(@RequestBody ProfileDTO profileDTO) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserEntity currentUser = (UserEntity) authentication.getPrincipal();

            // Use the service to update the user
            UserEntity updatedUser = profileService.updateUserFromDTO(currentUser.getId(), profileDTO);

            // Convert back to DTO for response
            ProfileDTO updatedProfileDTO = profileMapper.toProfileDTO(updatedUser);
            return ResponseEntity.ok(updatedProfileDTO);
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