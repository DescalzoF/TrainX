package com.TrainX.TrainX.jwt.config;

import com.TrainX.TrainX.caminoFitness.CaminoFitnessEntity;
import com.TrainX.TrainX.caminoFitness.CaminoFitnessRepository;
import com.TrainX.TrainX.exercise.ExerciseEntity;
import com.TrainX.TrainX.exercise.ExerciseRepository;
import com.TrainX.TrainX.level.LevelEntity;
import com.TrainX.TrainX.level.LevelRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

import java.util.ArrayList;
import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    @Order(1)
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
                        "Entrenamiento Hibrido",
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

    @Bean
    @Order(2)
    public CommandLineRunner loadLevelsAndExercises(
            CaminoFitnessRepository caminoFitnessRepository,
            LevelRepository levelRepository,
            ExerciseRepository exerciseRepository) {
        return args -> {
            // Solo agregar datos iniciales si el repositorio de ejercicios está vacío
            if (exerciseRepository.count() == 0) {
                // Crear ejercicios para cada camino y nivel
                initDeportistaExercises(caminoFitnessRepository, levelRepository, exerciseRepository);
                initFuerzaExercises(caminoFitnessRepository, levelRepository, exerciseRepository);
                initEntrenamientoHibridoExercises(caminoFitnessRepository, levelRepository, exerciseRepository);
                initHipertrofiaExercises(caminoFitnessRepository, levelRepository, exerciseRepository);
                

                System.out.println("Inicialización de niveles y ejercicios completada con éxito.");
            }
        };
    }


    private void initDeportistaExercises(
            CaminoFitnessRepository caminoFitnessRepository,
            LevelRepository levelRepository,
            ExerciseRepository exerciseRepository) {

        CaminoFitnessEntity camino = caminoFitnessRepository.findByNameCFIgnoreCase("Deportista")
                .orElseThrow(() -> new RuntimeException("No se encontró el camino Deportista"));

        // Crear los 4 niveles
        LevelEntity principiante = createLevel(levelRepository, "Principiante", 1, camino);
        LevelEntity intermedio = createLevel(levelRepository, "Intermedio", 2, camino);
        LevelEntity avanzado = createLevel(levelRepository, "Avanzado", 3, camino);
        LevelEntity pro = createLevel(levelRepository, "Pro", 4, camino);

        // NIVEL PRINCIPIANTE
        List<ExerciseEntity> ejerciciosPrincipiante = new ArrayList<>();

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Saltos en el lugar",
                "Salta en el lugar con ambas piernas juntas, impulsándote con los brazos para mayor altura.",
                "Piernas, Core",
                3,
                15,
                camino,
                principiante,
                "https://youtu.be/saltos-lugar",
                50
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Burpees modificados",
                "Comienza de pie, baja a posición de cuclillas, coloca las manos en el suelo, extiende las piernas hacia atrás y regresa a la posición inicial.",
                "Full body",
                3,
                8,
                camino,
                principiante,
                "https://youtu.be/burpees-modificados",
                60
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Sprints de 10 metros",
                "Corre a máxima velocidad una distancia de 10 metros, descansa y repite.",
                "Piernas, Sistema cardiovascular",
                4,
                2,
                camino,
                principiante,
                "https://youtu.be/sprints-10m",
                55
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Planchas con toques de hombro",
                "En posición de plancha alta, toca tu hombro izquierdo con la mano derecha y viceversa, alternando manos.",
                "Core, Hombros, Estabilidad",
                3,
                10,
                camino,
                principiante,
                "https://youtu.be/plancha-toques",
                50
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Escaladores",
                "En posición de plancha alta, lleva alternadamente las rodillas hacia el pecho en un movimiento rápido y controlado.",
                "Core, Piernas, Cardiovascular",
                3,
                20,
                camino,
                principiante,
                "https://youtu.be/escaladores",
                55
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Saltos laterales",
                "Salta de lado a lado sobre una línea imaginaria, manteniendo los pies juntos y aterrizando suavemente.",
                "Piernas, Coordinación",
                3,
                15,
                camino,
                principiante,
                "https://youtu.be/saltos-laterales",
                50
        ));

        exerciseRepository.saveAll(ejerciciosPrincipiante);

        // NIVEL INTERMEDIO
        List<ExerciseEntity> ejerciciosIntermedio = new ArrayList<>();

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Burpees completos",
                "Comienza de pie, baja a posición de flexión, haz una flexión, salta de vuelta a posición de cuclillas y salta hacia arriba con las manos extendidas.",
                "Full body",
                3,
                12,
                camino,
                intermedio,
                "https://youtu.be/burpees-completos",
                75
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Sprints de 20 metros",
                "Corre a máxima velocidad una distancia de 20 metros, descansa 30 segundos y repite.",
                "Piernas, Sistema cardiovascular",
                5,
                3,
                camino,
                intermedio,
                "https://youtu.be/sprints-20m",
                70
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Saltos en cajón",
                "Salta sobre un cajón o plataforma elevada con ambos pies, baja controladamente y repite.",
                "Piernas, Potencia",
                3,
                10,
                camino,
                intermedio,
                "https://youtu.be/saltos-cajon",
                80
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Flexiones explosivas",
                "Realiza una flexión normal pero con suficiente impulso para despegar las manos del suelo momentáneamente.",
                "Pecho, Tríceps, Potencia",
                3,
                8,
                camino,
                intermedio,
                "https://youtu.be/flexiones-explosivas",
                75
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Sentadillas con salto",
                "Realiza una sentadilla completa y al subir, salta explosivamente. Aterriza suavemente y repite.",
                "Piernas, Potencia",
                3,
                12,
                camino,
                intermedio,
                "https://youtu.be/sentadillas-salto",
                75
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Mountain climbers rápidos",
                "En posición de plancha alta, alterna las rodillas hacia el pecho lo más rápido posible manteniendo la estabilidad.",
                "Core, Piernas, Cardiovascular",
                3,
                30,
                camino,
                intermedio,
                "https://youtu.be/mountain-climbers",
                65
        ));

        exerciseRepository.saveAll(ejerciciosIntermedio);

        // NIVEL AVANZADO
        List<ExerciseEntity> ejerciciosAvanzado = new ArrayList<>();

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Burpees con dominadas",
                "Realiza un burpee completo y al ponerte de pie, salta para agarrar una barra y hacer una dominada.",
                "Full body",
                3,
                8,
                camino,
                avanzado,
                "https://youtu.be/burpees-dominadas",
                100
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Sprints con cambio de dirección",
                "Corre a máxima velocidad 10 metros, toca el suelo, cambia de dirección y regresa a máxima velocidad.",
                "Piernas, Agilidad, Cardiovascular",
                5,
                4,
                camino,
                avanzado,
                "https://youtu.be/sprints-cambio",
                90
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Box jumps con una pierna",
                "Salta sobre un cajón o plataforma elevada con una sola pierna, alterna piernas en cada repetición.",
                "Piernas, Potencia, Equilibrio",
                3,
                6,
                camino,
                avanzado,
                "https://youtu.be/box-jumps-unilateral",
                95
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Muscle ups",
                "Partiendo de una posición colgada, realiza una dominada explosiva que te permita elevar el cuerpo por encima de la barra.",
                "Espalda, Pecho, Tríceps, Potencia",
                3,
                5,
                camino,
                avanzado,
                "https://youtu.be/muscle-ups",
                100
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Pistol squats",
                "Sentadilla a una pierna donde la otra se extiende completamente al frente mientras bajas.",
                "Piernas, Equilibrio, Fuerza",
                3,
                8,
                camino,
                avanzado,
                "https://youtu.be/pistol-squats",
                90
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Saltos en cuerda doble",
                "Realiza saltos con cuerda donde esta pasa dos veces bajo tus pies en cada salto.",
                "Piernas, Coordinación, Cardiovascular",
                4,
                20,
                camino,
                avanzado,
                "https://youtu.be/doble-salto-cuerda",
                85
        ));

        exerciseRepository.saveAll(ejerciciosAvanzado);

        // NIVEL PRO
        List<ExerciseEntity> ejerciciosPro = new ArrayList<>();

        ejerciciosPro.add(new ExerciseEntity(
                "Devil press",
                "Con mancuernas en el suelo, realiza un burpee y al levantarte eleva las mancuernas sobre la cabeza en un solo movimiento.",
                "Full body",
                4,
                10,
                camino,
                pro,
                "https://youtu.be/devil-press",
                120
        ));

        ejerciciosPro.add(new ExerciseEntity(
                "Intervalos de velocidad 400m",
                "Corre 400 metros a máxima velocidad, descansa 60 segundos y repite.",
                "Resistencia, Velocidad",
                4,
                1,
                camino,
                pro,
                "https://youtu.be/sprints-400m",
                130
        ));

        ejerciciosPro.add(new ExerciseEntity(
                "Handstand push-ups",
                "En posición invertida contra una pared, flexiona y extiende los brazos realizando flexiones.",
                "Hombros, Tríceps, Core",
                3,
                8,
                camino,
                pro,
                "https://youtu.be/handstand-pushups",
                120
        ));

        ejerciciosPro.add(new ExerciseEntity(
                "Plyo ring dips",
                "Realiza fondos en anillas con un impulso explosivo para despegar las manos momentáneamente.",
                "Pecho, Tríceps, Potencia",
                3,
                8,
                camino,
                pro,
                "https://youtu.be/plyo-dips",
                110
        ));

        ejerciciosPro.add(new ExerciseEntity(
                "Shuttle runs con pesos",
                "Coloca 5 marcadores separados por 5 metros. Corre hasta cada uno en orden con pesos en las manos, toca el suelo y regresa al inicio.",
                "Agilidad, Resistencia, Fuerza",
                3,
                1,
                camino,
                pro,
                "https://youtu.be/shuttle-runs",
                120
        ));

        ejerciciosPro.add(new ExerciseEntity(
                "Clean and jerk",
                "Levanta una barra desde el suelo hasta los hombros (clean) y luego sobre la cabeza con brazos extendidos (jerk).",
                "Full body, Potencia",
                4,
                5,
                camino,
                pro,
                "https://youtu.be/clean-jerk",
                130
        ));

        exerciseRepository.saveAll(ejerciciosPro);
    }

    private LevelEntity createLevel(LevelRepository levelRepository, String levelName, int levelNumber, CaminoFitnessEntity camino) {
        // Create a list with the provided camino
        List<CaminoFitnessEntity> caminos = new ArrayList<>();
        caminos.add(camino);

        // Define XP ranges based on level number
        long xpMin, xpMax;
        switch (levelNumber) {
            case 1: // Principiante
                xpMin = 0L;
                xpMax = 1000L;
                break;
            case 2: // Intermedio
                xpMin = 1001L;
                xpMax = 3000L;
                break;
            case 3: // Avanzado
                xpMin = 3001L;
                xpMax = 6000L;
                break;
            case 4: // Pro
                xpMin = 6001L;
                xpMax = 10000L;
                break;
            default:
                xpMin = 0L;
                xpMax = 1000L;
        }

        // Create the level entity
        LevelEntity level = new LevelEntity(levelName, caminos, xpMin, xpMax);

        // Save and return the level
        return levelRepository.save(level);
    }
    private void initFuerzaExercises(
            CaminoFitnessRepository caminoFitnessRepository,
            LevelRepository levelRepository,
            ExerciseRepository exerciseRepository) {

        CaminoFitnessEntity camino = caminoFitnessRepository.findByNameCFIgnoreCase("Fuerza")
                .orElseThrow(() -> new RuntimeException("No se encontró el camino Fuerza"));

        // Crear los 4 niveles
        LevelEntity principiante = createLevel(levelRepository, "Principiante", 1, camino);
        LevelEntity intermedio = createLevel(levelRepository, "Intermedio", 2, camino);
        LevelEntity avanzado = createLevel(levelRepository, "Avanzado", 3, camino);
        LevelEntity pro = createLevel(levelRepository, "Pro", 4, camino);

        // NIVEL PRINCIPIANTE
        List<ExerciseEntity> ejerciciosPrincipiante = new ArrayList<>();

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Press de banca con barra vacía",
                "Acuéstate en un banco plano, sujeta la barra con un agarre ligeramente más ancho que los hombros y baja hasta el pecho antes de empujar hacia arriba.",
                "Pecho, Tríceps, Hombros",
                3,
                10,
                camino,
                principiante,
                "https://youtu.be/bench-press-empty",
                50
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Sentadillas con peso corporal",
                "De pie con los pies a la anchura de los hombros, flexiona las rodillas bajando las caderas como si fueras a sentarte, manteniendo el pecho erguido.",
                "Cuádriceps, Glúteos",
                3,
                12,
                camino,
                principiante,
                "https://youtu.be/bodyweight-squat",
                45
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Peso muerto rumano con mancuernas",
                "De pie con mancuernas frente a los muslos, flexiona las caderas hacia atrás manteniendo la espalda recta y baja las pesas.",
                "Isquiotibiales, Glúteos, Espalda baja",
                3,
                10,
                camino,
                principiante,
                "https://youtu.be/rdl-dumbbells",
                50
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Press militar con mancuernas",
                "Sentado o de pie, sostén mancuernas a la altura de los hombros y empújalas hacia arriba hasta extender los brazos.",
                "Hombros, Tríceps",
                3,
                10,
                camino,
                principiante,
                "https://youtu.be/shoulder-press-db",
                45
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Remo con mancuerna",
                "Con una rodilla y mano apoyadas en un banco, mantén la espalda paralela al suelo y jala la mancuerna hacia la cadera.",
                "Espalda, Bíceps",
                3,
                10,
                camino,
                principiante,
                "https://youtu.be/db-row",
                45
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Elevaciones de pantorrilla",
                "De pie, elévate sobre las puntas de los pies y baja lentamente, puedes usar apoyo para equilibrio.",
                "Pantorrillas",
                3,
                15,
                camino,
                principiante,
                "https://youtu.be/calf-raises",
                40
        ));

        exerciseRepository.saveAll(ejerciciosPrincipiante);

        // NIVEL INTERMEDIO
        List<ExerciseEntity> ejerciciosIntermedio = new ArrayList<>();

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Press de banca con pesas",
                "Acuéstate en un banco plano, sujeta la barra con un agarre ligeramente más ancho que los hombros y baja hasta el pecho antes de empujar hacia arriba.",
                "Pecho, Tríceps, Hombros",
                4,
                8,
                camino,
                intermedio,
                "https://youtu.be/bench-press",
                75
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Sentadillas con barra",
                "Coloca una barra sobre los trapecios, mantén el pecho erguido y baja flexionando las rodillas hasta que los muslos estén paralelos al suelo.",
                "Cuádriceps, Glúteos, Core",
                4,
                8,
                camino,
                intermedio,
                "https://youtu.be/back-squat",
                80
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Peso muerto convencional",
                "Con una barra en el suelo, flexiona las caderas y rodillas, agarra la barra y levántala manteniendo la espalda recta hasta estar de pie.",
                "Espalda baja, Isquiotibiales, Glúteos",
                4,
                6,
                camino,
                intermedio,
                "https://youtu.be/deadlift",
                85
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Press militar con barra",
                "De pie, con una barra en la parte frontal de los hombros, empuja hacia arriba hasta extender completamente los brazos.",
                "Hombros, Tríceps, Core",
                4,
                8,
                camino,
                intermedio,
                "https://youtu.be/ohp-press",
                75
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Dominadas",
                "Colgando de una barra con agarre prono, jala tu cuerpo hacia arriba hasta que tu barbilla supere la barra.",
                "Espalda, Bíceps",
                3,
                8,
                camino,
                intermedio,
                "https://youtu.be/pull-ups",
                80
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Fondos en paralelas",
                "Sostenido en barras paralelas, baja el cuerpo flexionando los codos y empuja hacia arriba hasta extender los brazos.",
                "Pecho, Tríceps, Hombros",
                3,
                10,
                camino,
                intermedio,
                "https://youtu.be/dips",
                75
        ));

        exerciseRepository.saveAll(ejerciciosIntermedio);

        // NIVEL AVANZADO
        List<ExerciseEntity> ejerciciosAvanzado = new ArrayList<>();

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Press de banca inclinado",
                "Similar al press de banca pero en un banco inclinado para enfatizar la parte superior del pecho.",
                "Pecho superior, Tríceps, Hombros",
                4,
                6,
                camino,
                avanzado,
                "https://youtu.be/incline-bench",
                90
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Sentadillas frontales",
                "Con la barra descansando en la parte frontal de los hombros, baja a la posición de sentadilla manteniendo el torso más vertical.",
                "Cuádriceps, Core, Espalda",
                4,
                6,
                camino,
                avanzado,
                "https://youtu.be/front-squat",
                95
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Peso muerto sumo",
                "Posición de pies más ancha que el peso muerto convencional, con agarre interior a las piernas.",
                "Cuádriceps, Glúteos, Aductores",
                4,
                5,
                camino,
                avanzado,
                "https://youtu.be/sumo-deadlift",
                100
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Press de banca cerrado",
                "Variante del press de banca con agarre más estrecho para enfatizar los tríceps.",
                "Tríceps, Pecho interno",
                4,
                8,
                camino,
                avanzado,
                "https://youtu.be/close-grip-bench",
                85
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Remo Pendlay",
                "Con la espalda paralela al suelo, levanta explosivamente la barra hacia el abdomen y bájala controladamente.",
                "Espalda, Trapecios, Bíceps",
                4,
                6,
                camino,
                avanzado,
                "https://youtu.be/pendlay-row",
                90
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Zancadas con barra",
                "Con una barra en la espalda, da un paso adelante y flexiona ambas rodillas, luego regresa y alterna piernas.",
                "Cuádriceps, Glúteos, Equilibrio",
                3,
                8,
                camino,
                avanzado,
                "https://youtu.be/barbell-lunge",
                90
        ));

        exerciseRepository.saveAll(ejerciciosAvanzado);

        // NIVEL PRO
        List<ExerciseEntity> ejerciciosPro = new ArrayList<>();

        ejerciciosPro.add(new ExerciseEntity(
                "Press de banca con pausa",
                "Press de banca estándar pero manteniendo la barra en el pecho por 2-3 segundos antes de empujar.",
                "Pecho, Tríceps, Control",
                5,
                5,
                camino,
                pro,
                "https://youtu.be/pause-bench",
                110
        ));

        ejerciciosPro.add(new ExerciseEntity(
                "Sentadillas olímpicas",
                "Sentadilla profunda con la espalda muy vertical, típicamente usada por levantadores olímpicos.",
                "Cuádriceps, Glúteos, Movilidad",
                5,
                4,
                camino,
                pro,
                "https://youtu.be/olympic-squat",
                120
        ));

        ejerciciosPro.add(new ExerciseEntity(
                "Rack pulls",
                "Variante del peso muerto iniciando con la barra en soportes a la altura de las rodillas para enfatizar la parte superior del movimiento.",
                "Espalda, Trapecios, Agarre",
                5,
                4,
                camino,
                pro,
                "https://youtu.be/rack-pulls",
                115
        ));

        ejerciciosPro.add(new ExerciseEntity(
                "Push press",
                "Press militar con un impulso inicial de piernas para mover más peso.",
                "Hombros, Piernas, Coordinación",
                4,
                5,
                camino,
                pro,
                "https://youtu.be/push-press",
                120
        ));

        ejerciciosPro.add(new ExerciseEntity(
                "Arrancada de potencia",
                "Levantar la barra desde el suelo hasta sobre la cabeza en un solo movimiento explosivo, sin sentadilla completa.",
                "Full body, Potencia, Técnica",
                4,
                3,
                camino,
                pro,
                "https://youtu.be/power-snatch",
                130
        ));

        ejerciciosPro.add(new ExerciseEntity(
                "Good morning con barra",
                "Con barra en la espalda, flexiona las caderas manteniendo las piernas casi rectas y la espalda plana.",
                "Isquiotibiales, Glúteos, Espalda baja",
                4,
                6,
                camino,
                pro,
                "https://youtu.be/good-morning",
                110
        ));

        exerciseRepository.saveAll(ejerciciosPro);
    }

    private void initHipertrofiaExercises(
            CaminoFitnessRepository caminoFitnessRepository,
            LevelRepository levelRepository,
            ExerciseRepository exerciseRepository) {

        CaminoFitnessEntity camino = caminoFitnessRepository.findByNameCFIgnoreCase("Hipertrofia")
                .orElseThrow(() -> new RuntimeException("No se encontró el camino Hipertrofia"));

        // Crear los 4 niveles
        LevelEntity principiante = createLevel(levelRepository, "Principiante", 1, camino);
        LevelEntity intermedio = createLevel(levelRepository, "Intermedio", 2, camino);
        LevelEntity avanzado = createLevel(levelRepository, "Avanzado", 3, camino);
        LevelEntity pro = createLevel(levelRepository, "Pro", 4, camino);

        // NIVEL PRINCIPIANTE
        List<ExerciseEntity> ejerciciosPrincipiante = new ArrayList<>();

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Curl de bíceps con mancuernas",
                "De pie con mancuernas a los lados, flexiona los codos para levantar las pesas hacia los hombros sin mover la parte superior del brazo.",
                "Bíceps",
                3,
                12,
                camino,
                principiante,
                "https://youtu.be/bicep-curl",
                45
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Press de hombros con mancuernas",
                "Sentado con mancuernas a nivel de los hombros, empújalas hacia arriba hasta extender los brazos completamente.",
                "Deltoides, Tríceps",
                3,
                12,
                camino,
                principiante,
                "https://youtu.be/shoulder-press",
                50
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Press de banca con mancuernas",
                "Acostado en un banco plano con mancuernas a nivel del pecho, empújalas hacia arriba hasta extender los brazos.",
                "Pecho, Tríceps",
                3,
                10,
                camino,
                principiante,
                "https://youtu.be/db-bench-press",
                55
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Extensiones de tríceps con mancuerna",
                "De pie o sentado, sostén una mancuerna con ambas manos sobre la cabeza y baja doblando los codos.",
                "Tríceps",
                3,
                12,
                camino,
                principiante,
                "https://youtu.be/tricep-extension",
                45
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Peso muerto con mancuernas",
                "De pie con mancuernas frente a los muslos, flexiona las caderas manteniendo la espalda recta y baja las pesas.",
                "Isquiotibiales, Espalda baja, Glúteos",
                3,
                12,
                camino,
                principiante,
                "https://youtu.be/db-deadlift",
                50
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Elevaciones laterales",
                "De pie con mancuernas a los costados, eleva las pesas lateralmente hasta que los brazos estén paralelos al suelo.",
                "Deltoides laterales",
                3,
                15,
                camino,
                principiante,
                "https://youtu.be/lateral-raise",
                40
        ));

        exerciseRepository.saveAll(ejerciciosPrincipiante);

        // NIVEL INTERMEDIO
        List<ExerciseEntity> ejerciciosIntermedio = new ArrayList<>();

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Press de banca inclinado",
                "Similar al press de banca pero en un banco inclinado para enfatizar la parte superior del pecho.",
                "Pecho superior, Deltoides anteriores",
                4,
                10,
                camino,
                intermedio,
                "https://youtu.be/incline-bench",
                70
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Curl de bíceps con barra",
                "De pie con una barra en agarre supino, flexiona los codos para levantar la barra hacia los hombros.",
                "Bíceps",
                4,
                10,
                camino,
                intermedio,
                "https://youtu.be/barbell-curl",
                65
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Extensiones de tríceps en polea",
                "De espaldas a la polea alta, agarra la cuerda y extiende los brazos hacia abajo.",
                "Tríceps",
                4,
                12,
                camino,
                intermedio,
                "https://youtu.be/tricep-pushdown",
                60
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Remo en máquina",
                "Sentado frente a la máquina, jala la barra hacia tu abdomen manteniendo la espalda recta.",
                "Espalda, Bíceps",
                4,
                10,
                camino,
                intermedio,
                "https://youtu.be/seated-row",
                75
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Sentadillas Búlgaras",
                "Con un pie elevado en un banco detrás de ti, flexiona la rodilla del pie de apoyo hasta descender en posición de zancada.",
                "Cuádriceps, Glúteos",
                3,
                10,
                camino,
                intermedio,
                "https://youtu.be/bulgarian-squat",
                70
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Face pulls",
                "Frente a la polea alta, jala la cuerda hacia tu rostro abriendo los codos lateralmente.",
                "Deltoides posteriores, Manguito rotador",
                3,
                15,
                camino,
                intermedio,
                "https://youtu.be/face-pull",
                65
        ));

        exerciseRepository.saveAll(ejerciciosIntermedio);

        // NIVEL AVANZADO
        List<ExerciseEntity> ejerciciosAvanzado = new ArrayList<>();

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Press de banca declinado",
                "Press de banca realizado en banco declinado para enfatizar la parte inferior del pecho.",
                "Pecho inferior, Tríceps",
                4,
                8,
                camino,
                avanzado,
                "https://youtu.be/decline-bench",
                85
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Curl predicador",
                "Curl de bíceps con los brazos apoyados en un banco predicador para aislar el movimiento.",
                "Bíceps",
                4,
                10,
                camino,
                avanzado,
                "https://youtu.be/preacher-curl",
                80
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Press francés con barra EZ",
                "Acostado, sostén una barra sobre tu frente con los codos flexionados y extiende los brazos.",
                "Tríceps",
                4,
                10,
                camino,
                avanzado,
                "https://youtu.be/skull-crusher",
                80
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Jalones al pecho",
                "Sentado frente a la polea alta, jala la barra hacia el pecho manteniendo la espalda recta.",
                "Dorsales, Romboides",
                4,
                8,
                camino,
                avanzado,
                "https://youtu.be/lat-pulldown",
                90
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Sentadilla Hack",
                "Sentadilla realizada en la máquina Hack con el peso distribuido principalmente en los cuádriceps.",
                "Cuádriceps, Glúteos",
                4,
                8,
                camino,
                avanzado,
                "https://youtu.be/hack-squat",
                90
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Vuelos con cables cruzados",
                "De pie entre dos poleas ajustadas a la altura del pecho, jala los cables frente a ti en un movimiento de abrazo.",
                "Pecho, Pectorales internos",
                3,
                12,
                camino,
                avanzado,
                "https://youtu.be/cable-fly",
                85
        ));

        exerciseRepository.saveAll(ejerciciosAvanzado);

        // NIVEL PRO
        List<ExerciseEntity> ejerciciosPro = new ArrayList<>();

        ejerciciosPro.add(new ExerciseEntity(
                "Curl de concentración",
                "Sentado con el codo apoyado en el interior del muslo, realiza el curl con total concentración en el músculo.",
                "Bíceps",
                4,
                8,
                camino,
                pro,
                "https://youtu.be/concentration-curl",
                100
        ));

        ejerciciosPro.add(new ExerciseEntity(
                "Press de banca con bandas",
                "Press de banca con bandas de resistencia agregadas para incrementar la tensión al final del movimiento.",
                "Pecho, Tríceps, Explosividad",
                4,
                6,
                camino,
                pro,
                "https://youtu.be/band-bench",
                110
        ));

        ejerciciosPro.add(new ExerciseEntity(
                "Extensión de tríceps overhead con cable",
                "De espaldas a la polea baja, flexiona el torso y extiende los brazos por encima de la cabeza.",
                "Tríceps largo",
                4,
                10,
                camino,
                pro,
                "https://youtu.be/overhead-extension",
                100
        ));

        ejerciciosPro.add(new ExerciseEntity(
                "Pull-overs con mancuerna",
                "Acostado en un banco con una mancuerna sostenida sobre el pecho, baja la pesa detrás de la cabeza en arco.",
                "Dorsales, Pectorales, Serratos",
                4,
                8,
                camino,
                pro,
                "https://youtu.be/dumbbell-pullover",
                105
        ));

        ejerciciosPro.add(new ExerciseEntity(
                "Prensa de piernas con pies altos",
                "En la máquina de prensa, coloca los pies en la parte alta de la plataforma para enfatizar glúteos e isquiotibiales.",
                "Glúteos, Isquiotibiales",
                4,
                12,
                camino,
                pro,
                "https://youtu.be/high-leg-press",
                110
        ));

        ejerciciosPro.add(new ExerciseEntity(
                "Dominadas con peso adicional",
                "Dominadas tradicionales con peso adicional sujeto al cuerpo para mayor resistencia.",
                "Dorsales, Bíceps, Fuerza",
                4,
                6,
                camino,
                pro,
                "https://youtu.be/weighted-pullup",
                120
        ));

        exerciseRepository.saveAll(ejerciciosPro);
    }

    private void initEntrenamientoHibridoExercises(
            CaminoFitnessRepository caminoFitnessRepository,
            LevelRepository levelRepository,
            ExerciseRepository exerciseRepository) {

        CaminoFitnessEntity camino = caminoFitnessRepository.findByNameCFIgnoreCase("Entrenamiento Hibrido")
                .orElseThrow(() -> new RuntimeException("No se encontró el camino EntrenamientoHibrido"));

        // Crear los 4 niveles
        LevelEntity principiante = createLevel(levelRepository, "Principiante", 1, camino);
        LevelEntity intermedio = createLevel(levelRepository, "Intermedio", 2, camino);
        LevelEntity avanzado = createLevel(levelRepository, "Avanzado", 3, camino);
        LevelEntity pro = createLevel(levelRepository, "Pro", 4, camino);

        // NIVEL PRINCIPIANTE
        List<ExerciseEntity> ejerciciosPrincipiante = new ArrayList<>();

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Burpees modificados",
                "Desde posición de pie, agáchate, apoya las manos, extiende las piernas sin salto y regresa a la posición inicial.",
                "Full body, Cardiovascular",
                3,
                10,
                camino,
                principiante,
                "https://youtu.be/modified-burpee",
                50
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Mountain climbers",
                "En posición de plancha, alterna llevando las rodillas hacia el pecho rápidamente.",
                "Core, Cardiovascular",
                3,
                30,
                camino,
                principiante,
                "https://youtu.be/mountain-climber",
                45
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Swing con kettlebell",
                "Con una kettlebell entre las piernas, impulsa la pesa hacia adelante y arriba usando la fuerza de las caderas.",
                "Glúteos, Isquiotibiales, Cardiovascular",
                3,
                15,
                camino,
                principiante,
                "https://youtu.be/kb-swing",
                55
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Remo con mancuerna y zancada",
                "Realiza una zancada y al estar abajo ejecuta un remo con la mancuerna del lado contrario a la pierna adelantada.",
                "Piernas, Espalda, Coordinación",
                3,
                10,
                camino,
                principiante,
                "https://youtu.be/lunge-row",
                50
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Plancha con toque de hombro",
                "En posición de plancha, alterna tocando tu hombro contrario con la mano mientras mantienes la estabilidad.",
                "Core, Estabilidad",
                3,
                20,
                camino,
                principiante,
                "https://youtu.be/shoulder-tap",
                45
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Saltos al cajón",
                "Frente a un cajón o plataforma estable, salta para subir y baja controladamente.",
                "Piernas, Potencia, Cardiovascular",
                3,
                12,
                camino,
                principiante,
                "https://youtu.be/box-jump",
                55
        ));

        exerciseRepository.saveAll(ejerciciosPrincipiante);

        // NIVEL INTERMEDIO
        List<ExerciseEntity> ejerciciosIntermedio = new ArrayList<>();

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Thrusters",
                "Combinación de sentadilla frontal y press de hombros en un solo movimiento fluido.",
                "Piernas, Hombros, Cardiovascular",
                4,
                12,
                camino,
                intermedio,
                "https://youtu.be/thruster",
                75
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Clean and Press",
                "Levanta una kettlebell o mancuerna desde el suelo hasta el hombro y luego sobre la cabeza en un movimiento.",
                "Full body, Potencia",
                4,
                8,
                camino,
                intermedio,
                "https://youtu.be/clean-press",
                80
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Burpees con salto",
                "Burpee completo añadiendo un salto explosivo al final del movimiento.",
                "Full body, Explosividad, Resistencia",
                3,
                15,
                camino,
                intermedio,
                "https://youtu.be/jump-burpee",
                75
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Wall ball",
                "Combinación de sentadilla y lanzamiento de balón medicinal contra una pared.",
                "Piernas, Hombros, Coordinación",
                4,
                15,
                camino,
                intermedio,
                "https://youtu.be/wall-ball",
                70
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Remo con kettlebell y rotación",
                "Realiza un remo con kettlebell y añade una rotación del torso al completar el movimiento.",
                "Espalda, Core, Rotación",
                3,
                10,
                camino,
                intermedio,
                "https://youtu.be/kb-row-twist",
                75
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Battle ropes",
                "Con una cuerda pesada en cada mano, genera ondas potentes alternando los brazos.",
                "Brazos, Hombros, Cardiovascular",
                4,
                30,
                camino,
                intermedio,
                "https://youtu.be/battle-ropes",
                80
        ));

        exerciseRepository.saveAll(ejerciciosIntermedio);

        // NIVEL AVANZADO
        List<ExerciseEntity> ejerciciosAvanzado = new ArrayList<>();

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Devil press",
                "Combinación de burpee y snatch con mancuernas, levantando ambas mancuernas desde el suelo hasta arriba de la cabeza.",
                "Full body, Potencia, Resistencia",
                4,
                10,
                camino,
                avanzado,
                "https://youtu.be/devil-press",
                95
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Double kettlebell complex",
                "Serie de movimientos encadenados con dos kettlebells: clean, squat, press, sin descanso entre ellos.",
                "Full body, Resistencia, Fuerza",
                3,
                5,
                camino,
                avanzado,
                "https://youtu.be/kb-complex",
                100
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Box jump burpee",
                "Realizar un burpee completo seguido inmediatamente de un salto al cajón.",
                "Piernas, Potencia, Cardiovascular",
                4,
                8,
                camino,
                avanzado,
                "https://youtu.be/box-jump-burpee",
                90
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Man makers",
                "Desde posición de plancha con mancuernas, hacer un push-up, remo con cada brazo, ponerse de pie y hacer un thruster.",
                "Full body, Resistencia",
                3,
                8,
                camino,
                avanzado,
                "https://youtu.be/man-makers",
                95
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Muscle ups",
                "Dominada explosiva que termina con una transición a fondos sobre la barra.",
                "Espalda, Pecho, Tríceps, Potencia",
                3,
                5,
                camino,
                avanzado,
                "https://youtu.be/muscle-up",
                100
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Sandbag clean and press",
                "Levantamiento de saco de arena desde el suelo hasta por encima de la cabeza.",
                "Full body, Fuerza funcional",
                4,
                6,
                camino,
                avanzado,
                "https://youtu.be/sandbag-clean",
                90
        ));

        exerciseRepository.saveAll(ejerciciosAvanzado);

        // NIVEL PRO
        List<ExerciseEntity> ejerciciosPro = new ArrayList<>();

        ejerciciosPro.add(new ExerciseEntity(
                "Handstand push ups",
                "Flexiones de brazos en posición invertida, apoyado contra una pared.",
                "Hombros, Tríceps, Equilibrio",
                4,
                6,
                camino,
                pro,
                "https://youtu.be/hspu",
                110
        ));

        ejerciciosPro.add(new ExerciseEntity(
                "Muscle up a anillas",
                "Similar al muscle up pero en anillas, requiriendo mayor estabilidad y control.",
                "Full body, Control, Potencia",
                3,
                5,
                camino,
                pro,
                "https://youtu.be/ring-muscle-up",
                120
        ));

        ejerciciosPro.add(new ExerciseEntity(
                "Snatch",
                "Movimiento olímpico que consiste en llevar la barra desde el suelo hasta encima de la cabeza en un solo movimiento.",
                "Full body, Técnica, Explosividad",
                5,
                3,
                camino,
                pro,
                "https://youtu.be/snatch",
                125
        ));

        ejerciciosPro.add(new ExerciseEntity(
                "Turkish get-up",
                "Levantarse del suelo a posición de pie mientras se sostiene una pesa sobre la cabeza.",
                "Full body, Estabilidad, Coordinación",
                3,
                5,
                camino,
                pro,
                "https://youtu.be/tgu",
                115
        ));

        ejerciciosPro.add(new ExerciseEntity(
                "Pistol squat",
                "Sentadilla a una pierna manteniendo la otra extendida frente a ti.",
                "Piernas, Equilibrio, Fuerza unilateral",
                3,
                8,
                camino,
                pro,
                "https://youtu.be/pistol-squat",
                115
        ));

        ejerciciosPro.add(new ExerciseEntity(
                "Climbing rope",
                "Escalar una cuerda usando principalmente la fuerza de brazos y técnica de piernas.",
                "Brazos, Espalda, Agarre, Coordinación",
                3,
                3,
                camino,
                pro,
                "https://youtu.be/rope-climb",
                130
        ));

        exerciseRepository.saveAll(ejerciciosPro);
    }

    }