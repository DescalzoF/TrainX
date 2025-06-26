package com.TrainX.TrainX.auth;

import com.TrainX.TrainX.User.Role;
import com.TrainX.TrainX.User.UserEntity;
import com.TrainX.TrainX.User.UserService;
import com.TrainX.TrainX.jwt.JwtService;
import com.TrainX.TrainX.jwt.dtos.AuthResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class GoogleAuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${google.client.id}")
    private String googleClientId;

    @PostMapping("/google")
    public ResponseEntity<?> authenticateWithGoogle(@RequestBody Map<String, String> request) {
        try {
            String googleToken = request.get("token");

            if (googleToken == null || googleToken.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Google token is required"));
            }

            // Verify Google token and get user info
            GoogleUserInfo googleUserInfo = verifyGoogleToken(googleToken);

            if (googleUserInfo == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid Google token"));
            }

            // Check if user already exists by email
            Optional<UserEntity> existingUser = userService.getUserByEmail(googleUserInfo.getEmail());

            UserEntity user;
            boolean isNewUser = false;

            if (existingUser.isPresent()) {
                user = existingUser.get();
            } else {
                // Create new user from Google info
                user = createUserFromGoogleInfo(googleUserInfo);
                isNewUser = true;
            }

            // Generate JWT token
            String jwtToken = jwtService.generateToken(user);

            AuthResponse authResponse = new AuthResponse();
            authResponse.setToken(jwtToken);
            authResponse.setUsername(user.getUsername());
            authResponse.setMessage(isNewUser ? "Account created successfully with Google" : "Login successful");

            return ResponseEntity.ok(authResponse);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error during Google authentication: " + e.getMessage()));
        }
    }

    private GoogleUserInfo verifyGoogleToken(String token) {
        try {
            String url = "https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=" + token;
            RestTemplate restTemplate = new RestTemplate();
            String response = restTemplate.getForObject(url, String.class);

            ObjectMapper mapper = new ObjectMapper();
            JsonNode jsonNode = mapper.readTree(response);

            // Verify the token is for our client
            String aud = jsonNode.get("aud").asText();
            if (!googleClientId.equals(aud)) {
                return null;
            }

            GoogleUserInfo userInfo = new GoogleUserInfo();
            userInfo.setEmail(jsonNode.get("email").asText());
            userInfo.setGivenName(jsonNode.get("given_name").asText());
            userInfo.setFamilyName(jsonNode.get("family_name").asText());
            userInfo.setPicture(jsonNode.has("picture") ? jsonNode.get("picture").asText() : "");

            return userInfo;

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    private UserEntity createUserFromGoogleInfo(GoogleUserInfo googleUserInfo) {
        // Generate username from name and surname
        String username = generateUsername(googleUserInfo.getGivenName(), googleUserInfo.getFamilyName());

        // Generate a random password since it won't be used for Google users
        String randomPassword = passwordEncoder.encode(UUID.randomUUID().toString());

        UserEntity newUser = new UserEntity(
                username,
                googleUserInfo.getGivenName(),
                googleUserInfo.getEmail(),
                googleUserInfo.getFamilyName(),
                randomPassword,
                LocalDate.of(1990, 1, 1), // Default date, user can update later
                "000-000-0000", // Default phone, user can update later
                170L, // Default height, user can update later
                70L, // Default weight, user can update later
                googleUserInfo.getPicture(), // Google profile picture
                "other", // Default sex, user can update later
                "Not specified", // Default address, user can update later
                true, // Default to public profile
                0L, // Start with 0 coins
                Role.USER
        );

        return userService.saveUser(newUser);
    }

    private String generateUsername(String givenName, String familyName) {
        String baseUsername = (givenName + familyName).toLowerCase().replaceAll("[^a-zA-Z0-9]", "");
        String username = baseUsername;
        int counter = 1;

        // Ensure username is unique
        while (userService.existsByUsername(username)) {
            username = baseUsername + counter;
            counter++;
        }

        return username;
    }

    // Inner class for Google user info
    private static class GoogleUserInfo {
        private String email;
        private String givenName;
        private String familyName;
        private String picture;

        // Getters and setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getGivenName() { return givenName; }
        public void setGivenName(String givenName) { this.givenName = givenName; }

        public String getFamilyName() { return familyName; }
        public void setFamilyName(String familyName) { this.familyName = familyName; }

        public String getPicture() { return picture; }
        public void setPicture(String picture) { this.picture = picture; }
    }
}