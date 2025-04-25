package com.TrainX.TrainX.User;

import com.TrainX.TrainX.caminoFitness.CaminoFitnessEntity;
import com.TrainX.TrainX.caminoFitness.CaminoFitnessService;
import com.TrainX.TrainX.level.LevelEntity;
import com.TrainX.TrainX.level.LevelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final CaminoFitnessService caminoFitnessService;

    @Autowired
    private LevelService levelService;

    @Autowired
    public UserService(UserRepository userRepository, CaminoFitnessService caminoFitnessService) {
        this.userRepository = userRepository;
        this.caminoFitnessService = caminoFitnessService;
    }

    public List<UserEntity> listUsers() {
        return userRepository.findAll();
    }

    public UserEntity getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    public Optional<UserEntity> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("Usuario no encontrado");
        }
        userRepository.deleteById(id);
    }

    public List<UserEntity> searchUsersByName(String username) {
        return listUsers().stream()
                .filter(user -> user.getUsername().toLowerCase().contains(username.toLowerCase()))
                .collect(Collectors.toList());
    }

    public List<UserEntity> searchUsersBySurname(String surname) {
        return listUsers().stream()
                .filter(user -> user.getSurname().toLowerCase().contains(surname.toLowerCase()))
                .collect(Collectors.toList());
    }

    public UserEntity addCoins(Long id, Long amount) {
        UserEntity user = getUserById(id);
        Long currentCoins = user.getCoins() != null ? user.getCoins() : 0L;
        user.setCoins(currentCoins + amount);
        return userRepository.save(user);
    }

    public List<UserEntity> getUsersByFitnessXPGreaterThan(Long xpValue) {
        return listUsers().stream()
                .filter(user -> user.getXpFitness() != null && user.getXpFitness() > xpValue)
                .collect(Collectors.toList());
    }

    public Optional<UserEntity> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public UserEntity authenticateUser(String username, String password) {
        Optional<UserEntity> userOptional = userRepository.findByUsername(username);
        if (userOptional.isPresent()) {
            UserEntity user = userOptional.get();
            if (user.getPassword().equals(password)) { // In production, use proper password hashing
                return user;
            }
        }
        return null;
    }

    @Transactional
    public void assignCaminoFitness(Long userId, Long caminoFitnessId) {
        try {
            UserEntity user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            CaminoFitnessEntity camino = caminoFitnessService.getCaminoFitnessById(caminoFitnessId)
                    .orElseThrow(() -> new RuntimeException("Camino Fitness no encontrado"));

            user.setCaminoFitnessActual(camino);
            userRepository.save(user);
        } catch (Exception e) {

            e.printStackTrace();
            throw new RuntimeException("Error al asignar el Camino Fitness: " + e.getMessage());
        }
    }

    // Add/remove XP and update level
    public UserEntity updateUserXP(Long userId, Long xpChange) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Update XP (ensure it doesn't go below 0)
        Long newXP = Math.max(0, user.getXpFitness() + xpChange);
        user.setXpFitness(newXP);

        // Update level based on new XP
        LevelEntity newLevel = levelService.getLevelByXP(newXP);
        if (newLevel != null) {
            user.setLevel(newLevel);
        }

        return userRepository.save(user);
    }

    // Get user with level information
    public UserEntity getUserWithLevel(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public UserEntity addFitnessXP(Long id, Long points) {
        return updateUserXP(id, points);
    }

    // Add to UserService.java
    public UserEntity initializeUserLevel(UserEntity user) {
        if (user.getLevel() == null) {
            // Set initial level based on XP (which might be 0)
            LevelEntity initialLevel = levelService.getLevelByXP(user.getXpFitness());
            if (initialLevel != null) {
                user.setLevel(initialLevel);
                return userRepository.save(user);
            }
        }
        return user;
    }
}