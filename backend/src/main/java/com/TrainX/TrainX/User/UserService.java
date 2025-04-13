package com.TrainX.TrainX.User;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {
    private final UserRepository userRepository;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
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

    public UserEntity updateUser(Long id, UserEntity userDetails) {
        UserEntity existingUser = getUserById(id);
        existingUser.setUsername(userDetails.getUsername());
        existingUser.setSurname(userDetails.getSurname());
        existingUser.setPassword(userDetails.getPassword());
        existingUser.setEmail(userDetails.getEmail());
        existingUser.setAge(userDetails.getAge());
        existingUser.setPhoneNumber(userDetails.getPhoneNumber());
        existingUser.setHeight(userDetails.getHeight());
        existingUser.setWeight(userDetails.getWeight());
        existingUser.setUserPhoto(userDetails.getUserPhoto());
        existingUser.setAddress(userDetails.getAddress());
        existingUser.setSex(userDetails.getSex());
        existingUser.setIsPublic(userDetails.getIsPublic());
        existingUser.setRole(userDetails.getRole());
        existingUser.setCoins(userDetails.getCoins());
        existingUser.setXpFitness(userDetails.getXpFitness());
        return userRepository.save(existingUser);
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

    public UserEntity addFitnessXP(Long id, Long points) {
        UserEntity user = getUserById(id);
        Long currentXP = user.getXpFitness() != null ? user.getXpFitness() : 0L;
        user.setXpFitness(currentXP + points);
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

    // Note: This is no longer needed as we're using Spring Security's authentication
    // but we'll keep it for backward compatibility
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
}