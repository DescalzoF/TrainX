package com.TrainX.TrainX.jwt.services;

import com.TrainX.TrainX.User.UserEntity;
import com.TrainX.TrainX.User.UserRepository;
import com.TrainX.TrainX.jwt.dtos.LoginRequest;
import com.TrainX.TrainX.jwt.dtos.RegisterUserDto;
import lombok.AllArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@AllArgsConstructor
@Service
public class AuthenticationService {
    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final AuthenticationManager authenticationManager;

    // This method is used to register a new user
    public UserEntity createUser(RegisterUserDto input) {
        UserEntity user = new UserEntity();
        user.setUsername(input.getUsername());
        user.setSurname(input.getSurname());
        user.setPassword(passwordEncoder.encode(input.getPassword())); // Encrypt the password
        user.setEmail(input.getEmail());
        user.setAge(input.getAge());
        user.setPhoneNumber(input.getPhoneNumber());
        user.setAddress(input.getAddress());
        user.setHeight(input.getHeight());
        user.setWeight(input.getWeight());
        user.setSex(input.getSex());
        user.setIsPublic(input.getIsPublic());

        // Initialize coins and xpFitness for new users if not set
        if (user.getCoins() == null) {
            user.setCoins(0L);
        }
        if (user.getXpFitness() == null) {
            user.setXpFitness(0L);
        }
        if(user.getUserPhoto() == null) {
            user.setUserPhoto("default.jpg");
        }
        UserEntity savedUser = userRepository.save(user);
        System.out.println("Usuario guardado: " + savedUser.getUsername());
        return savedUser;
    }
    public UserEntity login(LoginRequest input) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        input.getUsername(),
                        input.getPassword()
                )
        );

        return userRepository.findByUsername(input.getUsername())
                .orElseThrow( ()-> new RuntimeException("Usuario no encontrado"));
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
}
