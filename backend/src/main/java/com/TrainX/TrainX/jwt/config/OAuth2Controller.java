package com.TrainX.TrainX.jwt.config;

import com.TrainX.TrainX.User.Role;
import com.TrainX.TrainX.User.UserEntity;
import com.TrainX.TrainX.User.UserService;
import com.TrainX.TrainX.jwt.config.JwtService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class OAuth2Controller {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtService jwtService;

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> request) {
        try {
            // Get user info directly from the request (decoded in frontend)
            String email = request.get("email");
            String firstName = request.get("given_name");
            String lastName = request.get("family_name");

            // Check if user exists
            Optional<UserEntity> existingUser = userService.getUserByEmail(email);
            UserEntity user;

            if (existingUser.isPresent()) {
                // User exists, login
                user = existingUser.get();
            } else {
                // Create new user
                user = createGoogleUser(email, firstName, lastName);
                user = userService.saveUser(user);
            }

            // Generate JWT token
            String token = jwtService.generateToken(user);

            Map<String, Object> responseMap = new HashMap<>();
            responseMap.put("token", token);
            responseMap.put("username", user.getUsername());
            responseMap.put("email", user.getEmail());
            responseMap.put("caminoFitnessId", user.getCaminoFitnessActual() != null ?
                    user.getCaminoFitnessActual().getIdCF() : null);

            return ResponseEntity.ok(responseMap);

        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Google authentication failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }
    }

    private UserEntity createGoogleUser(String email, String firstName, String lastName) {
        Random random = new Random();

        // Generate username from name and surname
        String baseUsername = firstName.toLowerCase() + lastName.toLowerCase();
        String username = baseUsername;
        int counter = 1;

        // Ensure username is unique
        while (userService.existsByUsername(username)) {
            username = baseUsername + counter;
            counter++;
        }

        // Generate random data
        LocalDate randomDateOfBirth = LocalDate.of(
                1980 + random.nextInt(25), // Year between 1980-2004
                1 + random.nextInt(12),    // Month 1-12
                1 + random.nextInt(28)     // Day 1-28 (safe for all months)
        );

        String[] addresses = {
                "Av. Corrientes 1234, Buenos Aires",
                "Av. Santa Fe 5678, Buenos Aires",
                "Av. Rivadavia 9012, Buenos Aires",
                "Av. Cabildo 3456, Buenos Aires"
        };

        String[] sexes = {"male", "female"};


        UserEntity user = new UserEntity(
                username,
                firstName,
                email,
                lastName,
                "google_oauth_" + System.currentTimeMillis(), // Random password (won't be used)
                randomDateOfBirth,
                "11" + (10000000 + random.nextInt(90000000)), // Random phone
                160L + random.nextInt(40), // Height between 160-200cm
                50L + random.nextInt(50),  // Weight between 50-100kg
                "", // userPhoto - empty for now
                sexes[random.nextInt(sexes.length)],
                addresses[random.nextInt(addresses.length)],
                true, // isPublic
                0L,   // coins
                Role.USER
        );

        // ✅ AGREGAR ESTAS LÍNEAS - Google ya verificó el email
        user.setIsVerified(true);
        user.setVerificationToken(null);
        user.setVerificationTokenExpires(null);

        return user;
    }
}