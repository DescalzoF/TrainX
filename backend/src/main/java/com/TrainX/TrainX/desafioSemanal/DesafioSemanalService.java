package com.TrainX.TrainX.desafioSemanal;

import com.TrainX.TrainX.User.UserEntity;
import com.TrainX.TrainX.User.UserService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
public class DesafioSemanalService {

    private final DesafioSemanalRepository desafioRepository;
    private final UserService userService;
    private final DesafioCompletionRepository completionRepository;

    @Autowired
    public DesafioSemanalService(
            DesafioSemanalRepository desafioRepository,
            UserService userService,
            DesafioCompletionRepository completionRepository) {
        this.desafioRepository = desafioRepository;
        this.userService = userService;
        this.completionRepository = completionRepository;
    }

    public List<DesafioSemanal> getAllDesafios() {
        return desafioRepository.findAll();
    }

    public List<DesafioSemanal> getActiveDesafios() {
        return desafioRepository.findByActivoTrue();
    }

    public Optional<DesafioSemanal> getDesafioById(Long id) {
        return desafioRepository.findById(id);
    }

    public DesafioSemanal createDesafio(DesafioSemanal desafio) {
        desafio.setActivo(true);
        return desafioRepository.save(desafio);
    }

    public DesafioSemanal updateDesafio(Long id, DesafioSemanal desafioDetails) {
        DesafioSemanal desafio = desafioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Desafío no encontrado"));

        desafio.setDescripcion(desafioDetails.getDescripcion());
        desafio.setValorMonedas(desafioDetails.getValorMonedas());
        desafio.setActivo(desafioDetails.isActivo());

        return desafioRepository.save(desafio);
    }

    public void deleteDesafio(Long id) {
        desafioRepository.deleteById(id);
    }

    public List<DesafioSemanal> getDesafiosPendientesForUser(Long userId) {
        return desafioRepository.findActiveDesafiosNotCompletedByUser(userId);
    }

    @Transactional
    public boolean completarDesafio(Long userId, Long desafioId) {
        UserEntity user = userService.getUserById(userId);
        DesafioSemanal desafio = desafioRepository.findById(desafioId)
                .orElseThrow(() -> new RuntimeException("Desafío no encontrado"));

        // Verificar si el usuario ya completó este desafío en la última semana
        Optional<DesafioCompletion> recentCompletion = completionRepository
                .findByUsuarioIdAndDesafioIdAndFechaCompletadoAfter(
                        userId,
                        desafioId,
                        LocalDateTime.now().minus(7, ChronoUnit.DAYS)
                );

        if (recentCompletion.isPresent()) {
            return false; // Ya lo completó esta semana
        }

        // Verificar si el usuario completó algún desafío en la última semana
        Optional<DesafioCompletion> anyRecentCompletion = completionRepository
                .findFirstByUsuarioIdAndFechaCompletadoAfterOrderByFechaCompletadoDesc(
                        userId,
                        LocalDateTime.now().minus(7, ChronoUnit.DAYS)
                );

        if (anyRecentCompletion.isPresent()) {
            return false; // Ya completó un desafío esta semana
        }

        // Registrar la completion
        DesafioCompletion completion = new DesafioCompletion();
        completion.setUsuario(user);
        completion.setDesafio(desafio);
        completionRepository.save(completion);

        // Agregar el desafío a la lista de completados del usuario
        user.getDesafiosCompletados().add(desafio);

        // Añadir monedas al usuario
        user.setCoins(user.getCoins() + desafio.getValorMonedas());
        userService.saveUser(user);

        return true;
    }

    public DesafioCompletionDTO getRecentCompletionForUser(Long userId) {
        Optional<DesafioCompletion> recentCompletion = completionRepository
                .findFirstByUsuarioIdOrderByFechaCompletadoDesc(userId);

        if (recentCompletion.isPresent()) {
            DesafioCompletion completion = recentCompletion.get();
            LocalDateTime completionDate = completion.getFechaCompletado();
            LocalDateTime unlockDate = completionDate.plus(7, ChronoUnit.DAYS);

            // Check if completion is within last 7 days
            if (LocalDateTime.now().isBefore(unlockDate)) {
                DesafioCompletionDTO dto = new DesafioCompletionDTO();
                dto.setDesafioId(completion.getDesafio().getId());
                dto.setDescripcion(completion.getDesafio().getDescripcion());
                dto.setValorMonedas(completion.getDesafio().getValorMonedas());
                dto.setFechaCompletado(completionDate);
                dto.setFechaDesbloqueo(unlockDate);

                // Calculate hours remaining until unlock
                long hoursRemaining = LocalDateTime.now().until(unlockDate, ChronoUnit.HOURS);
                dto.setHorasRestantes(hoursRemaining);

                return dto;
            }
        }

        return null;
    }
}