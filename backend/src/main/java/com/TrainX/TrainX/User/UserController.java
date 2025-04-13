package com.TrainX.TrainX.User;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users/me") // Added a base path
public class UserController {
    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Get all users - Requires authentication
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserEntity>> getAllUsers() {
        List<UserEntity> users = userService.listUsers();
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    // Get user by ID - Requires authentication
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or authentication.principal.id == #id")
    public ResponseEntity<UserEntity> getUserById(@PathVariable("id") Long id) {
        try {
            UserEntity user = userService.getUserById(id);
            return new ResponseEntity<>(user, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Update user - Requires authentication
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or authentication.principal.id == #id")
    public ResponseEntity<UserEntity> updateUser(@PathVariable("id") Long id, @RequestBody UserEntity user) {
        try {
            UserEntity updatedUser = userService.updateUser(id, user);
            return new ResponseEntity<>(updatedUser, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Delete user - Requires ADMIN role
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HttpStatus> deleteUser(@PathVariable("id") Long id) {
        try {
            userService.deleteUser(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Search users by name - Fixed parameter name (public endpoint)
    @GetMapping("/search/name/{name}")
    public ResponseEntity<List<UserEntity>> searchUsersByName(@PathVariable String name) {
        List<UserEntity> users = userService.searchUsersByName(name);
        if (users.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    // Search users by surname (public endpoint)
    @GetMapping("/search/surname/{surname}")
    public ResponseEntity<List<UserEntity>> searchUsersBySurname(@PathVariable String surname) {
        List<UserEntity> users = userService.searchUsersBySurname(surname);
        if (users.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    // Add coins to user - Requires ADMIN role
    @PatchMapping("/{id}/coins")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserEntity> addCoins(@PathVariable("id") Long id, @RequestParam Long amount) {
        try {
            UserEntity updatedUser = userService.addCoins(id, amount);
            return new ResponseEntity<>(updatedUser, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Add fitness XP to user - Requires authentication
    @PatchMapping("/{id}/xp")
    @PreAuthorize("hasRole('ADMIN') or authentication.principal.id == #id")
    public ResponseEntity<UserEntity> addFitnessXP(@PathVariable("id") Long id, @RequestParam Long points) {
        try {
            UserEntity updatedUser = userService.addFitnessXP(id, points);
            return new ResponseEntity<>(updatedUser, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Get users with fitness XP greater than a specified value (public endpoint)
    @GetMapping("/fitness/{xpValue}")
    public ResponseEntity<List<UserEntity>> getUsersByFitnessXP(@PathVariable Long xpValue) {
        List<UserEntity> users = userService.getUsersByFitnessXPGreaterThan(xpValue);
        if (users.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    // Get user by email - Requires authentication
    @GetMapping("/email/{email}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserEntity> getUserByEmail(@PathVariable String email) {
        Optional<UserEntity> userData = userService.getUserByEmail(email);
        return userData.map(user -> new ResponseEntity<>(user, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
    @GetMapping("/me")
    public ResponseEntity<?> authenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        UserEntity currentUser = (UserEntity) authentication.getPrincipal();

        return ResponseEntity.ok(currentUser);
    }

    @GetMapping("/")
    public ResponseEntity<List<UserEntity>> allUsers() {
        List <UserEntity> users = userService.listUsers();

        return ResponseEntity.ok(users);
    }


    // The login and register endpoints have been moved to AuthController
}