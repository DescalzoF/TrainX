package com.TrainX.TrainX.Profile;

import com.TrainX.TrainX.User.UserEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {
    private final ProfileService profileService;
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
}
