package com.TrainX.TrainX.jwt.controller;

import com.TrainX.TrainX.User.MessageResponse;
import com.TrainX.TrainX.User.UserEntity;
import com.TrainX.TrainX.jwt.config.JwtService;
import com.TrainX.TrainX.jwt.dtos.*;
import com.TrainX.TrainX.jwt.services.AuthenticationService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

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
        response.setId(user.getId());

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

            // Validate that date of birth is in the past
            if (user.getDateOfBirth() != null && user.getDateOfBirth().isAfter(LocalDate.now())) {
                return ResponseEntity.badRequest().body(new MessageResponse("Date of birth cannot be in the future"));
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
    public ResponseEntity<String> forgotPassword(
            @RequestBody ForgotPasswordDto dto,
            HttpServletRequest request) {
        try {
            // ✅ Obtener IP del cliente
            String clientIp = getClientIp(request);

            boolean emailSent = authService.sendPasswordResetEmail(dto.getEmail(), clientIp);

            return ResponseEntity.ok(
                    "Si el correo electrónico está registrado, recibirás un enlace de recuperación. " +
                            "Solo puedes solicitar un nuevo enlace cada 5 minutos."
            );

        } catch (Exception e) {
            System.err.println("Error in forgot password: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error interno del servidor");
        }
    }

    // ✅ Método helper para obtener IP real
    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }

        return request.getRemoteAddr();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordDto dto) {
        if (dto.getToken() == null || dto.getToken().isEmpty()) {
            return ResponseEntity.badRequest().body("Token requerido");
        }

        if (dto.getNewPassword() == null || dto.getNewPassword().isEmpty()) {
            return ResponseEntity.badRequest().body("La contraseña no puede estar vacía");
        }

        boolean reset = authService.resetPasswordWithToken(dto.getToken(), dto.getNewPassword());

        if (reset) {
            return ResponseEntity.ok("Contraseña actualizada correctamente");
        }
        return ResponseEntity.badRequest().body("Token inválido o expirado");
    }

    // En AuthController.java, agregar:
    @GetMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestParam String token) {
        try {
            boolean verified = authService.verifyEmail(token);

            if (verified) {
                return ResponseEntity.ok(new MessageResponse("Email verified successfully. You can now login."));
            } else {
                return ResponseEntity.badRequest().body(new MessageResponse("Invalid or expired verification token"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error during verification: " + e.getMessage()));
        }
    }
    @GetMapping("/validate-reset-token")
    public ResponseEntity<?> validateResetToken(@RequestParam String token) {
        try {
            // ✅ Usar el AuthenticationService para validar el token de reset
            boolean isValid = authService.isPasswordResetTokenValid(token);

            if (isValid) {
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.badRequest().body("Token expirado o inválido");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Token expirado o inválido");
        }
    }

}