package com.TrainX.TrainX.duels;

import com.TrainX.TrainX.User.UserDuelDTO;
import com.TrainX.TrainX.User.UserEntity;
import com.TrainX.TrainX.User.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/duels")
public class DuelController {

    private final DuelService duelService;
    private final UserService userService;

    @Autowired
    public DuelController(DuelService duelService, UserService userService) {
        this.duelService = duelService;
        this.userService = userService;
    }

    @GetMapping("/users-same-level")
    public ResponseEntity<List<UserDuelDTO>> getUsersInSameLevel(@AuthenticationPrincipal UserEntity currentUser) {
        try {
            System.out.println("Current user: " + currentUser.getUsername() + ", Level: " +
                    (currentUser.getLevel() != null ? currentUser.getLevel().getIdLevel() : "null"));

            List<UserEntity> users = duelService.getUsersInSameLevel(currentUser);

            // Filter out the admin user
            users = users.stream()
                    .filter(user -> !"TrainXAdmin".equals(user.getUsername()))
                    .collect(Collectors.toList());

            // Print out names for debugging
            users.forEach(user -> System.out.println("User found: " + user.getUsername()));

            // Shuffle the list and limit to 10-15 random users
            Collections.shuffle(users);
            int limit;
            if (users.size() <= 10) {
                limit = users.size(); // Show all users if 10 or fewer
            } else {
                limit = 10 + new Random().nextInt(6); // Random number between 10-15
            }

            List<UserEntity> randomUsers = users.stream().limit(limit).collect(Collectors.toList());

            List<UserDuelDTO> userDTOs = randomUsers.stream()
                    .map(user -> {
                        UserDuelDTO dto = new UserDuelDTO();
                        dto.setId(user.getId());
                        dto.setUsername(user.getUsername());
                        if (user.getXpFitnessEntity() != null) {
                            dto.setTotalXp(user.getXpFitnessEntity().getTotalXp());
                        } else {
                            dto.setTotalXp(0L);
                        }
                        if (user.getCaminoFitnessActual() != null) {
                            dto.setCaminoFitnessName(user.getCaminoFitnessActual().getNameCF());
                        } else {
                            dto.setCaminoFitnessName("Unknown");
                        }
                        return dto;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(userDTOs);
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/challenge")
    public ResponseEntity<?> challengeUser(
            @AuthenticationPrincipal UserEntity currentUser,
            @RequestBody DuelChallengeRequestDTO request) {
        try {
            // First deduct coins
            if (request.getBetAmount() > 0) {
                duelService.deductCoinsForDuel(currentUser.getId(), request.getBetAmount());
            }

            // Then create the duel without coin deduction
            DuelEntity duel = duelService.createDuel(
                    currentUser,
                    request.getChallengedUserId(),
                    request.getBetAmount());

            return ResponseEntity.status(HttpStatus.CREATED).body(convertToResponseDTO(duel));
        } catch (ResponseStatusException e) {
            return ResponseEntity
                    .status(e.getStatusCode())
                    .body(Map.of("error", e.getReason()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An unexpected error occurred"));
        }
    }

    @PostMapping("/{duelId}/accept")
    public ResponseEntity<DuelResponseDTO> acceptDuel(
            @AuthenticationPrincipal UserEntity currentUser,
            @PathVariable Long duelId) {
        try {
            duelService.acceptDuel(duelId, currentUser);
            DuelEntity duel = duelService.getDuelById(duelId);
            return ResponseEntity.ok(convertToResponseDTO(duel));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).build();
        }
    }

    @PostMapping("/{duelId}/reject")
    public ResponseEntity<DuelResponseDTO> rejectDuel(
            @AuthenticationPrincipal UserEntity currentUser,
            @PathVariable Long duelId) {
        try {
            duelService.rejectDuel(duelId, currentUser);
            DuelEntity duel = duelService.getDuelById(duelId);
            return ResponseEntity.ok(convertToResponseDTO(duel));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).build();
        }
    }

    @GetMapping("/pending")
    public ResponseEntity<PendingDuelsResponseDTO> getPendingDuels(
            @AuthenticationPrincipal UserEntity currentUser) {
        List<DuelEntity> allPendingDuels = duelService.getPendingDuels(currentUser);

        // Filter to only include duels where the current user is the challenged user
        List<DuelEntity> incomingChallenges = allPendingDuels.stream()
                .filter(duel -> duel.getChallenged().getId().equals(currentUser.getId()))
                .collect(Collectors.toList());

        List<DuelResponseDTO> duelsDTO = incomingChallenges.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());

        // Count is the same as the filtered list size
        int pendingRequestsCount = incomingChallenges.size();

        PendingDuelsResponseDTO response = new PendingDuelsResponseDTO();
        response.setPendingDuels(duelsDTO);
        response.setPendingRequestsCount(pendingRequestsCount);

        return ResponseEntity.ok(response);
    }
    @GetMapping("/active")
    public ResponseEntity<List<DuelResponseDTO>> getActiveDuels(
            @AuthenticationPrincipal UserEntity currentUser) {
        List<DuelEntity> duels = duelService.getActiveDuels(currentUser);
        List<DuelResponseDTO> duelsDTO = duels.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(duelsDTO);
    }
    @GetMapping("/active-duel")
    public ResponseEntity<ActiveDuelResponseDTO> getActiveDuelForUser(
            @AuthenticationPrincipal UserEntity currentUser) {
        try {
            List<DuelEntity> activeDuels = duelService.getActiveDuels(currentUser);

            // Create response object
            ActiveDuelResponseDTO response = new ActiveDuelResponseDTO();

            // Check if user has any active duel
            if (activeDuels.isEmpty()) {
                response.setHasActiveDuel(false);
                response.setDuel(null);
            } else {
                // Get the first active duel (a user should only have one)
                DuelEntity activeDuel = activeDuels.get(0);
                DuelResponseDTO duelDTO = convertToResponseDTO(activeDuel);

                response.setHasActiveDuel(true);
                response.setDuel(duelDTO);
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/finished")
    public ResponseEntity<List<DuelResponseDTO>> getFinishedDuels(
            @AuthenticationPrincipal UserEntity currentUser) {
        List<DuelEntity> duels = duelService.getFinishedDuels(currentUser);
        List<DuelResponseDTO> duelsDTO = duels.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(duelsDTO);
    }

    @GetMapping("/{duelId}/exercise-today")
    public ResponseEntity<DuelDiaryExerciseDTO> getTodaysExercise(
            @PathVariable Long duelId) {
        try {
            DuelDiaryExerciseEntity diaryExercise = duelService.getTodaysExercise(duelId);
            return ResponseEntity.ok(convertToDiaryExerciseDTO(diaryExercise));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).build();
        }
    }

    @PostMapping("/{duelId}/exercises/{exerciseId}/complete")
    public ResponseEntity<DuelDiaryExerciseDTO> markExerciseAsCompleted(
            @AuthenticationPrincipal UserEntity currentUser,
            @PathVariable Long duelId,
            @PathVariable Long exerciseId) {
        try {
            duelService.markExerciseAsCompleted(duelId, exerciseId, currentUser);
            DuelDiaryExerciseEntity diaryExercise = duelService.getDiaryExerciseById(exerciseId);
            return ResponseEntity.ok(convertToDiaryExerciseDTO(diaryExercise));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).build();
        }
    }

    @PostMapping("/check-expired")
    public ResponseEntity<CheckExpiredDuelsResponseDTO> checkExpiredDuels() {
        try {
            duelService.checkExpiredDuels();
            return ResponseEntity.ok(new CheckExpiredDuelsResponseDTO("Expired duels checked and updated."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new CheckExpiredDuelsResponseDTO("Failed to check expired duels."));
        }
    }

    @GetMapping("/{duelId}/exercises")
    public ResponseEntity<List<DuelDiaryExerciseDTO>> getDuelExercises(
            @PathVariable Long duelId) {
        List<DuelDiaryExerciseEntity> exercises = duelService.getDuelExercises(duelId);
        List<DuelDiaryExerciseDTO> exercisesDTO = exercises.stream()
                .map(this::convertToDiaryExerciseDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(exercisesDTO);
    }

    private DuelResponseDTO convertToResponseDTO(DuelEntity duel) {
        DuelResponseDTO dto = new DuelResponseDTO();
        dto.setId(duel.getId());
        dto.setChallengerId(duel.getChallenger().getId());
        dto.setChallengerUsername(duel.getChallenger().getUsername());
        dto.setChallengedId(duel.getChallenged().getId());
        dto.setChallengedUsername(duel.getChallenged().getUsername());
        dto.setStartDate(duel.getStartDate());
        dto.setEndDate(duel.getEndDate());
        dto.setStatus(duel.getStatus());
        dto.setChallengerScore(duel.getChallengerScore());
        dto.setChallengedScore(duel.getChallengedScore());
        dto.setBetAmount(duel.getBetAmount());

        // Set winner to null for pending duels
        if (duel.getStatus() == DuelStatus.PENDING || duel.getStatus() == DuelStatus.ACTIVE) {
            dto.setWinnerUsername(null);
        } else {
            UserEntity winner = duel.getWinner();
            if (winner != null) {
                dto.setWinnerUsername(winner.getUsername());
            } else {
                dto.setWinnerUsername(null); // Explicitly set to null for ties
            }
        }

        return dto;
    }

    private DuelDiaryExerciseDTO convertToDiaryExerciseDTO(DuelDiaryExerciseEntity diaryExercise) {
        DuelDiaryExerciseDTO dto = new DuelDiaryExerciseDTO();
        dto.setId(diaryExercise.getId());
        dto.setExerciseId(diaryExercise.getExercise().getId());
        dto.setExerciseName(diaryExercise.getExercise().getName());
        dto.setExerciseDescription(diaryExercise.getExercise().getDescription());
        dto.setDate(diaryExercise.getDate());
        dto.setDayOfWeek(diaryExercise.getDayOfWeek().toString());
        dto.setCompletedByChallenger(diaryExercise.getCompletedByChallenger());
        dto.setCompletedByChallenged(diaryExercise.getCompletedByChallenged());
        return dto;
    }
    @GetMapping("/history")
    public ResponseEntity<List<HistorialDuelDTO>> getUserDuelHistory(
            @AuthenticationPrincipal UserEntity currentUser) {
        try {
            List<DuelEntity> finishedDuels = duelService.getUserDuelHistory(currentUser);
            List<HistorialDuelDTO> historialDuels = finishedDuels.stream()
                    .map(duel -> convertToHistorialDTO(duel, currentUser))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(historialDuels);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/user/{userId}/wins")
    public ResponseEntity<UserDuelWinsDTO> getUserDuelWins(@PathVariable Long userId) {
        Long wins = duelService.countUserDuelWins(userId);
        UserDuelWinsDTO dto = new UserDuelWinsDTO(userId, wins);
        return ResponseEntity.ok(dto);
    }

    private HistorialDuelDTO convertToHistorialDTO(DuelEntity duel, UserEntity currentUser) {
        HistorialDuelDTO dto = new HistorialDuelDTO();

        // Basic duel information
        dto.setId(duel.getId());
        dto.setChallengerUsername(duel.getChallenger().getUsername());
        dto.setChallengedUsername(duel.getChallenged().getUsername());
        dto.setStartDate(duel.getStartDate());
        dto.setEndDate(duel.getEndDate());
        dto.setChallengerScore(duel.getChallengerScore());
        dto.setChallengedScore(duel.getChallengedScore());
        dto.setBetAmount(duel.getBetAmount());

        // Determine if current user was challenger
        boolean isChallenger = duel.getChallenger().getId().equals(currentUser.getId());
        dto.setWasUserChallenger(isChallenger);

        // Set opponent username based on who the current user is
        if (isChallenger) {
            dto.setOpponentUsername(duel.getChallenged().getUsername());
        } else {
            dto.setOpponentUsername(duel.getChallenger().getUsername());
        }

        // Determine winner
        UserEntity winner = duel.getWinner();
        if (winner == null) {
            // It's a tie
            dto.setWinnerUsername("Empate");
            dto.setUserWon(false);
            dto.setWasTie(true);
        } else {
            dto.setWinnerUsername(winner.getUsername());
            dto.setUserWon(winner.getId().equals(currentUser.getId()));
            dto.setWasTie(false);
        }

        return dto;
    }
}