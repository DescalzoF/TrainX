package com.TrainX.TrainX.User;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

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

    public UserEntity createUser(UserEntity user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email ya existe");
        }
        return userRepository.save(user);
    }

    public UserEntity getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
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
        existingUser.setAddress(existingUser.getAddress());
        existingUser.setCoins(existingUser.getCoins());
        existingUser.setXpFitness(existingUser.getXpFitness());
        existingUser.setSex(existingUser.getSex());
        return userRepository.save(existingUser);
    }

    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("Usuario no encontrado");
        }
        userRepository.deleteById(id);
    }


    public List<UserEntity> searchUsersByName(String username) {

    }

    public List<UserEntity> searchUsersBySurname(String surname) {
    }

    public UserEntity addCoins(Long id, Long amount) {
    }

    public UserEntity addFitnessXP(Long id, Long points) {
    }

    public List<UserEntity> getUsersByFitnessXPGreaterThan(Long xpValue) {
    }

    public Optional<UserEntity> getUserByEmail(String email) {
    }
}
