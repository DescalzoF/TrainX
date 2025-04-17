package com.TrainX.TrainX.Profile;

import com.TrainX.TrainX.User.MessageResponse;
import com.TrainX.TrainX.User.UserEntity;
import com.TrainX.TrainX.User.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {
    private final ProfileService profileService;
    UserService userService = null;
    @Autowired
    public ProfileController(ProfileService profileService) {this.profileService = profileService;}

    @PutMapping("/update")
    public ResponseEntity<UserEntity> updateUser(Authentication authentication, @RequestBody UserEntity userDetails) {
        UserEntity currentUser = (UserEntity) authentication.getPrincipal();
        try {
            UserEntity updatedUser = profileService.updateUser(currentUser.getId(), userDetails);
            return new ResponseEntity<>(updatedUser, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    @GetMapping("/user")
    public ResponseEntity<UserEntity> getCurrentUserProfile(Authentication authentication) {
        UserEntity currentUser = (UserEntity) authentication.getPrincipal();
        UserEntity userProfile = profileService.getUserById(currentUser.getId());
        return new ResponseEntity<>(userProfile, HttpStatus.OK);
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            Optional<UserEntity> userOptional = userService.getUserByUsername(username);

            if (userOptional.isPresent()) {
                return ResponseEntity.ok(userOptional.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new MessageResponse("User not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error retrieving user profile: " + e.getMessage()));
        }
    }
}
