package com.TrainX.TrainX.desafioSemanal;

import com.TrainX.TrainX.User.MessageResponse;
import com.TrainX.TrainX.User.UserEntity;
import com.TrainX.TrainX.User.UserService;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/desafios-semanales")
public class DesafioSemanalController {

    private final DesafioSemanalService desafioService;
    private final UserService userService;

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
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DesafioSemanal> createDesafio(@RequestBody DesafioSemanal desafio) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(desafioService.createDesafio(desafio));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DesafioSemanal> updateDesafio(
            @PathVariable Long id,
            @RequestBody DesafioSemanal desafioDetails) {
        return ResponseEntity.ok(desafioService.updateDesafio(id, desafioDetails));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
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

            List<DesafioSemanal> desafiosPendientes =
                    desafioService.getDesafiosPendientesForUser(currentUser.getId());

            return ResponseEntity.ok(desafiosPendientes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error al obtener desafíos: " + e.getMessage()));
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
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Ya has completado este desafío esta semana."));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error al completar desafío: " + e.getMessage()));
        }
    }
}