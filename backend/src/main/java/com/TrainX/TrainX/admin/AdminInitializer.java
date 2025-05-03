package com.TrainX.TrainX.admin;

import com.TrainX.TrainX.User.Role;
import com.TrainX.TrainX.User.UserEntity;
import com.TrainX.TrainX.User.UserRepository;
import com.TrainX.TrainX.caminoFitness.CaminoFitnessEntity;
import com.TrainX.TrainX.caminoFitness.CaminoFitnessRepository;
import com.TrainX.TrainX.level.LevelEntity;
import com.TrainX.TrainX.level.LevelRepository;
import com.TrainX.TrainX.xpFitness.XpFitnessEntity;
import com.TrainX.TrainX.xpFitness.XpFitnessRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CaminoFitnessRepository caminoFitnessRepository;

    @Autowired
    private LevelRepository levelRepository;

    @Autowired
    private XpFitnessRepository xpFitnessRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Verificar si existe al menos un usuario con rol ADMIN
        boolean adminExists = userRepository.existsByRole(Role.ADMIN);
        if (!adminExists) {
            // Crear entidad XpFitness con XP inicial
            XpFitnessEntity xpFitness = new XpFitnessEntity();
            long defaultXp = 500L; // Ajusta este valor según lo necesites
            xpFitness.setTotalXp(defaultXp);

            // Crear usuario con todos los campos requeridos
            UserEntity admin = new UserEntity();
            admin.setUsername("TrainXAdmin");
            admin.setName("TrainX");
            admin.setSurname("HQ");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setEmail("admin@trainxhq.com");
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

            // Asignar CaminoFitness y Level por defecto
            CaminoFitnessEntity defaultCamino = caminoFitnessRepository.findById(1L)
                    .orElseThrow(() -> new IllegalStateException("Default CaminoFitness no encontrado"));
            LevelEntity defaultLevel = levelRepository.findById(1L)
                    .orElseThrow(() -> new IllegalStateException("Default Level no encontrado"));
            admin.setCaminoFitnessActual(defaultCamino);
            admin.setLevel(defaultLevel);

            // Relacionar XpFitness con el usuario (establecer la relación bidireccional)
            admin.setXpFitnessEntity(xpFitness);
            xpFitness.setUser(admin);

            // Guardar usuario (se persiste XpFitness en cascada)
            userRepository.save(admin);

            System.out.println("Usuario admin creado con atributos, camino, nivel y XP inicial asignados");
        } else {
            System.out.println("El usuario admin ya existe");
        }
    }
}