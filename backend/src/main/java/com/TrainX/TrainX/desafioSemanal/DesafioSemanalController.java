package com.TrainX.TrainX.desafioSemanal;

import com.TrainX.TrainX.User.MessageResponse;
import com.TrainX.TrainX.User.UserEntity;
import com.TrainX.TrainX.User.UserService;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/api/desafios-semanales")
public class DesafioSemanalController {

    private final DesafioSemanalService desafioService;
    private final UserService userService;
    private final Random random = new Random();

    @Autowired
    public DesafioSemanalController(DesafioSemanalService desafioService, UserService userService) {
        this.desafioService = desafioService;
        this.userService = userService;
    }

    @PostConstruct
    public void initialize() {
        desafioService.initializeDefaultDesafios();
    }

    @GetMapping
    public ResponseEntity<List<DesafioSemanal>> getAllDesafios() {
        return ResponseEntity.ok(desafioService.getAllDesafios());
    }

    @GetMapping("/activos")
    public ResponseEntity<List<DesafioSemanal>> getActiveDesafios() {
        return ResponseEntity.ok(desafioService.getActiveDesafios());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DesafioSemanal> getDesafioById(@PathVariable Long id) {
        return desafioService.getDesafioById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<DesafioSemanal> createDesafio(@RequestBody DesafioSemanal desafio) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(desafioService.createDesafio(desafio));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DesafioSemanal> updateDesafio(
            @PathVariable Long id,
            @RequestBody DesafioSemanal desafioDetails) {
        return ResponseEntity.ok(desafioService.updateDesafio(id, desafioDetails));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDesafio(@PathVariable Long id) {
        desafioService.deleteDesafio(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/pendientes")
    public ResponseEntity<?> getDesafiosPendientes() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            UserEntity currentUser = userService.getUserByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            // Check if user has completed a challenge within last 7 days
            DesafioCompletionDTO recentCompletion = desafioService.getRecentCompletionForUser(currentUser.getId());
            if (recentCompletion != null) {
                return ResponseEntity.ok(Map.of(
                        "locked", true,
                        "completedDesafio", recentCompletion
                ));
            }

            // Get available challenges and select one randomly
            List<DesafioSemanal> desafiosPendientes =
                    desafioService.getDesafiosPendientesForUser(currentUser.getId());

            if (desafiosPendientes.isEmpty()) {
                return ResponseEntity.ok(Map.of(
                        "locked", false,
                        "message", "No hay desafíos disponibles"
                ));
            }

            // Pick a random challenge
            DesafioSemanal randomDesafio = desafiosPendientes.get(
                    random.nextInt(desafiosPendientes.size()));

            return ResponseEntity.ok(Map.of(
                    "locked", false,
                    "desafio", randomDesafio
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error al obtener desafíos: " + e.getMessage()));
        }
    }

    @GetMapping("/estado")
    public ResponseEntity<?> getEstadoDesafio() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            UserEntity currentUser = userService.getUserByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            // Check if user has completed a challenge within last 7 days
            DesafioCompletionDTO recentCompletion = desafioService.getRecentCompletionForUser(currentUser.getId());

            if (recentCompletion != null) {
                return ResponseEntity.ok(Map.of(
                        "locked", true,
                        "completedDesafio", recentCompletion
                ));
            } else {
                return ResponseEntity.ok(Map.of(
                        "locked", false
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error al obtener estado de desafío: " + e.getMessage()));
        }
    }

    @PostMapping("/{desafioId}/completar")
    public ResponseEntity<?> completarDesafio(@PathVariable Long desafioId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            UserEntity currentUser = userService.getUserByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            boolean completado = desafioService.completarDesafio(currentUser.getId(), desafioId);

            if (completado) {
                DesafioSemanal desafio = desafioService.getDesafioById(desafioId)
                        .orElseThrow(() -> new RuntimeException("Desafío no encontrado"));

                return ResponseEntity.ok(Map.of(
                        "message", "¡Desafío completado exitosamente!",
                        "monedasGanadas", desafio.getValorMonedas(),
                        "monedasTotales", currentUser.getCoins()
                ));
            } else {
                // Check if any challenge was completed in last 7 days
                DesafioCompletionDTO recentCompletion = desafioService.getRecentCompletionForUser(currentUser.getId());

                if (recentCompletion != null) {
                    return ResponseEntity.badRequest()
                            .body(Map.of(
                                    "message", "Ya has completado un desafío esta semana.",
                                    "horasRestantes", recentCompletion.getHorasRestantes(),
                                    "completedDesafio", recentCompletion
                            ));
                } else {
                    return ResponseEntity.badRequest()
                            .body(new MessageResponse("No se pudo completar el desafío."));
                }
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error al completar desafío: " + e.getMessage()));
        }
    }
}