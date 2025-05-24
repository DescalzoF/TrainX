package com.TrainX.TrainX.User;

import com.TrainX.TrainX.caminoFitness.CaminoFitnessEntity;
import com.TrainX.TrainX.caminoFitness.CaminoFitnessService;
import com.TrainX.TrainX.jwt.dtos.UserXpWithLevelDTO;
import com.TrainX.TrainX.level.LevelEntity;
import com.TrainX.TrainX.level.LevelService;
import com.TrainX.TrainX.xpFitness.XpFitnessEntity;
import com.TrainX.TrainX.xpFitness.XpFitnessService;
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
    private final XpFitnessService xpFitnessService;
    private final LevelService levelService;

    @Autowired
    public UserService(UserRepository userRepository, CaminoFitnessService caminoFitnessService, XpFitnessService xpFitnessService, LevelService levelService) {
        this.userRepository = userRepository;
        this.caminoFitnessService = caminoFitnessService;
        this.xpFitnessService = xpFitnessService;
        this.levelService = levelService;
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

    public Optional<UserEntity> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public UserEntity authenticateUser(String username, String password) {
        Optional<UserEntity> userOptional = userRepository.findByUsername(username);
        if (userOptional.isPresent()) {
            UserEntity user = userOptional.get();
            if (user.getPassword().equals(password)) {
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
            throw new RuntimeException("Error al asignar el Camino Fitness: " + e.getMessage());
        }
    }

    @Transactional
    public void assignLevel(Long userId, Long levelId) {
        try {
            UserEntity user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            LevelEntity level = levelService.getLevelById(levelId)
                    .orElseThrow(() -> new RuntimeException("Nivel no encontrado"));

            user.setLevel(level);
            userRepository.save(user);
        } catch (Exception e) {
            throw new RuntimeException("Error al asignar el Nivel: " + e.getMessage());
        }
    }

    @Transactional
    public UserEntity updateUserXP(Long userId, Long xpChange) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        XpFitnessEntity xpFitnessEntity = xpFitnessService.updateXpFitness(userId, xpChange);

        return userRepository.findById(userId).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    @Transactional(readOnly = true)
    public UserXpWithLevelDTO getUserXpWithLevel(Long userId) {
        return userRepository.getUserXpWithLevel(userId);
    }

    // New method for saving a user
    public UserEntity saveUser(UserEntity user) {
        return userRepository.save(user);
    }
}