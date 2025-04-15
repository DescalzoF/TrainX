package com.TrainX.TrainX.jwt.controller;

import com.TrainX.TrainX.User.MessageResponse;
import com.TrainX.TrainX.User.Role;
import com.TrainX.TrainX.User.UserEntity;
import com.TrainX.TrainX.jwt.config.JwtService;
import com.TrainX.TrainX.jwt.dtos.*;
import com.TrainX.TrainX.jwt.services.AuthenticationService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@AllArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final JwtService jwtService;
    private final AuthenticationService authService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticate(@RequestBody LoginRequest loginRequest) {

        UserEntity user = authService.login(loginRequest); // ✅ Esto autentica bien y lanza excepción si es incorrecto

        String jwtToken = jwtService.generateToken(user);
        LoginResponse response = new LoginResponse();
        response.setToken(jwtToken);
        response.setExpiresIn(jwtService.getExpirationTime());
        response.setUsername(user.getUsername());

        return ResponseEntity.ok(response);

    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterUserDto user) {
        try {
            // Check if username or email already exists
            if (authService.existsByUsername(user.getUsername())) {
                return ResponseEntity.badRequest().body(new MessageResponse("Username is already taken"));
            }

            if (authService.existsByEmail(user.getEmail())) {
                return ResponseEntity.badRequest().body(new MessageResponse("Email is already in use"));
            }

            // Create user
            UserEntity savedUser = authService.createUser(user);

            System.out.println(savedUser.getUsername() + " registered successfully");

            Map<String, Object> response = new HashMap<>();
            response.put("userId", savedUser.getId());
            response.put("username", savedUser.getUsername());
            response.put("role", savedUser.getRole().name());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error during registration: " + e.getMessage()));
        }
    }
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok(new MessageResponse("Logout successful"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordDto dto) {
        Optional<UserEntity> userOpt = authService.getUserByUsername(dto.getUsername());

        if (userOpt.isPresent() && userOpt.get().getEmail().equalsIgnoreCase(dto.getEmail())) {
            return ResponseEntity.ok("Identidad confirmada");
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Usuario o email incorrecto");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordDto dto) {
        if (dto.getNewPassword() == null || dto.getNewPassword().isEmpty()) {
            return ResponseEntity.badRequest().body("La contraseña no puede estar vacía");
        }

        authService.updateUserPassword(dto.getUsername(), dto.getNewPassword());
        return ResponseEntity.ok("Contraseña actualizada correctamente");
    }


}