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

    // Get user by email - Requires authentication
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

    @PutMapping("/{userId}/camino-y-nivel")
    public ResponseEntity<String> assignCaminoAndLevelToUser(
            @PathVariable Long userId,
            @RequestBody Map<String, Long> request) {
        try {
            Long caminoFitnessId = request.get("caminoFitnessId");

            // Obtener el CaminoFitness desde la base de datos
            CaminoFitnessEntity caminoFitness = caminoFitnessService.findById(caminoFitnessId)
                    .orElseThrow(() -> new RuntimeException("Camino no encontrado"));

            // Asignar el CaminoFitness al usuario
            userService.assignCaminoFitness(userId, caminoFitnessId);

            // Obtener el nivel "Principiante" del CaminoFitness
            LevelEntity nivelPrincipiante = levelRepository.findByNameLevelAndCaminos_IdCF("Principiante", caminoFitnessId)
                    .orElseThrow(() -> new RuntimeException("Nivel Principiante no encontrado para el camino"));

            // Asignar el nivel Principiante al usuario
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
            // Obtener el nombre de usuario de la autenticación actual
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            // Validar que el usuario está autenticado
            if (authentication == null || !authentication.isAuthenticated()) {
                MessageResponse messageResponse = new MessageResponse("Error: Usuario no autenticado.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(messageResponse);
            }

            String username = authentication.getName();

            // Obtener los detalles del usuario
            UserEntity currentUser = userService.getUserByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Obtener el levelId de manera segura
            Long levelId = null;
            if (currentUser.getLevel() != null) {
                levelId = currentUser.getLevel().getIdLevel();
            } else {
                System.out.println("No se encontró el level para el usuario.");
            }

            // Obtener el caminoFitnessId de manera segura
            Long caminoFitnessId = null;
            if (currentUser.getCaminoFitnessActual() != null) {
                caminoFitnessId = currentUser.getCaminoFitnessActual().getIdCF();
            } else {
                System.out.println("No se encontró el camino fitness para el usuario.");
            }

            // Imprimir los valores de los ids para depuración
            System.out.println("Level ID: " + levelId);
            System.out.println("Camino Fitness ID: " + caminoFitnessId);

            // Si ambos valores son nulos, devolver error
            if (levelId == null || caminoFitnessId == null) {
                MessageResponse messageResponse = new MessageResponse("Error: El usuario no tiene configurado el camino fitness o el nivel.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(messageResponse);
            }

            // Respuesta con los valores de levelId y caminoFitnessId
            Map<String, Long> response = Map.of(
                    "id", currentUser.getId(),
                    "caminoFitnessId", caminoFitnessId,
                    "levelId", levelId
            );

            // Retornar los valores correctos
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // En caso de error, devolver un mensaje con la excepción
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
        return ResponseEntity.notFound().build();
    }


}


