package com.TrainX.TrainX.Profile;

import com.TrainX.TrainX.User.UserEntity;
import com.TrainX.TrainX.User.UserRepository;
import com.TrainX.TrainX.jwt.exceptions.UserNotFoundException;
import com.TrainX.TrainX.xpFitness.XpFitnessService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class ProfileService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final XpFitnessService xpFitnessService;

    public ProfileService(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          XpFitnessService xpFitnessService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.xpFitnessService = xpFitnessService;
    }

    public UserEntity getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
    }

    public Optional<UserEntity> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Transactional
    public UserEntity updateUser(Long id, UserEntity userDetails) {
        UserEntity existingUser = getUserById(id);

        // Actualización de campos básicos
        existingUser.setUsername(userDetails.getUsername());
        existingUser.setSurname(userDetails.getSurname());
        existingUser.setAge(userDetails.getAge());
        existingUser.setPhoneNumber(userDetails.getPhoneNumber());
        existingUser.setHeight(userDetails.getHeight());
        existingUser.setWeight(userDetails.getWeight());
        existingUser.setAddress(userDetails.getAddress());
        existingUser.setSex(userDetails.getSex());
        existingUser.setIsPublic(userDetails.getIsPublic());

        // Foto de perfil
        if (userDetails.getUserPhoto() != null) {
            existingUser.setUserPhoto(userDetails.getUserPhoto());
        }

        // Contraseña
        if (userDetails.getPassword() != null && !userDetails.getPassword().isBlank()) {
            existingUser.setPassword(passwordEncoder.encode(userDetails.getPassword()));
        }

        // Coins
        existingUser.setCoins(userDetails.getCoins());

        // Actualización de XP Fitness si viene en userDetails
        if (userDetails.getXpFitnessEntity() != null) {
            Long newXp = userDetails.getXpFitnessEntity().getTotalXp();
            xpFitnessService.updateXpFitness(id, newXp);
        }

        return userRepository.save(existingUser);

    }

    public void deleteUserAccount(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new UserNotFoundException(userId);
        }
        userRepository.deleteById(userId);
    }
}
