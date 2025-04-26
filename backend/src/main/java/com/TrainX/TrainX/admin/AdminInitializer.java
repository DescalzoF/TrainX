package com.TrainX.TrainX.admin;
import com.TrainX.TrainX.User.Role;
import com.TrainX.TrainX.User.UserEntity;
import com.TrainX.TrainX.User.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import com.TrainX.TrainX.xpFitness.XpFitnessEntity;
import com.TrainX.TrainX.xpFitness.XpFitnessRepository;

@Component
public class AdminInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private XpFitnessRepository xpFitnessRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Verificar si existe al menos un usuario con rol ADMIN
        boolean adminExists = userRepository.existsByRole(Role.ADMIN);
        if (!adminExists) {
            // Create XpFitness entity first
            XpFitnessEntity xpFitness = new XpFitnessEntity();
            xpFitness.setTotalXp(500L);

            // Create user with all required fields
            UserEntity admin = new UserEntity();
            admin.setUsername("TrainXAdmin");
            admin.setSurname("HQ");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setEmail("admin@trinxhq.com");
            admin.setAge("35");
            admin.setPhoneNumber("1122334455");
            admin.setHeight(180L);
            admin.setWeight(80L);
            admin.setUserPhoto("admin_profile.png");
            admin.setAddress("TrainXHQ Address");
            admin.setCoins(100L);
            admin.setSex("M");
            admin.setIsPublic(true);
            admin.setRole(Role.ADMIN);

            // Set XpFitness on the user before saving
            admin.setXpFitnessEntity(xpFitness);

            // Set user on XpFitness
            xpFitness.setUser(admin);

            // Save user with XpFitness already set
            userRepository.save(admin);

            System.out.println("Usuario admin creado con los atributos personalizados y contraseña encriptada");
        } else {
            System.out.println("El usuario admin ya existe");
        }
    }
}
