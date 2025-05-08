package com.TrainX.TrainX.User;

import com.TrainX.TrainX.caminoFitness.CaminoFitnessEntity;
import com.TrainX.TrainX.caminoFitness.CaminoFitnessService;
import com.TrainX.TrainX.jwt.dtos.UserXpWithLevelDTO;
import com.TrainX.TrainX.level.LevelEntity;
import com.TrainX.TrainX.level.LevelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;
    private final CaminoFitnessService caminoFitnessService;
    private final LevelRepository levelRepository;

    @Autowired
    public UserController(UserService userService, CaminoFitnessService caminoFitnessService, LevelRepository levelRepository) {
        this.userService = userService;
        this.caminoFitnessService = caminoFitnessService;
        this.levelRepository = levelRepository;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserEntity>> getAllUsers() {
        List<UserEntity> users = userService.listUsers();
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

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

    @GetMapping("/email/{email}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserEntity> getUserByEmail(@PathVariable String email) {
        Optional<UserEntity> userData = userService.getUserByEmail(email);
        return userData.map(user -> new ResponseEntity<>(user, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping({"/currentUser"})
    public ResponseEntity<?> getCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            UserEntity currentUser = userService.getUserByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
            Map<String, Object> response = Map.of("id", currentUser.getId(), "username", currentUser.getUsername(), "email", currentUser.getEmail(), "caminoFitnessId", currentUser.getCaminoFitnessActual() != null ? currentUser.getCaminoFitnessActual().getIdCF() : null);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponse("Error retrieving user profile: " + e.getMessage()));
        }
    }

    @PutMapping("/{userId}/unassign-camino-y-nivel")
    public ResponseEntity<String> unassignCaminoAndLevelFromUser(@PathVariable Long userId) {
        try {
            UserEntity user = userService.getUserById(userId);

            // Unassign the camino fitness
            user.setCaminoFitnessActual(null);

            // Unassign the level
            user.setLevel(null);

            // Save the updated user
            userService.saveUser(user);

            return ResponseEntity.ok("Camino y nivel desasignados correctamente.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Error: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al desasignar camino y nivel: " + e.getMessage());
        }
    }

    @PutMapping("/{userId}/camino-y-nivel")
    public ResponseEntity<String> assignCaminoAndLevelToUser(
            @PathVariable Long userId,
            @RequestBody Map<String, Long> request) {
        try {
            Long caminoFitnessId = request.get("caminoFitnessId");

            CaminoFitnessEntity caminoFitness = caminoFitnessService.findById(caminoFitnessId)
                    .orElseThrow(() -> new RuntimeException("Camino no encontrado"));

            userService.assignCaminoFitness(userId, caminoFitnessId);

            LevelEntity nivelPrincipiante = levelRepository.findByNameLevelAndCaminos_IdCF("Principiante", caminoFitnessId)
                    .orElseThrow(() -> new RuntimeException("Nivel Principiante no encontrado para el camino"));

            userService.assignLevel(userId, nivelPrincipiante.getIdLevel());

            return ResponseEntity.ok("Camino y nivel asignados correctamente.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Error: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al asignar camino y nivel.");
        }
    }

    @GetMapping("/{id}/camino")
    @PreAuthorize("hasRole('ADMIN') or authentication.principal.id == #id")
    public ResponseEntity<Map<String, Long>> getUserCamino(
            @PathVariable Long id) {

        UserEntity user = userService.getUserById(id);

        CaminoFitnessEntity cf = user.getCaminoFitnessActual();

        Long caminoId = (cf != null) ? cf.getIdCF() : null;

        assert caminoId != null;
        return ResponseEntity.ok(Map.of("caminoFitnessId", caminoId));
    }

    @GetMapping("/current-camino")
    public ResponseEntity<?> getCurrentUserCamino() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            UserEntity currentUser = userService.getUserByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            CaminoFitnessEntity cf = currentUser.getCaminoFitnessActual();
            Long caminoId = (cf != null) ? cf.getIdCF() : null;

            return ResponseEntity.ok(Map.of("caminoFitnessId", caminoId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error retrieving user's camino: " + e.getMessage()));
        }
    }

    @GetMapping("/exerciseDetails")
    public ResponseEntity<Object> getUserExerciseDetails() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication == null || !authentication.isAuthenticated()) {
                MessageResponse messageResponse = new MessageResponse("Error: Usuario no autenticado.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(messageResponse);
            }

            String username = authentication.getName();

            UserEntity currentUser = userService.getUserByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Long levelId = null;
            if (currentUser.getLevel() != null) {
                levelId = currentUser.getLevel().getIdLevel();
            } else {
                System.out.println("No se encontró el level para el usuario.");
            }

            Long caminoFitnessId = null;
            if (currentUser.getCaminoFitnessActual() != null) {
                caminoFitnessId = currentUser.getCaminoFitnessActual().getIdCF();
            } else {
                System.out.println("No se encontró el camino fitness para el usuario.");
            }

            System.out.println("Level ID: " + levelId);
            System.out.println("Camino Fitness ID: " + caminoFitnessId);

            if (levelId == null || caminoFitnessId == null) {
                MessageResponse messageResponse = new MessageResponse("Error: El usuario no tiene configurado el camino fitness o el nivel.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(messageResponse);
            }

            Map<String, Long> response = Map.of(
                    "id", currentUser.getId(),
                    "caminoFitnessId", caminoFitnessId,
                    "levelId", levelId
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            MessageResponse messageResponse = new MessageResponse("Error retrieving user profile: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(messageResponse);
        }
    }

    @GetMapping("/{userId}/xp-level")
    public ResponseEntity<UserXpWithLevelDTO> getUserXpWithLevel(@PathVariable Long userId) {
        UserXpWithLevelDTO userXpWithLevel = userService.getUserXpWithLevel(userId);
        if (userXpWithLevel != null) {
            return ResponseEntity.ok(userXpWithLevel);
        }
        return null;
    }

    @GetMapping("/role")
    public ResponseEntity<?> getUserRole() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            UserEntity currentUser = userService.getUserByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Role userRole = currentUser.getRole();

            return ResponseEntity.ok(Map.of("role", userRole.toString()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error retrieving user's role: " + e.getMessage()));
        }
    }
    
    @GetMapping("/current/coins")
    public ResponseEntity<?> getCurrentUserCoins() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            UserEntity currentUser = userService.getUserByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Map<String, Long> response = Map.of("coins", currentUser.getCoins() != null ? currentUser.getCoins() : 0L);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error retrieving user coins: " + e.getMessage()));
        }
    }
}