package com.TrainX.TrainX.User;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Verificar si existe al menos un usuario con rol ADMIN
        boolean adminExists = userRepository.existsByRole(Role.ADMIN);
        if (!adminExists) {
            // Crear usuario admin con valores personalizados
            UserEntity admin = new UserEntity();
            admin.setUsername("TrainXAdmin");
            admin.setSurname("HQ");
            // Encriptar la contraseña antes de guardarla
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setEmail("admin@trinxhq.com");
            admin.setAge("35");
            admin.setPhoneNumber("1122334455");
            admin.setHeight(180L);
            admin.setWeight(80L);
            admin.setUserPhoto("admin_profile.png");
            admin.setAddress("TrinXHq");
            admin.setCoins(100L);
            admin.setXpFitness(500L);
            admin.setSex("M");
            admin.setIsPublic(true);
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
            System.out.println("Usuario admin creado con los atributos personalizados y contraseña encriptada");
        } else {
            System.out.println("El usuario admin ya existe");
        }
    }
}
