package com.TrainX.TrainX.jwt.config;

import com.TrainX.TrainX.caminoFitness.CaminoFitnessEntity;
import com.TrainX.TrainX.caminoFitness.CaminoFitnessRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner loadData(CaminoFitnessRepository caminoFitnessRepository) {
        return args -> {
            // Only add initial data if the repository is empty
            if (caminoFitnessRepository.count() == 0) {
                // Create Camino Fitness options with their descriptions
                CaminoFitnessEntity deportista = new CaminoFitnessEntity(
                        "Deportista",
                        "Optimiza tu rendimiento para competir. Elige entre rutinas genéricas o arma tu propia plantilla " +
                                "de entrenamiento enfocada en agilidad, resistencia y velocidad. Además, te damos una estimación " +
                                "calórica acorde a tu nivel de actividad y objetivos, y herramientas para buscar alimentos " +
                                "que se ajusten a tu dieta."
                );

                CaminoFitnessEntity fuerza = new CaminoFitnessEntity(
                        "Fuerza",
                        "Entrena para levantar más. Accede a programas estructurados o crea tu propia rutina " +
                                "basada en los grandes levantamientos. Calcula tus necesidades calóricas para ganar " +
                                "fuerza sin excedentes innecesarios y encuentra fácilmente el valor nutricional de lo que comés."
                );

                CaminoFitnessEntity hibrido = new CaminoFitnessEntity(
                        "Hibrido",
                        "Desarrollá fuerza y resistencia al mismo tiempo. Te damos rutinas balanceadas o " +
                                "plantillas editables para personalizar según tus objetivos. Incluye cálculo calórico " +
                                "adaptado a este enfoque versátil y acceso a una base de datos de alimentos."
                );

                CaminoFitnessEntity hipertrofia = new CaminoFitnessEntity(
                        "Hipertrofia",
                        "Buscás crecer. Te ofrecemos rutinas clásicas de volumen o plantillas personalizables " +
                                "para armar tu split ideal. Calculamos tus calorías de mantenimiento o superávit y " +
                                "podés consultar macros y calorías de tus comidas."
                );

                CaminoFitnessEntity otro = new CaminoFitnessEntity(
                        "Otro",
                        "¿Tenés un enfoque diferente? Sea salud general, estética, rehabilitación o simplemente " +
                                "moverte más, armá tu rutina ideal o usá nuestras sugerencias. Incluye cálculo calórico " +
                                "general y buscador de alimentos para mantenerte al día."
                );

                // Save to database
                caminoFitnessRepository.save(deportista);
                caminoFitnessRepository.save(fuerza);
                caminoFitnessRepository.save(hibrido);
                caminoFitnessRepository.save(hipertrofia);
                caminoFitnessRepository.save(otro);
            }
        };
    }
}