// ProfileService.java updates
package com.TrainX.TrainX.Profile;

import com.TrainX.TrainX.User.UserEntity;
import com.TrainX.TrainX.User.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ProfileService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public ProfileService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserEntity getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    public Optional<UserEntity> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public UserEntity updateUser(Long id, UserEntity userDetails) {
        UserEntity existingUser = getUserById(id);

        // Update basic information
        existingUser.setUsername(userDetails.getUsername());
        existingUser.setSurname(userDetails.getSurname());
        existingUser.setAge(userDetails.getAge());
        existingUser.setPhoneNumber(userDetails.getPhoneNumber());
        existingUser.setHeight(userDetails.getHeight());
        existingUser.setWeight(userDetails.getWeight());
        existingUser.setAddress(userDetails.getAddress());
        existingUser.setSex(userDetails.getSex());
        existingUser.setIsPublic(userDetails.getIsPublic());

        // Update photo if provided
        if (userDetails.getUserPhoto() != null) {
            existingUser.setUserPhoto(userDetails.getUserPhoto());
        }

        // Update password only if provided
        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(userDetails.getPassword()));
        }

        // Preserve sensitive fields
        existingUser.setRole(existingUser.getRole());
        existingUser.setEmail(existingUser.getEmail());
        existingUser.setCoins(userDetails.getCoins());
        existingUser.setXpFitness(userDetails.getXpFitness());

        return userRepository.save(existingUser);
    }

    public void deleteUserAccount(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("Usuario no encontrado");
        }
        userRepository.deleteById(userId);
    }
}