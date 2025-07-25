package com.TrainX.TrainX.jwt.services;

import com.TrainX.TrainX.User.UserEntity;
import com.TrainX.TrainX.User.UserRepository;
import com.TrainX.TrainX.email.EmailService;
import com.TrainX.TrainX.jwt.dtos.LoginRequest;
import com.TrainX.TrainX.jwt.dtos.RegisterUserDto;
import com.TrainX.TrainX.jwt.exceptions.EmailAlreadyUsedException;
import com.TrainX.TrainX.jwt.exceptions.UsernameAlreadyExistsException;
import com.TrainX.TrainX.jwt.exceptions.UserNotFoundException;
import com.TrainX.TrainX.xpFitness.XpFitnessEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthenticationService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService; // ✅ AGREGAR esta línea
    // ✅ Agregar rate limiting maps
    private final Map<String, LocalDateTime> lastResetRequestByEmail = new ConcurrentHashMap<>();
    private final Map<String, LocalDateTime> lastResetRequestByIp = new ConcurrentHashMap<>();
    private static final int RESET_REQUEST_COOLDOWN_MINUTES = 5;

    public AuthenticationService(UserRepository userRepository,
                                 PasswordEncoder passwordEncoder,
                                 AuthenticationManager authenticationManager,
                                 EmailService emailService) { // ✅ AGREGAR parámetro
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.emailService = emailService; // ✅ AGREGAR esta línea
    }

    /**
     * Registra un nuevo usuario después de validar unicidad de username y email.
     */
    @Transactional
    public UserEntity createUser(RegisterUserDto input) {
        if (userRepository.existsByUsername(input.getUsername())) {
            throw new UsernameAlreadyExistsException(input.getUsername());
        }
        if (userRepository.existsByEmail(input.getEmail())) {
            throw new EmailAlreadyUsedException(input.getEmail());
        }

        UserEntity user = new UserEntity(
                input.getUsername(),
                input.getName(),
                input.getEmail(),
                input.getSurname(),
                passwordEncoder.encode(input.getPassword()),
                input.getDateOfBirth(),
                input.getPhoneNumber(),
                input.getHeight(),
                input.getWeight(),
                "default.jpg",
                input.getSex(),
                input.getAddress(),
                input.getIsPublic(),
                0L,
                null
        );
        user.setIsVerified(false);
        user.setVerificationToken(UUID.randomUUID().toString());
        user.setVerificationTokenExpires(LocalDateTime.now().plusHours(24));

        UserEntity savedUser = userRepository.save(user);

        // ✅ AGREGAR ENVÍO DE EMAIL:
        try {
            emailService.sendVerificationEmail(
                    savedUser.getEmail(),
                    savedUser.getUsername(),
                    savedUser.getVerificationToken()
            );
        } catch (Exception e) {
            System.err.println("Error sending verification email: " + e.getMessage());
        }

        return savedUser;
    }
    public boolean verifyEmail(String token) {
        Optional<UserEntity> userOpt = userRepository.findByVerificationToken(token);

        if (userOpt.isEmpty()) {
            return false;
        }

        UserEntity user = userOpt.get();

        if (user.getVerificationTokenExpires().isBefore(LocalDateTime.now())) {
            return false;
        }

        user.setIsVerified(true);
        user.setVerificationToken(null);
        user.setVerificationTokenExpires(null);

        // ✅ CREAR XpFitnessEntity SOLO después de verificar email
        if (user.getXpFitnessEntity() == null) {
            user.setXpFitnessEntity(new XpFitnessEntity(user));
        }

        userRepository.save(user);

        return true;
    }

    /**
     * Autentica las credenciales del usuario y lanza UserNotFoundException en caso de fallo.
     */
    public UserEntity login(LoginRequest input) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            input.getUsername(),
                            input.getPassword()
                    )
            );
        } catch (AuthenticationException ex) {
            throw new UserNotFoundException(input.getUsername());
        }

        UserEntity user = userRepository.findByUsername(input.getUsername())
                .orElseThrow(() -> new UserNotFoundException(input.getUsername()));

        // ✅ AGREGAR verificación de email
        if (!user.getIsVerified()) {
            throw new RuntimeException("Please verify your email before logging in");
        }

        return user;
    }

    /**
     * Recupera un usuario por su ID o lanza 404.
     */
    public UserEntity getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
    }

    /**
     * Verifica existencia de username.
     */
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    /**
     * Verifica existencia de email.
     */
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    /**
     * Actualiza la contraseña de un usuario existente.
     */
    @Transactional
    public UserEntity updateUserPassword(String username, String newPassword) {
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException(username));

        user.setPassword(passwordEncoder.encode(newPassword));
        return userRepository.save(user);
    }

    /**
     * Busca un usuario por username.
     */
    public Optional<UserEntity> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Transactional
    public boolean sendPasswordResetEmail(String email, String clientIp) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime cooldownTime = now.minusMinutes(RESET_REQUEST_COOLDOWN_MINUTES);

        // ✅ 1. Rate limiting por EMAIL
        LocalDateTime lastEmailRequest = lastResetRequestByEmail.get(email);
        if (lastEmailRequest != null && lastEmailRequest.isAfter(cooldownTime)) {
            return true; // Ya se envió a este email recientemente
        }

        // ✅ 2. Rate limiting por IP
        LocalDateTime lastIpRequest = lastResetRequestByIp.get(clientIp);
        if (lastIpRequest != null && lastIpRequest.isAfter(cooldownTime)) {
            return true; // Esta IP ya hizo un request recientemente
        }

        Optional<UserEntity> userOpt = userRepository.findByEmail(email);

        // ✅ 3. Guardar timestamps SIEMPRE
        lastResetRequestByEmail.put(email, now);
        lastResetRequestByIp.put(clientIp, now);

        if (userOpt.isEmpty()) {
            return true; // No revelar si email existe
        }

        UserEntity user = userOpt.get();
        user.setPasswordResetToken(UUID.randomUUID().toString());
        user.setPasswordResetTokenExpires(LocalDateTime.now().plusMinutes(10));

        userRepository.save(user);

        try {
            emailService.sendPasswordResetEmail(
                    user.getEmail(),
                    user.getUsername(),
                    user.getPasswordResetToken()
            );
            return true;
        } catch (Exception e) {
            System.err.println("Error sending password reset email: " + e.getMessage());
            return false;
        }
    }

    @Transactional
    public boolean resetPasswordWithToken(String token, String newPassword) {
        Optional<UserEntity> userOpt = userRepository.findByPasswordResetToken(token);

        if (userOpt.isEmpty()) {
            return false;
        }

        UserEntity user = userOpt.get();

        if (user.getPasswordResetTokenExpires().isBefore(LocalDateTime.now())) {
            return false;
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpires(null);

        userRepository.save(user);
        return true;
    }

    // En AuthenticationService.java, agregar este método:
    public boolean isPasswordResetTokenValid(String token) {
        Optional<UserEntity> userOpt = userRepository.findByPasswordResetToken(token);

        if (userOpt.isEmpty()) {
            return false;
        }

        UserEntity user = userOpt.get();
        return user.getPasswordResetTokenExpires().isAfter(LocalDateTime.now());
    }
}

