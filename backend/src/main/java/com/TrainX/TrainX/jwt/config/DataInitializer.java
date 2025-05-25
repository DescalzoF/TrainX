package com.TrainX.TrainX.jwt.config;

import com.TrainX.TrainX.caminoFitness.CaminoFitnessEntity;
import com.TrainX.TrainX.caminoFitness.CaminoFitnessRepository;
import com.TrainX.TrainX.exercise.ExerciseEntity;
import com.TrainX.TrainX.exercise.ExerciseRepository;
import com.TrainX.TrainX.level.LevelEntity;
import com.TrainX.TrainX.level.LevelRepository;
import com.TrainX.TrainX.task.TaskEntity;
import com.TrainX.TrainX.task.TaskRepository;
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
                // Crear los 4 niveles comunes para todos los caminos
                List<CaminoFitnessEntity> allCaminos = caminoFitnessRepository.findAll();

                // Create the four common levels with IDs 1-4
                LevelEntity principiante = createCommonLevel(levelRepository, "Principiante", 1, allCaminos);
                LevelEntity intermedio = createCommonLevel(levelRepository, "Intermedio", 2, allCaminos);
                LevelEntity avanzado = createCommonLevel(levelRepository, "Avanzado", 3, allCaminos);
                LevelEntity pro = createCommonLevel(levelRepository, "Pro", 4, allCaminos);

                // Create exercises for each fitness path using the common levels
                initDeportistaExercises(caminoFitnessRepository, exerciseRepository, principiante, intermedio, avanzado, pro);
                initFuerzaExercises(caminoFitnessRepository, exerciseRepository, principiante, intermedio, avanzado, pro);
                initEntrenamientoHibridoExercises(caminoFitnessRepository, exerciseRepository, principiante, intermedio, avanzado, pro);
                initHipertrofiaExercises(caminoFitnessRepository, exerciseRepository, principiante, intermedio, avanzado, pro);
                initOtroExercises(caminoFitnessRepository, exerciseRepository, principiante, intermedio, avanzado, pro);

                System.out.println("Inicialización de niveles y ejercicios completada con éxito.");
            }
        };
    }
    @Bean
    @Order(3)
    public CommandLineRunner loadTasks(
            CaminoFitnessRepository caminoFitnessRepository,
            TaskRepository taskRepository) {
        return args -> {
            if (taskRepository.count() == 0) {
                List<CaminoFitnessEntity> caminos = caminoFitnessRepository.findAll();
                for (CaminoFitnessEntity camino : caminos) {
                    taskRepository.saveAll(createTasksForCamino(camino));
                }
                System.out.println("Inicialización de tareas semanales completada con éxito.");
            }
        };
    }

    private List<TaskEntity> createTasksForCamino(CaminoFitnessEntity camino) {
        List<TaskEntity> tasks = new ArrayList<>();
        String name = camino.getNameCF();
        switch (name) {
            case "Deportista":
                tasks.add(new TaskEntity("3 sesiones de cardio intensivo",
                        "Completa al menos 3 sesiones de cardio de alta intensidad durante la semana.", camino, 60L));
                tasks.add(new TaskEntity("Entrenamiento de agilidad",
                        "Realiza ejercicios de agilidad en al menos 2 sesiones.", camino, 40L));
                tasks.add(new TaskEntity("Evaluación de rendimiento",
                        "Haz un test de velocidad y resistencia para medir tu progreso.", camino, 50L));
                tasks.add(new TaskEntity("Recuperación activa",
                        "Dedica una sesión a ejercicios de bajo impacto y movilidad.", camino, 30L));
                tasks.add(new TaskEntity("Revisión de objetivos",
                        "Anota tus metas semanales y revisa tu plan.", camino, 20L));
                break;
            case "Fuerza":
                tasks.add(new TaskEntity("5 series de sentadillas",
                        "Realiza 5 series de sentadillas con cargas apropiadas.", camino, 50L));
                tasks.add(new TaskEntity("4 series de press de banca",
                        "Completa 4 series de press de banca.", camino, 45L));
                tasks.add(new TaskEntity("Dominadas asistidas",
                        "Haz al menos 3 series de dominadas asistidas.", camino, 40L));
                tasks.add(new TaskEntity("Peso muerto técnico",
                        "Practica al menos 3 series de peso muerto enfocándote en la técnica.", camino, 50L));
                tasks.add(new TaskEntity("Control post-entreno",
                        "Registra tus cargas y repeticiones para cada ejercicio.", camino, 25L));
                break;
            case "Entrenamiento Híbrido":
                tasks.add(new TaskEntity("Circuito de fuerza y cardio",
                        "Completa 2 circuitos mixtos de fuerza y cardio.", camino, 55L));
                tasks.add(new TaskEntity("Series de sprint",
                        "Realiza 4 series de sprint de 30 segundos.", camino, 35L));
                tasks.add(new TaskEntity("Entrenamiento cruzado",
                        "Integra 2 ejercicios de cross-training en tu rutina.", camino, 45L));
                tasks.add(new TaskEntity("Trabajo de core",
                        "Dedica 3 sesiones a ejercicios de core.", camino, 30L));
                tasks.add(new TaskEntity("Movilidad dinámica",
                        "Realiza ejercicios de movilidad antes de cada sesión.", camino, 25L));
                break;
            case "Hipertrofia":
                tasks.add(new TaskEntity("Rutina de volumen superior",
                        "Realiza tu rutina de hipertrofia para la parte superior del cuerpo.", camino, 60L));
                tasks.add(new TaskEntity("Rutina de volumen inferior",
                        "Completa tu rutina de hipertrofia para la parte inferior.", camino, 60L));
                tasks.add(new TaskEntity("Series al fallo",
                        "Incorpora al menos 2 series al fallo muscular.", camino, 50L));
                tasks.add(new TaskEntity("Control de macros",
                        "Registra tu ingesta de proteínas y carbohidratos diarios.", camino, 40L));
                tasks.add(new TaskEntity("Sesión de bomba muscular",
                        "Realiza una sesión enfocada en el “pump” muscular.", camino, 30L));
                break;
            default: // "Otro"
                tasks.add(new TaskEntity("Actividad libre",
                        "Elige cualquier actividad física y complétala al menos 3 veces.", camino, 30L));
                tasks.add(new TaskEntity("Registro de bienestar",
                        "Anota cómo te sientes antes y después de cada sesión.", camino, 20L));
                tasks.add(new TaskEntity("Meta personal semanal",
                        "Define y cumple una meta personal relacionada con tu salud.", camino, 25L));
                tasks.add(new TaskEntity("Chequeo postural",
                        "Realiza ejercicios de corrección postural.", camino, 15L));
                tasks.add(new TaskEntity("Plan de hidratación",
                        "Mantén un registro de tu ingesta de agua diaria.", camino, 20L));
        }
        return tasks;
    }
    // Creates a level that will be shared across all fitness paths
    private LevelEntity createCommonLevel(LevelRepository levelRepository, String levelName, int levelNumber, List<CaminoFitnessEntity> allCaminos) {
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
        LevelEntity level = new LevelEntity(levelName, allCaminos, xpMin, xpMax);

        // Save and return the level
        return levelRepository.save(level);
    }

    private void initOtroExercises(
            CaminoFitnessRepository caminoFitnessRepository,
            ExerciseRepository exerciseRepository,LevelEntity principiante,
            LevelEntity intermedio,
            LevelEntity avanzado,
            LevelEntity pro) {

        CaminoFitnessEntity camino = caminoFitnessRepository
                .findByNameCFIgnoreCase("Otro")
                .orElseThrow(() -> new RuntimeException("No se encontró el camino Otro"));


        // NIVEL PRINCIPIANTE (6 placeholders, xpReward = 50)
        List<ExerciseEntity> ejerciciosPrincipiante = new ArrayList<>();
        for (int i = 0; i < 11; i++) {
            ejerciciosPrincipiante.add(new ExerciseEntity(
                    "",    // name vacío
                    "",    // description vacío
                    "",    // muscleGroup vacío
                    0,     // sets por defecto
                    0,     // reps por defecto
                    camino,
                    principiante,
                    "",    // videoUrl vacío
                    50L,     // xpReward Principiante
                    0d
            ));
        }
        exerciseRepository.saveAll(ejerciciosPrincipiante);

        // NIVEL INTERMEDIO (6 placeholders, xpReward = 75)
        List<ExerciseEntity> ejerciciosIntermedio = new ArrayList<>();
        for (int i = 0; i < 11; i++) {
            ejerciciosIntermedio.add(new ExerciseEntity(
                    "Piernas",
                    "Piernas",
                    "Piernas",
                    0,
                    0,
                    camino,
                    intermedio,
                    "",
                    75L,    // xpReward Intermedio
                    0d
            ));
        }
        exerciseRepository.saveAll(ejerciciosIntermedio);

        // NIVEL AVANZADO (6 placeholders, xpReward = 100)
        List<ExerciseEntity> ejerciciosAvanzado = new ArrayList<>();
        for (int i = 0; i < 11; i++) {
            ejerciciosAvanzado.add(new ExerciseEntity(
                    "Piernas",
                    "Piernas",
                    "Piernas",
                    0,
                    0,
                    camino,
                    avanzado,
                    "",
                    100L,    // xpReward Avanzado
                    0d
            ));
        }
        exerciseRepository.saveAll(ejerciciosAvanzado);

        // NIVEL PRO (6 placeholders, xpReward = 125)
        List<ExerciseEntity> ejerciciosPro = new ArrayList<>();
        for (int i = 0; i < 11; i++) {
            ejerciciosPro.add(new ExerciseEntity(
                    "Piernas",
                    "Piernas",
                    "Piernas",
                    0,
                    0,
                    camino,
                    pro,
                    "",
                    125L,    // xpReward Pro
                    0d
            ));
        }
        exerciseRepository.saveAll(ejerciciosPro);
    }



    private void initDeportistaExercises(
            CaminoFitnessRepository caminoFitnessRepository,
            ExerciseRepository exerciseRepository,
            LevelEntity principiante,
            LevelEntity intermedio,
            LevelEntity avanzado,
            LevelEntity pro) {

        CaminoFitnessEntity camino = caminoFitnessRepository.findByNameCFIgnoreCase("Deportista")
                .orElseThrow(() -> new RuntimeException("No se encontró el camino Deportista"));

        // XP ranges by level
        // Principiante: 25-60 XP
        // Intermedio: 50-90 XP
        // Avanzado: 85-130 XP
        // Pro: 125-200 XP

        // NIVEL PRINCIPIANTE
        List<ExerciseEntity> ejerciciosPrincipiante = new ArrayList<>();

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Saltos en el lugar",
                "Salta en el lugar con ambas piernas juntas, impulsándote con los brazos para mayor altura.",
                "Piernas",
                3,
                15,
                camino,
                principiante,
                "https://youtu.be/saltos-lugar",
                30L, // Ejercicio básico de nivel principiante
                0d
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Burpees modificados",
                "Comienza de pie, baja a posición de cuclillas, coloca las manos en el suelo, extiende las piernas hacia atrás y regresa a la posición inicial.",
                "Piernas",
                3,
                8,
                camino,
                principiante,
                "https://youtu.be/burpees-modificados",
                45L, // Mayor dificultad dentro del nivel principiante
                0d
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Sprints de 10 metros",
                "Corre a máxima velocidad una distancia de 10 metros, descansa y repite.",
                "Piernas",
                4,
                2,
                camino,
                principiante,
                "https://youtu.be/sprints-10m",
                40L, // Intensidad media-alta para principiante
                0d
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Planchas con toques de hombro",
                "En posición de plancha alta, toca tu hombro izquierdo con la mano derecha y viceversa, alternando manos.",
                "Hombros",
                3,
                10,
                camino,
                principiante,
                "https://youtu.be/plancha-toques",
                35L, // Dificultad media para principiante
                0d
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Escaladores",
                "En posición de plancha alta, lleva alternadamente las rodillas hacia el pecho en un movimiento rápido y controlado.",
                "Piernas",
                3,
                20,
                camino,
                principiante,
                "https://youtu.be/escaladores",
                40L, // Intensidad media-alta para principiante
                0d
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Saltos laterales",
                "Salta de lado a lado sobre una línea imaginaria, manteniendo los pies juntos y aterrizando suavemente.",
                "Piernas",
                3,
                15,
                camino,
                principiante,
                "https://youtu.be/saltos-laterales",
                35L, // Dificultad media para principiante
                0d
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Estocadas estáticas",
                "Con una pierna adelante y otra atrás, baja el cuerpo manteniendo la rodilla delantera en ángulo de 90 grados, luego sube.",
                "Piernas, Glúteos",
                3,
                10,
                camino,
                principiante,
                "https://youtu.be/estocadas-estaticas",
                40L, // Dificultad media para principiante
                0d
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Flexiones de rodillas",
                "Realiza flexiones con las rodillas apoyadas en el suelo, manteniendo la espalda recta durante todo el movimiento.",
                "Pecho, Tríceps",
                3,
                12,
                camino,
                principiante,
                "https://youtu.be/flexiones-rodillas",
                38L, // Dificultad media para principiante
                0d
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Superman",
                "Acostado boca abajo, eleva simultáneamente brazos y piernas del suelo, manteniendo la posición por 2 segundos.",
                "Espalda baja, Glúteos",
                3,
                12,
                camino,
                principiante,
                "https://youtu.be/superman",
                25L, // Ejercicio básico de nivel principiante
                0d
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Skipping alto",
                "Corre en el lugar levantando las rodillas lo más alto posible en un ritmo rápido y constante.",
                "Piernas, Cardio",
                3,
                30,
                camino,
                principiante,
                "https://youtu.be/skipping-alto",
                35L, // Dificultad media para principiante
                0d
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Plancha frontal",
                "Mantén la posición de plancha apoyando antebrazos y puntas de los pies, con el cuerpo alineado.",
                "Core, Hombros",
                3,
                30,
                camino,
                principiante,
                "https://youtu.be/plancha-frontal",
                32L, // Dificultad media-baja para principiante
                0d
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Sentadillas básicas",
                "Con los pies separados al ancho de hombros, baja como si fueras a sentarte manteniendo el pecho elevado.",
                "Piernas, Glúteos",
                3,
                15,
                camino,
                principiante,
                "https://youtu.be/sentadillas-basicas",
                28L, // Ejercicio básico de nivel principiante
                0d
        ));

        exerciseRepository.saveAll(ejerciciosPrincipiante);

        // NIVEL INTERMEDIO
        List<ExerciseEntity> ejerciciosIntermedio = new ArrayList<>();

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Burpees completos",
                "Comienza de pie, baja a posición de flexión, haz una flexión, salta de vuelta a posición de cuclillas y salta hacia arriba con las manos extendidas.",
                "Piernas",
                3,
                12,
                camino,
                intermedio,
                "https://youtu.be/burpees-completos",
                75L, // Ejercicio exigente de nivel intermedio
                0d
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Sprints de 20 metros",
                "Corre a máxima velocidad una distancia de 20 metros, descansa 30 segundos y repite.",
                "Piernas",
                5,
                3,
                camino,
                intermedio,
                "https://youtu.be/sprints-20m",
                70L, // Alta intensidad para nivel intermedio
                0d
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Saltos en cajón",
                "Salta sobre un cajón o plataforma elevada con ambos pies, baja controladamente y repite.",
                "Piernas",
                3,
                10,
                camino,
                intermedio,
                "https://youtu.be/saltos-cajon",
                65L, // Dificultad media-alta para intermedio
                0d
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Flexiones explosivas",
                "Realiza una flexión normal pero con suficiente impulso para despegar las manos del suelo momentáneamente.",
                "Pecho",
                3,
                8,
                camino,
                intermedio,
                "https://youtu.be/flexiones-explosivas",
                70L, // Alta intensidad para nivel intermedio
                0d
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Sentadillas con salto",
                "Realiza una sentadilla completa y al subir, salta explosivamente. Aterriza suavemente y repite.",
                "Piernas",
                3,
                12,
                camino,
                intermedio,
                "https://youtu.be/sentadillas-salto",
                60L, // Dificultad media para intermedio
                0d
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Mountain climbers rápidos",
                "En posición de plancha alta, alterna las rodillas hacia el pecho lo más rápido posible manteniendo la estabilidad.",
                "Piernas",
                3,
                30,
                camino,
                intermedio,
                "https://youtu.be/mountain-climbers",
                55L, // Dificultad media-baja para intermedio
                0d
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Flexiones con palmada",
                "Realiza una flexión explosiva con suficiente impulso para dar una palmada antes de volver a apoyar las manos.",
                "Pecho, Tríceps, Potencia",
                3,
                8,
                camino,
                intermedio,
                "https://youtu.be/flexiones-palmada",
                85L, // Alta dificultad dentro de intermedio
                0d
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Estocadas saltadas",
                "Desde posición de estocada, salta y cambia la posición de las piernas en el aire, aterrizando en estocada con la otra pierna adelante.",
                "Piernas, Glúteos, Cardio",
                3,
                10,
                camino,
                intermedio,
                "https://youtu.be/estocadas-saltadas",
                75L, // Dificultad alta para intermedio
                0d
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Dominadas",
                "Colgado de una barra, eleva tu cuerpo hasta que la barbilla supere la barra utilizando la fuerza de la espalda y brazos.",
                "Espalda, Bíceps",
                3,
                8,
                camino,
                intermedio,
                "https://youtu.be/dominadas",
                80L, // Dificultad alta para intermedio
                0d
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Fondos en paralelas",
                "Con las manos apoyadas en barras paralelas, baja y sube el cuerpo flexionando y extendiendo los codos.",
                "Tríceps, Pecho",
                3,
                10,
                camino,
                intermedio,
                "https://youtu.be/fondos-paralelas",
                75L, // Dificultad alta para intermedio
                0d
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Russian twist",
                "Sentado con piernas elevadas, gira el torso de lado a lado tocando el suelo con las manos a cada lado.",
                "Core, Oblicuos",
                3,
                20,
                camino,
                intermedio,
                "https://youtu.be/russian-twist",
                50L, // Dificultad baja-media para intermedio
                0d
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Wall balls",
                "Realiza una sentadilla completa con una pelota medicinal y al subir, lanza la pelota a un punto alto en la pared.",
                "Piernas, Hombros, Coordinación",
                3,
                15,
                camino,
                intermedio,
                "https://youtu.be/wall-balls",
                65L, // Dificultad media para intermedio
                0d
        ));

        exerciseRepository.saveAll(ejerciciosIntermedio);

        // NIVEL AVANZADO
        List<ExerciseEntity> ejerciciosAvanzado = new ArrayList<>();

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Burpees con dominadas",
                "Realiza un burpee completo y al ponerte de pie, salta para agarrar una barra y hacer una dominada.",
                "Piernas",
                3,
                8,
                camino,
                avanzado,
                "https://youtu.be/burpees-dominadas",
                115L, // Alta dificultad para nivel avanzado
                0d
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Sprints con cambio de dirección",
                "Corre a máxima velocidad 10 metros, toca el suelo, cambia de dirección y regresa a máxima velocidad.",
                "Piernas",
                5,
                4,
                camino,
                avanzado,
                "https://youtu.be/sprints-cambio",
                105L, // Intensidad alta para avanzado
                0d
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Box jumps con una pierna",
                "Salta sobre un cajón o plataforma elevada con una sola pierna, alterna piernas en cada repetición.",
                "Piernas",
                3,
                6,
                camino,
                avanzado,
                "https://youtu.be/box-jumps-unilateral",
                120L, // Muy alta dificultad para avanzado
                0d
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Muscle ups",
                "Partiendo de una posición colgada, realiza una dominada explosiva que te permita elevar el cuerpo por encima de la barra.",
                "Espalda",
                3,
                5,
                camino,
                avanzado,
                "https://youtu.be/muscle-ups",
                125L, // Muy alta dificultad para avanzado
                0d
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Pistol squats",
                "Sentadilla a una pierna donde la otra se extiende completamente al frente mientras bajas.",
                "Piernas",
                3,
                8,
                camino,
                avanzado,
                "https://youtu.be/pistol-squats",
                110L, // Alta dificultad para avanzado
                0d
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Saltos en cuerda doble",
                "Realiza saltos con cuerda donde esta pasa dos veces bajo tus pies en cada salto.",
                "Piernas",
                4,
                20,
                camino,
                avanzado,
                "https://youtu.be/doble-salto-cuerda",
                95L, // Dificultad media-alta para avanzado
                0d
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Saltos pliométricos a cajón con rotación",
                "Salta sobre un cajón y al bajar, rota 180 grados antes de saltar nuevamente al cajón.",
                "Piernas, Coordinación",
                3,
                8,
                camino,
                avanzado,
                "https://youtu.be/box-jumps-rotacion",
                115L, // Alta dificultad para avanzado
                0d
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Flexiones archer",
                "Realiza flexiones con un brazo extendido lateralmente mientras el otro soporta el peso, alternando brazos.",
                "Pecho, Tríceps, Hombros",
                3,
                6,
                camino,
                avanzado,
                "https://youtu.be/archer-pushups",
                105L, // Alta dificultad para avanzado
                0d
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Dominadas L-sit",
                "Realiza dominadas manteniendo las piernas extendidas al frente paralelas al suelo durante todo el movimiento.",
                "Espalda, Core, Bíceps",
                3,
                5,
                camino,
                avanzado,
                "https://youtu.be/lsit-pullups",
                130L, // Extremadamente difícil para avanzado
                0d
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Shuttle runs con escalera de agilidad",
                "Realiza patrones de pies rápidos a través de una escalera de agilidad y sprints cortos entre segmentos.",
                "Agilidad, Coordinación, Cardio",
                4,
                2,
                camino,
                avanzado,
                "https://youtu.be/ladder-drills",
                90L, // Dificultad media para avanzado
                0d
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Dragon flags",
                "Acostado con soporte en los hombros, eleva el cuerpo recto y bájalo lentamente sin tocar el suelo.",
                "Core, Espalda baja",
                3,
                6,
                camino,
                avanzado,
                "https://youtu.be/dragon-flags",
                120L, // Muy alta dificultad para avanzado
                0d
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Burpee a barra",
                "Realiza un burpee completo y al levantarte, salta para agarrar una barra alta y vuelve a descender.",
                "Full body",
                3,
                10,
                camino,
                avanzado,
                "https://youtu.be/burpee-barra",
                100L, // Alta dificultad para avanzado
                0d
        ));

        exerciseRepository.saveAll(ejerciciosAvanzado);

        // NIVEL PRO
        List<ExerciseEntity> ejerciciosPro = new ArrayList<>();

        ejerciciosPro.add(new ExerciseEntity(
                "Devil press",
                "Con mancuernas en el suelo, realiza un burpee y al levantarte eleva las mancuernas sobre la cabeza en un solo movimiento.",
                "Piernas",
                4,
                10,
                camino,
                pro,
                "https://youtu.be/devil-press",
                160L, // Alta dificultad para nivel pro
                0d
        ));

        ejerciciosPro.add(new ExerciseEntity(
                "Intervalos de velocidad 400m",
                "Corre 400 metros a máxima velocidad, descansa 60 segundos y repite.",
                "Piernas",
                4,
                1,
                camino,
                pro,
                "https://youtu.be/sprints-400m",
                175L, // Muy alta intensidad para pro
                0d
        ));

        ejerciciosPro.add(new ExerciseEntity(
                "Handstand push-ups",
                "En posición invertida contra una pared, flexiona y extiende los brazos realizando flexiones.",
                "Hombros",
                3,
                8,
                camino,
                pro,
                "https://youtu.be/handstand-pushups",
                185L, // Extremadamente difícil para pro
                0d
        ));

        ejerciciosPro.add(new ExerciseEntity(
                "Plyo ring dips",
                "Realiza fondos en anillas con un impulso explosivo para despegar las manos momentáneamente.",
                "Pecho",
                3,
                8,
                camino,
                pro,
                "https://youtu.be/plyo-dips",
                180L, // Extremadamente difícil para pro
                0d
        ));

        ejerciciosPro.add(new ExerciseEntity(
                "Shuttle runs con pesos",
                "Coloca 5 marcadores separados por 5 metros. Corre hasta cada uno en orden con pesos en las manos, toca el suelo y regresa al inicio.",
                "Piernas",
                3,
                1,
                camino,
                pro,
                "https://youtu.be/shuttle-runs",
                150L, // Dificultad alta para pro
                0d
        ));

        ejerciciosPro.add(new ExerciseEntity(
                "Clean and jerk",
                "Levanta una barra desde el suelo hasta los hombros (clean) y luego sobre la cabeza con brazos extendidos (jerk).",
                "Piernas",
                4,
                5,
                camino,
                pro,
                "https://youtu.be/clean-jerk",
                170L, // Muy alta dificultad para pro
                0d
        ));

        ejerciciosPro.add(new ExerciseEntity(
                "Muscle up transición lenta",
                "Realiza un muscle up controlando cada fase del movimiento, especialmente la transición entre tirar y empujar.",
                "Espalda, Pecho, Tríceps, Core",
                3,
                5,
                camino,
                pro,
                "https://youtu.be/slow-muscle-up",
                190L, // Extremadamente difícil para pro
                0d
        ));

        ejerciciosPro.add(new ExerciseEntity(
                "Thrusters con peso",
                "Combina una sentadilla frontal con press de hombros en un solo movimiento fluido usando barra o mancuernas.",
                "Piernas, Hombros, Core",
                4,
                10,
                camino,
                pro,
                "https://youtu.be/thrusters",
                145L, // Dificultad media-alta para pro
                0d
        ));

        ejerciciosPro.add(new ExerciseEntity(
                "Circuito de obstáculos de alta intensidad",
                "Completa un circuito de 5-6 obstáculos combinando movimientos de salto, escalada, equilibrio y arrastre.",
                "Full body, Resistencia",
                3,
                1,
                camino,
                pro,
                "https://youtu.be/obstacle-circuit",
                195L, // Extremadamente difícil y demandante para pro
                0d
        ));

        ejerciciosPro.add(new ExerciseEntity(
                "Snatch",
                "Levanta una barra desde el suelo hasta por encima de la cabeza en un solo movimiento explosivo.",
                "Full body, Potencia",
                4,
                5,
                camino,
                pro,
                "https://youtu.be/snatch",
                185L, // Extremadamente difícil para pro
                0d
        ));

        ejerciciosPro.add(new ExerciseEntity(
                "Planchas con tocando objetivos laterales",
                "En posición de plancha alta, alterna el toque de objetivos colocados a los lados con cada mano.",
                "Core, Hombros, Coordinación",
                3,
                10,
                camino,
                pro,
                "https://youtu.be/plank-targets",
                130L, // Dificultad media para pro
                0d
        ));

        ejerciciosPro.add(new ExerciseEntity(
                "Saltos en caja con rebote mínimo",
                "Salta de una caja alta, aterriza y rebota inmediatamente a otra caja con tiempo mínimo de contacto con el suelo.",
                "Piernas, Potencia, Explosividad",
                4,
                8,
                camino,
                pro,
                "https://youtu.be/depth-jumps",
                200L, // Máxima dificultad y riesgo para pro
                0d
        ));

        exerciseRepository.saveAll(ejerciciosPro);
    }
    private void initFuerzaExercises(
            CaminoFitnessRepository caminoFitnessRepository,
            ExerciseRepository exerciseRepository,LevelEntity principiante,
            LevelEntity intermedio,
            LevelEntity avanzado,
            LevelEntity pro) {

        CaminoFitnessEntity camino = caminoFitnessRepository.findByNameCFIgnoreCase("Fuerza")
                .orElseThrow(() -> new RuntimeException("No se encontró el camino Fuerza"));

        // NIVEL PRINCIPIANTE
        List<ExerciseEntity> ejerciciosPrincipiante = new ArrayList<>();

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Press de banca con barra vacía",
                "Acuéstate en un banco plano, sujeta la barra con un agarre ligeramente más ancho que los hombros y baja hasta el pecho antes de empujar hacia arriba.",
                "Pecho",
                3,
                10,
                camino,
                principiante,
                "https://www.youtube.com/watch?v=jlFl7WJ1TzI&ab_channel=JeremyEthierenEspa%C3%B1ol",
                35L,
                0d
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Sentadillas con peso corporal",
                "De pie con los pies a la anchura de los hombros, flexiona las rodillas bajando las caderas como si fueras a sentarte, manteniendo el pecho erguido.",
                "Piernas",
                3,
                12,
                camino,
                principiante,
                "https://www.youtube.com/watch?v=lNwH67XzjVM&ab_channel=GabrielaAriasMadero",
                28L,
                0d
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Peso muerto rumano con mancuernas",
                "De pie con mancuernas frente a los muslos, flexiona las caderas hacia atrás manteniendo la espalda recta y baja las pesas.",
                "Espalda",
                3,
                10,
                camino,
                principiante,
                "https://youtu.be/rdl-dumbbells",
                38L,
                0d
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Press militar con mancuernas",
                "Sentado o de pie, sostén mancuernas a la altura de los hombros y empújalas hacia arriba hasta extender los brazos.",
                "Hombros",
                3,
                10,
                camino,
                principiante,
                "https://youtu.be/shoulder-press-db",
                33L,
                0d
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Remo con mancuerna",
                "Con una rodilla y mano apoyadas en un banco, mantén la espalda paralela al suelo y jala la mancuerna hacia la cadera.",
                "Espalda",
                3,
                10,
                camino,
                principiante,
                "https://youtu.be/db-row",
                32L,
                0d
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Elevaciones de pantorrilla",
                "De pie, elévate sobre las puntas de los pies y baja lentamente, puedes usar apoyo para equilibrio.",
                "Piernas",
                3,
                15,
                camino,
                principiante,
                "https://youtu.be/calf-raises",
                25L,
                0d
        ));

        // Nuevos ejercicios para principiante
        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Flexiones de rodillas",
                "Apoya las rodillas y manos en el suelo, baja el pecho hacia el suelo flexionando los codos y luego empuja hacia arriba.",
                "Pecho, Tríceps",
                3,
                12,
                camino,
                principiante,
                "https://youtu.be/knee-pushups",
                30L,
                0d
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Curl de bíceps con mancuernas",
                "De pie con mancuernas a los lados, flexiona los codos para levantar las pesas hacia los hombros.",
                "Bíceps",
                3,
                12,
                camino,
                principiante,
                "https://youtu.be/bicep-curl",
                32L,
                0d
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Extensiones de tríceps con mancuerna",
                "Sentado o de pie, sostén una mancuerna con ambas manos sobre la cabeza y baja doblando los codos antes de extender.",
                "Tríceps",
                3,
                12,
                camino,
                principiante,
                "https://youtu.be/tricep-extension",
                34L,
                0d
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Puente de glúteos",
                "Acostado boca arriba con rodillas flexionadas, eleva las caderas apretando los glúteos y baja lentamente.",
                "Glúteos, Isquiotibiales",
                3,
                15,
                camino,
                principiante,
                "https://youtu.be/glute-bridge",
                27L,
                0d
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Plancha frontal",
                "Apóyate en antebrazos y puntas de los pies, manteniendo el cuerpo en línea recta y el core contraído.",
                "Core, Hombros",
                3,
                30,
                camino,
                principiante,
                "https://youtu.be/front-plank",
                40L,
                0d
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Superman",
                "Acostado boca abajo, eleva simultáneamente brazos y piernas manteniendo la posición brevemente.",
                "Espalda baja, Glúteos",
                3,
                12,
                camino,
                principiante,
                "https://youtu.be/superman-exercise",
                31L,
                0d
        ));

        exerciseRepository.saveAll(ejerciciosPrincipiante);

        // NIVEL INTERMEDIO
        List<ExerciseEntity> ejerciciosIntermedio = new ArrayList<>();

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Press de banca con pesas",
                "Acuéstate en un banco plano, sujeta la barra con un agarre ligeramente más ancho que los hombros y baja hasta el pecho antes de empujar hacia arriba.",
                "Pecho",
                4,
                8,
                camino,
                intermedio,
                "https://youtu.be/bench-press",
                65L,
                0d
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Sentadillas con barra",
                "Coloca una barra sobre los trapecios, mantén el pecho erguido y baja flexionando las rodillas hasta que los muslos estén paralelos al suelo.",
                "Piernas",
                4,
                8,
                camino,
                intermedio,
                "https://youtu.be/back-squat",
                70L,
                0d
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Peso muerto convencional",
                "Con una barra en el suelo, flexiona las caderas y rodillas, agarra la barra y levántala manteniendo la espalda recta hasta estar de pie.",
                "Espalda",
                4,
                6,
                camino,
                intermedio,
                "https://youtu.be/deadlift",
                80L,
                0d
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Press militar con barra",
                "De pie, con una barra en la parte frontal de los hombros, empuja hacia arriba hasta extender completamente los brazos.",
                "Hombros",
                4,
                8,
                camino,
                intermedio,
                "https://youtu.be/ohp-press",
                68L,
                0d
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Dominadas",
                "Colgando de una barra con agarre prono, jala tu cuerpo hacia arriba hasta que tu barbilla supere la barra.",
                "Espalda",
                3,
                8,
                camino,
                intermedio,
                "https://youtu.be/pull-ups",
                75L,
                0d
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Fondos en paralelas",
                "Sostenido en barras paralelas, baja el cuerpo flexionando los codos y empuja hacia arriba hasta extender los brazos.",
                "Pecho",
                3,
                10,
                camino,
                intermedio,
                "https://youtu.be/dips",
                72L,
                0d
        ));

        // Nuevos ejercicios para intermedio
        ejerciciosIntermedio.add(new ExerciseEntity(
                "Hip thrust con barra",
                "Siéntate en el suelo con la espalda apoyada en un banco y una barra sobre las caderas, eleva las caderas empujando con los glúteos.",
                "Glúteos, Isquiotibiales",
                4,
                10,
                camino,
                intermedio,
                "https://youtu.be/hip-thrust",
                63L,
                0d
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Remo en T con barra",
                "Inclínate hacia adelante sosteniendo una barra, mantén la espalda plana y jala la barra hacia el abdomen.",
                "Espalda media, Romboides, Trapecios",
                4,
                8,
                camino,
                intermedio,
                "https://youtu.be/t-bar-row",
                67L,
                0d
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Press de banca declinado",
                "Similar al press de banca pero en un banco declinado para enfatizar la parte inferior del pecho.",
                "Pecho inferior, Tríceps",
                4,
                8,
                camino,
                intermedio,
                "https://youtu.be/decline-bench",
                68L,
                0d
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Curl con barra",
                "De pie sosteniendo una barra con agarre supino, flexiona los codos para levantar la barra hacia los hombros.",
                "Bíceps, Antebrazos",
                3,
                10,
                camino,
                intermedio,
                "https://youtu.be/barbell-curl",
                55L,
                0d
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Extensiones de tríceps en polea",
                "De pie frente a una polea alta, sujeta la cuerda y empuja hacia abajo extendiendo completamente los codos.",
                "Tríceps",
                3,
                12,
                camino,
                intermedio,
                "https://youtu.be/tricep-pushdown",
                52L,
                0d
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Elevaciones laterales",
                "De pie con mancuernas a los lados, eleva los brazos lateralmente hasta la altura de los hombros.",
                "Deltoides medios",
                3,
                12,
                camino,
                intermedio,
                "https://youtu.be/lateral-raises",
                50L,
                0d
        ));

        exerciseRepository.saveAll(ejerciciosIntermedio);

        // NIVEL AVANZADO
        List<ExerciseEntity> ejerciciosAvanzado = new ArrayList<>();

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Press de banca inclinado",
                "Similar al press de banca pero en un banco inclinado para enfatizar la parte superior del pecho.",
                "Pecho",
                4,
                6,
                camino,
                avanzado,
                "https://youtu.be/incline-bench",
                95L,
                0d
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Sentadillas frontales",
                "Con la barra descansando en la parte frontal de los hombros, baja a la posición de sentadilla manteniendo el torso más vertical.",
                "Espalda",
                4,
                6,
                camino,
                avanzado,
                "https://youtu.be/front-squat",
                105L,
                0d
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Peso muerto sumo",
                "Posición de pies más ancha que el peso muerto convencional, con agarre interior a las piernas.",
                "Piernas",
                4,
                5,
                camino,
                avanzado,
                "https://youtu.be/sumo-deadlift",
                115L,
                0d
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Press de banca cerrado",
                "Variante del press de banca con agarre más estrecho para enfatizar los tríceps.",
                "Pecho",
                4,
                8,
                camino,
                avanzado,
                "https://youtu.be/close-grip-bench",
                90L,
                0d
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Remo Pendlay",
                "Con la espalda paralela al suelo, levanta explosivamente la barra hacia el abdomen y bájala controladamente.",
                "Espalda",
                4,
                6,
                camino,
                avanzado,
                "https://youtu.be/pendlay-row",
                108L,
                0d
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Zancadas con barra",
                "Con una barra en la espalda, da un paso adelante y flexiona ambas rodillas, luego regresa y alterna piernas.",
                "Piernas",
                3,
                8,
                camino,
                avanzado,
                "https://youtu.be/barbell-lunge",
                98L,
                0d
        ));

        // Nuevos ejercicios para avanzado
        ejerciciosAvanzado.add(new ExerciseEntity(
                "Press inclinado con mancuernas",
                "Acostado en un banco inclinado, empuja mancuernas desde los hombros hasta la extensión completa de los brazos.",
                "Pecho superior, Hombros, Tríceps",
                4,
                8,
                camino,
                avanzado,
                "https://youtu.be/incline-db-press",
                100L,
                0d
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Dominadas lastradas",
                "Dominadas con peso adicional sujeto al cuerpo mediante un cinturón o entre las piernas.",
                "Espalda, Bíceps",
                4,
                6,
                camino,
                avanzado,
                "https://youtu.be/weighted-pullups",
                120L,
                0d
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Hip thrust unilateral",
                "Similar al hip thrust pero ejecutado con una sola pierna para mayor intensidad.",
                "Glúteos, Estabilizadores",
                3,
                8,
                camino,
                avanzado,
                "https://youtu.be/single-leg-hip-thrust",
                102L,
                0d
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Extensiones de tríceps con barra en banco",
                "Acostado en un banco sosteniendo una barra sobre la cabeza, baja la barra detrás de la cabeza y luego extiende los brazos.",
                "Tríceps",
                4,
                8,
                camino,
                avanzado,
                "https://youtu.be/lying-tricep-extension",
                92L,
                0d
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Face pull",
                "De pie frente a una polea alta, jala la cuerda hacia la cara separando los brazos al final del movimiento.",
                "Hombros posteriores, Rotadores externos",
                3,
                12,
                camino,
                avanzado,
                "https://youtu.be/face-pull",
                85L,
                0d
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Press Arnold",
                "Sentado con mancuernas, comienza con mancuernas frente al pecho, gíralas mientras presionas hacia arriba.",
                "Hombros, Rotadores",
                3,
                10,
                camino,
                avanzado,
                "https://youtu.be/arnold-press",
                88L,
                0d
        ));

        exerciseRepository.saveAll(ejerciciosAvanzado);

        // NIVEL PRO
        List<ExerciseEntity> ejerciciosPro = new ArrayList<>();

        ejerciciosPro.add(new ExerciseEntity(
                "Press de banca con pausa",
                "Press de banca estándar pero manteniendo la barra en el pecho por 2-3 segundos antes de empujar.",
                "Pecho",
                5,
                5,
                camino,
                pro,
                "https://youtu.be/pause-bench",
                145L,
                0d
        ));

        ejerciciosPro.add(new ExerciseEntity(
                "Sentadillas olímpicas",
                "Sentadilla profunda con la espalda muy vertical, típicamente usada por levantadores olímpicos.",
                "Piernas",
                5,
                4,
                camino,
                pro,
                "https://youtu.be/olympic-squat",
                170L,
                0d
        ));

        ejerciciosPro.add(new ExerciseEntity(
                "Rack pulls",
                "Variante del peso muerto iniciando con la barra en soportes a la altura de las rodillas para enfatizar la parte superior del movimiento.",
                "Espalda",
                5,
                4,
                camino,
                pro,
                "https://youtu.be/rack-pulls",
                150L,
                0d
        ));

        ejerciciosPro.add(new ExerciseEntity(
                "Push press",
                "Press militar con un impulso inicial de piernas para mover más peso.",
                "Piernas",
                4,
                5,
                camino,
                pro,
                "https://youtu.be/push-press",
                140L,
                0d

        ));

        ejerciciosPro.add(new ExerciseEntity(
                "Arrancada de potencia",
                "Levantar la barra desde el suelo hasta sobre la cabeza en un solo movimiento explosivo, sin sentadilla completa.",
                "Piernas",
                4,
                3,
                camino,
                pro,
                "https://youtu.be/power-snatch",
                180L,
                0d
        ));

        ejerciciosPro.add(new ExerciseEntity(
                "Good morning con barra",
                "Con barra en la espalda, flexiona las caderas manteniendo las piernas casi rectas y la espalda plana.",
                "Espalda",
                4,
                6,
                camino,
                pro,
                "https://youtu.be/good-morning",
                135L,
                0d
        ));

        // Nuevos ejercicios para pro
        ejerciciosPro.add(new ExerciseEntity(
                "Clean & Jerk",
                "Levantamiento olímpico completo: cargar la barra desde el suelo hasta los hombros y luego impulsarla sobre la cabeza.",
                "Full body",
                5,
                3,
                camino,
                pro,
                "https://youtu.be/clean-and-jerk",
                200L,
                0d
        ));

        ejerciciosPro.add(new ExerciseEntity(
                "Press de banca con bandas",
                "Press de banca con bandas elásticas en los extremos de la barra para aumentar la resistencia en la parte superior del movimiento.",
                "Pecho, Tríceps",
                5,
                4,
                camino,
                pro,
                "https://youtu.be/band-bench-press",
                155L,
                0d
        ));

        ejerciciosPro.add(new ExerciseEntity(
                "Sentadillas con salto y barra",
                "Sentadilla con barra seguida de un salto explosivo, usado para desarrollar potencia.",
                "Cuádriceps, Glúteos, Potencia",
                4,
                5,
                camino,
                pro,
                "https://youtu.be/jump-squat",
                175L,
                0d
        ));

        ejerciciosPro.add(new ExerciseEntity(
                "Fondos lastrados",
                "Fondos en paralelas con peso adicional sujeto al cuerpo.",
                "Pecho, Tríceps",
                4,
                6,
                camino,
                pro,
                "https://youtu.be/weighted-dips",
                160L,
                0d
        ));

        ejerciciosPro.add(new ExerciseEntity(
                "Peso muerto rumano a una pierna",
                "Variación unilateral del peso muerto rumano que requiere mayor equilibrio y activación de estabilizadores.",
                "Isquiotibiales, Glúteos, Equilibrio",
                4,
                6,
                camino,
                pro,
                "https://youtu.be/single-leg-rdl",
                165L,
                0d
        ));

        ejerciciosPro.add(new ExerciseEntity(
                "Viking press",
                "Press de hombros con implemento especial o improvisado que permite mayor peso y estabilidad.",
                "Hombros, Tríceps, Core",
                4,
                5,
                camino,
                pro,
                "https://youtu.be/viking-press",
                148L,
                0d
        ));

        exerciseRepository.saveAll(ejerciciosPro);
    }

    private void initHipertrofiaExercises(
            CaminoFitnessRepository caminoFitnessRepository,
            ExerciseRepository exerciseRepository, LevelEntity principiante, LevelEntity intermedio, LevelEntity avanzado, LevelEntity pro) {

        CaminoFitnessEntity camino = caminoFitnessRepository.findByNameCFIgnoreCase("Hipertrofia")
                .orElseThrow(() -> new RuntimeException("No se encontró el camino Hipertrofia"));

        // NIVEL PRINCIPIANTE - XP Range: 25-45
        List<ExerciseEntity> ejerciciosPrincipiante = new ArrayList<>();

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Curl de bíceps con mancuernas",
                "De pie con mancuernas a los lados, flexiona los codos para levantar las pesas hacia los hombros sin mover la parte superior del brazo.",
                "Brazos",
                3,
                12,
                camino,
                principiante,
                "https://youtu.be/bicep-curl",
                30L, // Ejercicio básico, bueno para principiantes
                0d
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Press de hombros con mancuernas",
                "Sentado con mancuernas a nivel de los hombros, empújalas hacia arriba hasta extender los brazos completamente.",
                "Hombros",
                3,
                12,
                camino,
                principiante,
                "https://youtu.be/shoulder-press",
                35L, // Requiere más estabilidad y coordinación
                0d
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Press de banca con mancuernas",
                "Acostado en un banco plano con mancuernas a nivel del pecho, empújalas hacia arriba hasta extender los brazos.",
                "Pecho",
                3,
                10,
                camino,
                principiante,
                "https://youtu.be/db-bench-press",
                40L, // Mayor complejidad técnica
                0d
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Extensiones de tríceps con mancuerna",
                "De pie o sentado, sostén una mancuerna con ambas manos sobre la cabeza y baja doblando los codos.",
                "Brazos",
                3,
                12,
                camino,
                principiante,
                "https://youtu.be/tricep-extension",
                32L, // Ejercicio básico de aislamiento
                0d
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Peso muerto con mancuernas",
                "De pie con mancuernas frente a los muslos, flexiona las caderas manteniendo la espalda recta y baja las pesas.",
                "Espalda",
                3,
                12,
                camino,
                principiante,
                "https://youtu.be/db-deadlift",
                40L, // Requiere buena técnica y es un movimiento compuesto
                0d
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Elevaciones laterales",
                "De pie con mancuernas a los costados, eleva las pesas lateralmente hasta que los brazos estén paralelos al suelo.",
                "Hombros",
                3,
                15,
                camino,
                principiante,
                "https://youtu.be/lateral-raise",
                28L, // Ejercicio sencillo con volumen alto
                0d
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Sentadillas con mancuernas",
                "De pie con mancuernas a los costados, flexiona las rodillas y caderas como si te sentaras en una silla invisible.",
                "Cuádriceps, Glúteos",
                3,
                12,
                camino,
                principiante,
                "https://youtu.be/dumbbell-squat",
                38L, // Ejercicio compuesto con mayor demanda física
                0d
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Remo con mancuerna a una mano",
                "Con una rodilla y mano apoyadas en un banco, levanta la mancuerna con la mano libre en un movimiento de remo.",
                "Espalda media, Dorsales",
                3,
                12,
                camino,
                principiante,
                "https://youtu.be/one-arm-row",
                35L, // Requiere algo de estabilidad y técnica
                0d
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Zancadas con mancuernas",
                "De pie con mancuernas a los costados, da un paso adelante flexionando ambas rodillas hasta formar ángulos de 90 grados.",
                "Cuádriceps, Glúteos, Isquiotibiales",
                3,
                10,
                camino,
                principiante,
                "https://youtu.be/dumbbell-lunge",
                42L, // Mayor coordinación y equilibrio
                0d
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Aperturas con mancuernas",
                "Acostado en un banco plano con mancuernas extendidas sobre el pecho, bájalas abriendo los brazos en arco.",
                "Pecho, Pectorales",
                3,
                12,
                camino,
                principiante,
                "https://youtu.be/dumbbell-fly",
                33L, // Ejercicio de aislamiento con técnica moderada
                0d
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Elevaciones frontales",
                "De pie con mancuernas frente a los muslos, eleva una mancuerna a la vez hasta la altura del hombro.",
                "Hombros frontales",
                3,
                12,
                camino,
                principiante,
                "https://youtu.be/front-raise",
                25L, // Ejercicio sencillo de aislamiento
                0d
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Curl martillo",
                "Similar al curl de bíceps pero con las mancuernas en posición neutra (pulgar hacia arriba).",
                "Bíceps, Braquial",
                3,
                12,
                camino,
                principiante,
                "https://youtu.be/hammer-curl",
                27L, // Variación sencilla del curl de bíceps
                0d
        ));

        exerciseRepository.saveAll(ejerciciosPrincipiante);

        // NIVEL INTERMEDIO - XP Range: 50-85
        List<ExerciseEntity> ejerciciosIntermedio = new ArrayList<>();

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Press de banca inclinado",
                "Similar al press de banca pero en un banco inclinado para enfatizar la parte superior del pecho.",
                "Pecho",
                4,
                10,
                camino,
                intermedio,
                "https://youtu.be/incline-bench",
                65L, // Mayor complejidad que el press plano
                0d
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Curl de bíceps con barra",
                "De pie con una barra en agarre supino, flexiona los codos para levantar la barra hacia los hombros.",
                "Brazos",
                4,
                10,
                camino,
                intermedio,
                "https://youtu.be/barbell-curl",
                55L, // Requiere buena técnica y permite más peso
                0d
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Extensiones de tríceps en polea",
                "De espaldas a la polea alta, agarra la cuerda y extiende los brazos hacia abajo.",
                "Brazos",
                4,
                12,
                camino,
                intermedio,
                "https://youtu.be/tricep-pushdown",
                60L, // Buena técnica con máquina especializada
                0d
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Remo en máquina",
                "Sentado frente a la máquina, jala la barra hacia tu abdomen manteniendo la espalda recta.",
                "Espalda",
                4,
                10,
                camino,
                intermedio,
                "https://youtu.be/seated-row",
                58L, // Ejercicio compuesto con máquina
                0d
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Sentadillas Búlgaras",
                "Con un pie elevado en un banco detrás de ti, flexiona la rodilla del pie de apoyo hasta descender en posición de zancada.",
                "Piernas",
                3,
                10,
                camino,
                intermedio,
                "https://youtu.be/bulgarian-squat",
                75L, // Alta demanda de equilibrio y fuerza unilateral
                0d
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Face pulls",
                "Frente a la polea alta, jala la cuerda hacia tu rostro abriendo los codos lateralmente.",
                "Hombros",
                3,
                15,
                camino,
                intermedio,
                "https://youtu.be/face-pull",
                50L, // Técnica moderada con alta repetición
                0d
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Press militar con barra",
                "De pie con una barra al nivel de los hombros, empuja hacia arriba hasta extender completamente los brazos.",
                "Hombros, Tríceps",
                4,
                8,
                camino,
                intermedio,
                "https://youtu.be/military-press",
                70L, // Alta demanda técnica y de estabilidad
                0d
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Fondos en máquina asistida",
                "Apoyado en las barras paralelas, baja el cuerpo flexionando los codos y luego empuja hacia arriba.",
                "Pecho, Tríceps",
                3,
                10,
                camino,
                intermedio,
                "https://youtu.be/assisted-dips",
                65L, // Preparación para fondos completos
                0d
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Prensa de piernas",
                "Sentado en la máquina con pies en la plataforma, empuja alejando el peso y luego controla el regreso.",
                "Cuádriceps, Glúteos",
                4,
                12,
                camino,
                intermedio,
                "https://youtu.be/leg-press",
                62L, // Ejercicio compuesto con máquina
                0d
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Jalón al pecho con agarre cerrado",
                "Similar al jalón al pecho pero con las manos más juntas para enfatizar la parte baja de los dorsales.",
                "Dorsales, Bíceps",
                3,
                12,
                camino,
                intermedio,
                "https://youtu.be/close-grip-pulldown",
                72L, // Variación técnica de mayor dificultad
                0d
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Curl de bíceps en banco Scott",
                "Curl de bíceps con los brazos apoyados en el banco Scott para aislar el movimiento.",
                "Bíceps",
                3,
                10,
                camino,
                intermedio,
                "https://youtu.be/scott-curl",
                58L, // Aislamiento con técnica específica
                0d
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Extensión de cuádriceps en máquina",
                "Sentado en la máquina, extiende las piernas elevando el peso con la parte frontal de las piernas.",
                "Cuádriceps",
                3,
                12,
                camino,
                intermedio,
                "https://youtu.be/leg-extension",
                52L, // Ejercicio de aislamiento con máquina
                0d
        ));

        exerciseRepository.saveAll(ejerciciosIntermedio);

        // NIVEL AVANZADO - XP Range: 85-130
        List<ExerciseEntity> ejerciciosAvanzado = new ArrayList<>();

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Press de banca declinado",
                "Press de banca realizado en banco declinado para enfatizar la parte inferior del pecho.",
                "Pecho",
                4,
                8,
                camino,
                avanzado,
                "https://youtu.be/decline-bench",
                90L, // Variación avanzada del press de banca
                0d
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Curl predicador",
                "Curl de bíceps con los brazos apoyados en un banco predicador para aislar el movimiento.",
                "Brazos",
                4,
                10,
                camino,
                avanzado,
                "https://youtu.be/preacher-curl",
                85L, // Técnica avanzada de aislamiento
                0d
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Press francés con barra EZ",
                "Acostado, sostén una barra sobre tu frente con los codos flexionados y extiende los brazos.",
                "Brazos",
                4,
                10,
                camino,
                avanzado,
                "https://youtu.be/skull-crusher",
                95L, // Técnica avanzada con mayor riesgo
                0d
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Jalones al pecho",
                "Sentado frente a la polea alta, jala la barra hacia el pecho manteniendo la espalda recta.",
                "Espalda",
                4,
                8,
                camino,
                avanzado,
                "https://youtu.be/lat-pulldown",
                92L, // Técnica avanzada con alto volumen
                0d
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Sentadilla Hack",
                "Sentadilla realizada en la máquina Hack con el peso distribuido principalmente en los cuádriceps.",
                "Piernas",
                4,
                8,
                camino,
                avanzado,
                "https://youtu.be/hack-squat",
                105L, // Alta demanda física y técnica específica
                0d
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Vuelos con cables cruzados",
                "De pie entre dos poleas ajustadas a la altura del pecho, jala los cables frente a ti en un movimiento de abrazo.",
                "Pecho",
                3,
                12,
                camino,
                avanzado,
                "https://youtu.be/cable-fly",
                88L, // Técnica avanzada con control preciso
                0d
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Press de banca con parada",
                "Press de banca tradicional pero con una pausa de 2 segundos en el punto más bajo.",
                "Pecho, Tríceps, Fuerza",
                4,
                6,
                camino,
                avanzado,
                "https://youtu.be/pause-bench",
                115L, // Mayor dificultad por la pausa isométrica
                0d
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Remo Pendlay",
                "Remo con barra desde el suelo, manteniendo la espalda paralela al suelo durante todo el movimiento.",
                "Espalda media, Trapecios",
                4,
                8,
                camino,
                avanzado,
                "https://youtu.be/pendlay-row",
                110L, // Alta demanda técnica y de fuerza
                0d
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Zancadas caminando con barra",
                "Caminando con una barra en los hombros, realiza zancadas alternando las piernas.",
                "Cuádriceps, Glúteos, Core",
                3,
                10,
                camino,
                avanzado,
                "https://youtu.be/walking-lunge",
                120L, // Coordinación, equilibrio y fuerza avanzada
                0d
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Curl 21s",
                "Serie de curls dividida en tres partes: 7 repeticiones en la mitad inferior del movimiento, 7 en la mitad superior y 7 completas.",
                "Bíceps",
                3,
                21,
                camino,
                avanzado,
                "https://youtu.be/21s-curl",
                102L, // Alta fatiga muscular y técnica específica
                0d
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Pull-ups",
                "Dominadas con el cuerpo suspendido de una barra, jalando hasta que la barbilla supere la barra.",
                "Dorsales, Bíceps",
                4,
                8,
                camino,
                avanzado,
                "https://youtu.be/pull-ups",
                125L, // Alta demanda de fuerza relativa
                0d
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Press de hombros Arnold",
                "Press de hombros con rotación de las mancuernas desde una posición de supinación a pronación.",
                "Hombros, Deltoides, Tríceps",
                4,
                10,
                camino,
                avanzado,
                "https://youtu.be/arnold-press",
                98L, // Técnica avanzada con rotación compleja
                0d
        ));

        exerciseRepository.saveAll(ejerciciosAvanzado);

        // NIVEL PRO - XP Range: 130-200
        List<ExerciseEntity> ejerciciosPro = new ArrayList<>();

        ejerciciosPro.add(new ExerciseEntity(
                "Curl de concentración",
                "Sentado con el codo apoyado en el interior del muslo, realiza el curl con total concentración en el músculo.",
                "Brazos",
                4,
                8,
                camino,
                pro,
                "https://youtu.be/concentration-curl",
                130L, // Técnica profesional de aislamiento
                0d
        ));

        ejerciciosPro.add(new ExerciseEntity(
                "Press de banca con bandas",
                "Press de banca con bandas de resistencia agregadas para incrementar la tensión al final del movimiento.",
                "Pecho",
                4,
                6,
                camino,
                pro,
                "https://youtu.be/band-bench",
                160L, // Técnica avanzada con resistencia variable
                0d
        ));

        ejerciciosPro.add(new ExerciseEntity(
                "Extensión de tríceps overhead con cable",
                "De espaldas a la polea baja, flexiona el torso y extiende los brazos por encima de la cabeza.",
                "Brazos",
                4,
                10,
                camino,
                pro,
                "https://youtu.be/overhead-extension",
                135L, // Técnica profesional de aislamiento
                0d
        ));

        ejerciciosPro.add(new ExerciseEntity(
                "Pull-overs con mancuerna",
                "Acostado en un banco con una mancuerna sostenida sobre el pecho, baja la pesa detrás de la cabeza en arco.",
                "Espalda",
                4,
                8,
                camino,
                pro,
                "https://youtu.be/dumbbell-pullover",
                145L, // Alta demanda técnica y movilidad
                0d
        ));

        ejerciciosPro.add(new ExerciseEntity(
                "Prensa de piernas con pies altos",
                "En la máquina de prensa, coloca los pies en la parte alta de la plataforma para enfatizar glúteos e isquiotibiales.",
                "Piernas",
                4,
                12,
                camino,
                pro,
                "https://youtu.be/high-leg-press",
                140L, // Técnica especializada para enfoque muscular
                0d
        ));

        ejerciciosPro.add(new ExerciseEntity(
                "Dominadas con peso adicional",
                "Dominadas tradicionales con peso adicional sujeto al cuerpo para mayor resistencia.",
                "Espalda",
                4,
                6,
                camino,
                pro,
                "https://youtu.be/weighted-pullup",
                175L, // Alta demanda de fuerza con resistencia adicional
                0d
        ));

        ejerciciosPro.add(new ExerciseEntity(
                "Sentadilla frontal con barra",
                "Sentadilla con la barra apoyada en los hombros delanteros, manteniendo el torso más erguido.",
                "Cuádriceps, Core, Espalda baja",
                4,
                6,
                camino,
                pro,
                "https://youtu.be/front-squat",
                165L, // Técnica profesional de gran demanda
                0d
        ));

        ejerciciosPro.add(new ExerciseEntity(
                "Remo en T con barra",
                "Inclinado hacia adelante con barra entre las piernas, rema levantando la barra hasta el abdomen.",
                "Espalda media, Lumbares",
                4,
                8,
                camino,
                pro,
                "https://youtu.be/t-bar-row",
                150L, // Técnica especializada de alta demanda
                0d
        ));

        ejerciciosPro.add(new ExerciseEntity(
                "Press de banca con cadenas",
                "Press de banca con cadenas que añaden resistencia progresiva a medida que subes la barra.",
                "Pecho, Fuerza explosiva",
                5,
                5,
                camino,
                pro,
                "https://youtu.be/chain-bench",
                185L, // Técnica avanzada para fuerza explosiva
                0d
        ));

        ejerciciosPro.add(new ExerciseEntity(
                "Peso muerto rumano",
                "Con barra frente a los muslos, flexiona las caderas manteniendo las piernas casi extendidas.",
                "Isquiotibiales, Glúteos, Espalda baja",
                4,
                6,
                camino,
                pro,
                "https://youtu.be/romanian-deadlift",
                155L, // Alta demanda técnica con riesgo moderado
                0d
        ));

        ejerciciosPro.add(new ExerciseEntity(
                "Press de hombros con barra por detrás",
                "Press militar con la barra iniciando detrás del cuello, requiere gran movilidad en hombros.",
                "Hombros, Tríceps",
                4,
                8,
                camino,
                pro,
                "https://youtu.be/behind-neck-press",
                170L, // Técnica avanzada con alto requerimiento de movilidad
                0d
        ));

        ejerciciosPro.add(new ExerciseEntity(
                "Fondos en paralelas con peso",
                "Fondos en barras paralelas con peso adicional sujeto a la cintura.",
                "Pecho inferior, Tríceps, Hombros",
                4,
                6,
                camino,
                pro,
                "https://youtu.be/weighted-dips",
                190L, // Extrema demanda de fuerza y estabilidad
                0d
        ));

        exerciseRepository.saveAll(ejerciciosPro);
    }

    private void initEntrenamientoHibridoExercises(
            CaminoFitnessRepository caminoFitnessRepository,
            ExerciseRepository exerciseRepository,LevelEntity principiante,
            LevelEntity intermedio,
            LevelEntity avanzado,
            LevelEntity pro) {

        CaminoFitnessEntity camino = caminoFitnessRepository.findByNameCFIgnoreCase("Entrenamiento Hibrido")
                .orElseThrow(() -> new RuntimeException("No se encontró el camino EntrenamientoHibrido"));

        // NIVEL PRINCIPIANTE - XP Range: 25-50
        List<ExerciseEntity> ejerciciosPrincipiante = new ArrayList<>();

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Burpees modificados",
                "Desde posición de pie, agáchate, apoya las manos, extiende las piernas sin salto y regresa a la posición inicial.",
                "Piernas",
                3,
                10,
                camino,
                principiante,
                "https://youtu.be/modified-burpee",
                45L,  // Alta dificultad para nivel principiante
                0d
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Mountain climbers",
                "En posición de plancha, alterna llevando las rodillas hacia el pecho rápidamente.",
                "Abdominales",
                3,
                30,
                camino,
                principiante,
                "https://youtu.be/mountain-climber",
                40L,  // Medio-alta dificultad, requiere resistencia
                0d
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Swing con kettlebell",
                "Con una kettlebell entre las piernas, impulsa la pesa hacia adelante y arriba usando la fuerza de las caderas.",
                "Piernas",
                3,
                15,
                camino,
                principiante,
                "https://youtu.be/kb-swing",
                42L,  // Coordinación y técnica específica
                0d
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Remo con mancuerna y zancada",
                "Realiza una zancada y al estar abajo ejecuta un remo con la mancuerna del lado contrario a la pierna adelantada.",
                "Espalda",
                3,
                10,
                camino,
                principiante,
                "https://youtu.be/lunge-row",
                48L,  // Movimiento compuesto complejo
                0d
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Plancha con toque de hombro",
                "En posición de plancha, alterna tocando tu hombro contrario con la mano mientras mantienes la estabilidad.",
                "Abdominales",
                3,
                20,
                camino,
                principiante,
                "https://youtu.be/shoulder-tap",
                35L,  // Dificultad media, requiere estabilidad
                0d
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Saltos al cajón",
                "Frente a un cajón o plataforma estable, salta para subir y baja controladamente.",
                "Piernas",
                3,
                12,
                camino,
                principiante,
                "https://youtu.be/box-jump",
                47L,  // Pliométrico, requiere potencia y coordinación
                0d
        ));

        // Nuevos ejercicios para Principiante
        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Sentadilla con mancuerna",
                "Realiza una sentadilla sosteniendo una mancuerna frente al pecho con ambas manos.",
                "Piernas, Glúteos, Core",
                3,
                12,
                camino,
                principiante,
                "https://youtu.be/goblet-squat",
                38L,  // Básico con peso adicional
                0d
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Jumping jacks",
                "Salta abriendo piernas y brazos simultáneamente y vuelve a la posición inicial.",
                "Cardio, Full body",
                3,
                30,
                camino,
                principiante,
                "https://youtu.be/jumping-jacks",
                25L,  // Ejercicio básico de cardio
                0d
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Press de hombros con mancuernas",
                "Desde posición de pie, eleva las mancuernas por encima de la cabeza y vuelve a la posición inicial.",
                "Hombros, Brazos",
                3,
                12,
                camino,
                principiante,
                "https://youtu.be/shoulder-press",
                32L,  // Básico con pesos
                0d
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Sentadilla con salto suave",
                "Realiza una sentadilla y al subir haz un pequeño salto controlado.",
                "Piernas, Cardio",
                3,
                15,
                camino,
                principiante,
                "https://youtu.be/squat-jump-light",
                37L,  // Básico con componente explosivo
                0d
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Plancha baja",
                "Aguanta la posición de plancha apoyando los antebrazos en el suelo.",
                "Core, Estabilidad",
                3,
                30,
                camino,
                principiante,
                "https://youtu.be/forearm-plank",
                30L,  // Ejercicio isométrico básico
                0d
        ));

        ejerciciosPrincipiante.add(new ExerciseEntity(
                "Peso muerto con mancuernas",
                "Inclina el torso hacia adelante manteniendo la espalda recta mientras sostienes mancuernas que bajan cerca de las piernas.",
                "Espalda baja, Isquiotibiales, Glúteos",
                3,
                12,
                camino,
                principiante,
                "https://youtu.be/dumbbell-deadlift",
                43L,  // Técnica importante, riesgo de lesión
                0d
        ));

        exerciseRepository.saveAll(ejerciciosPrincipiante);

        // NIVEL INTERMEDIO - XP Range: 55-90
        List<ExerciseEntity> ejerciciosIntermedio = new ArrayList<>();

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Thrusters",
                "Combinación de sentadilla frontal y press de hombros en un solo movimiento fluido.",
                "Piernas",
                4,
                12,
                camino,
                intermedio,
                "https://youtu.be/thruster",
                80L,  // Movimiento complejo compuesto
                0d
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Clean and Press",
                "Levanta una kettlebell o mancuerna desde el suelo hasta el hombro y luego sobre la cabeza en un movimiento.",
                "Piernas",
                4,
                8,
                camino,
                intermedio,
                "https://youtu.be/clean-press",
                85L,  // Complejo, técnico, alta demanda energética
                0d
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Burpees con salto",
                "Burpee completo añadiendo un salto explosivo al final del movimiento.",
                "Piernas",
                3,
                15,
                camino,
                intermedio,
                "https://youtu.be/jump-burpee",
                75L,  // Alta intensidad y coordinación
                0d
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Wall ball",
                "Combinación de sentadilla y lanzamiento de balón medicinal contra una pared.",
                "Piernas",
                4,
                15,
                camino,
                intermedio,
                "https://youtu.be/wall-ball",
                70L,  // Coordinación y potencia
                0d
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Remo con kettlebell y rotación",
                "Realiza un remo con kettlebell y añade una rotación del torso al completar el movimiento.",
                "Espalda",
                3,
                10,
                camino,
                intermedio,
                "https://youtu.be/kb-row-twist",
                65L,  // Coordinación y control del core
                0d
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Battle ropes",
                "Con una cuerda pesada en cada mano, genera ondas potentes alternando los brazos.",
                "Hombros",
                4,
                30,
                camino,
                intermedio,
                "https://youtu.be/battle-ropes",
                78L,  // Alta intensidad, resistencia y fuerza
                0d
        ));

        // Nuevos ejercicios para Intermedio
        ejerciciosIntermedio.add(new ExerciseEntity(
                "Pull-ups con agarre mixto",
                "Dominadas con un agarre en pronación y otro en supinación para trabajar diferentes partes de la espalda.",
                "Espalda, Brazos",
                3,
                8,
                camino,
                intermedio,
                "https://youtu.be/mixed-grip-pullup",
                82L,  // Alta dificultad, requiere fuerza considerable
                0d
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Farmer's walk",
                "Camina una distancia predeterminada sosteniendo pesos pesados en ambas manos.",
                "Full body, Agarre, Core",
                3,
                40,
                camino,
                intermedio,
                "https://youtu.be/farmers-walk",
                60L,  // Simple pero demandante
                0d
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Kettlebell snatch",
                "Levanta una kettlebell desde el suelo hasta arriba de la cabeza en un movimiento fluido y explosivo.",
                "Piernas, Hombros, Core",
                4,
                10,
                camino,
                intermedio,
                "https://youtu.be/kb-snatch",
                88L,  // Técnico y explosivo
                0d
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Jump squat con rotación",
                "Realiza una sentadilla con salto añadiendo una rotación de 180 grados en el aire.",
                "Piernas, Core, Coordinación",
                3,
                12,
                camino,
                intermedio,
                "https://youtu.be/rotating-jump-squat",
                77L,  // Pliométrico con coordinación compleja
                0d
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Dips en paralelas",
                "Fondos en barras paralelas para trabajar tríceps y pecho.",
                "Tríceps, Pecho, Hombros",
                3,
                10,
                camino,
                intermedio,
                "https://youtu.be/parallel-dips",
                68L,  // Requiere fuerza específica
                0d
        ));

        ejerciciosIntermedio.add(new ExerciseEntity(
                "Overhead walking lunge",
                "Zancadas caminando mientras sostienes una pesa por encima de la cabeza.",
                "Piernas, Core, Estabilidad",
                3,
                16,
                camino,
                intermedio,
                "https://youtu.be/overhead-lunge",
                72L,  // Equilibrio, estabilidad y fuerza
                0d
        ));

        exerciseRepository.saveAll(ejerciciosIntermedio);

        // NIVEL AVANZADO - XP Range: 95-140
        List<ExerciseEntity> ejerciciosAvanzado = new ArrayList<>();

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Devil press",
                "Combinación de burpee y snatch con mancuernas, levantando ambas mancuernas desde el suelo hasta arriba de la cabeza.",
                "Piernas",
                4,
                10,
                camino,
                avanzado,
                "https://youtu.be/devil-press",
                135L,  // Muy técnico y demandante
                0d
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Double kettlebell complex",
                "Serie de movimientos encadenados con dos kettlebells: clean, squat, press, sin descanso entre ellos.",
                "Piernas",
                3,
                5,
                camino,
                avanzado,
                "https://youtu.be/kb-complex",
                140L,  // Secuencia compleja, alta demanda técnica
                0d
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Box jump burpee",
                "Realizar un burpee completo seguido inmediatamente de un salto al cajón.",
                "Piernas",
                4,
                8,
                camino,
                avanzado,
                "https://youtu.be/box-jump-burpee",
                125L,  // Alta intensidad, demanda cardiovascular
                0d
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Man makers",
                "Desde posición de plancha con mancuernas, hacer un push-up, remo con cada brazo, ponerse de pie y hacer un thruster.",
                "Piernas",
                3,
                8,
                camino,
                avanzado,
                "https://youtu.be/man-makers",
                132L,  // Secuencia larga y compleja
                0d
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Muscle ups",
                "Dominada explosiva que termina con una transición a fondos sobre la barra.",
                "Espalda",
                3,
                5,
                camino,
                avanzado,
                "https://youtu.be/muscle-up",
                138L,  // Alta dificultad técnica, requiere fuerza significativa
                0d
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Sandbag clean and press",
                "Levantamiento de saco de arena desde el suelo hasta por encima de la cabeza.",
                "Piernas",
                4,
                6,
                camino,
                avanzado,
                "https://youtu.be/sandbag-clean",
                120L,  // Peso inestable, alta demanda
                0d
        ));

        // Nuevos ejercicios para Avanzado
        ejerciciosAvanzado.add(new ExerciseEntity(
                "Pistol squat con kettlebell",
                "Sentadilla a una pierna sosteniendo una kettlebell frente al pecho.",
                "Piernas, Core, Equilibrio",
                3,
                6,
                camino,
                avanzado,
                "https://youtu.be/kb-pistol-squat",
                130L,  // Equilibrio unilateral y fuerza
                0d
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Toes to bar",
                "Colgado de una barra, lleva los pies a tocar la barra mediante una flexión de cadera.",
                "Core, Brazos",
                4,
                10,
                camino,
                avanzado,
                "https://youtu.be/toes-to-bar",
                115L,  // Requiere fuerza en core y agarre
                0d
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Bar muscle up",
                "Transición explosiva de una dominada a un fondo sobre la barra.",
                "Full body, Potencia",
                3,
                5,
                camino,
                avanzado,
                "https://youtu.be/bar-muscle-up",
                137L,  // Similar a muscle ups, alta dificultad
                0d
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Handstand walk",
                "Caminar en posición de pino utilizando solo las manos como apoyo.",
                "Hombros, Core, Equilibrio",
                3,
                10,
                camino,
                avanzado,
                "https://youtu.be/handstand-walk",
                128L,  // Equilibrio invertido y coordinación
                0d
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Clean and jerk",
                "Levantar una barra desde el suelo hasta los hombros y luego impulsarla sobre la cabeza con un split.",
                "Full body, Potencia",
                4,
                5,
                camino,
                avanzado,
                "https://youtu.be/clean-jerk",
                136L,  // Levantamiento olímpico, alta técnica
                0d
        ));

        ejerciciosAvanzado.add(new ExerciseEntity(
                "Ring dips con L-sit",
                "Fondos en anillas manteniendo las piernas extendidas horizontalmente frente a ti.",
                "Pecho, Tríceps, Core",
                3,
                8,
                camino,
                avanzado,
                "https://youtu.be/l-sit-dips",
                126L,  // Estabilización en anillas más posición L
                0d
        ));

        exerciseRepository.saveAll(ejerciciosAvanzado);

        // NIVEL PRO - XP Range: 145-200
        List<ExerciseEntity> ejerciciosPro = new ArrayList<>();

        ejerciciosPro.add(new ExerciseEntity(
                "Handstand push ups",
                "Flexiones de brazos en posición invertida, apoyado contra una pared.",
                "Hombros",
                4,
                6,
                camino,
                pro,
                "https://youtu.be/hspu",
                165L,  // Alta demanda de fuerza en hombros
                0d
        ));

        ejerciciosPro.add(new ExerciseEntity(
                "Muscle up a anillas",
                "Similar al muscle up pero en anillas, requiriendo mayor estabilidad y control.",
                "Piernas",
                3,
                5,
                camino,
                pro,
                "https://youtu.be/ring-muscle-up",
                180L,  // Versión más compleja del muscle up
                0d
        ));

        ejerciciosPro.add(new ExerciseEntity(
                "Snatch",
                "Movimiento olímpico que consiste en llevar la barra desde el suelo hasta encima de la cabeza en un solo movimiento.",
                "Piernas",
                5,
                3,
                camino,
                pro,
                "https://youtu.be/snatch",
                190L,  // Movimiento olímpico, máxima complejidad
                0d
        ));

        ejerciciosPro.add(new ExerciseEntity(
                "Turkish get-up",
                "Levantarse del suelo a posición de pie mientras se sostiene una pesa sobre la cabeza.",
                "Piernas",
                3,
                5,
                camino,
                pro,
                "https://youtu.be/tgu",
                170L,  // Secuencia larga, técnica, estabilidad
                0d
        ));

        ejerciciosPro.add(new ExerciseEntity(
                "Pistol squat",
                "Sentadilla a una pierna manteniendo la otra extendida frente a ti.",
                "Piernas",
                3,
                8,
                camino,
                pro,
                "https://youtu.be/pistol-squat",
                155L,  // Equilibrio unilateral, fuerza
                0d
        ));

        ejerciciosPro.add(new ExerciseEntity(
                "Climbing rope",
                "Escalar una cuerda usando principalmente la fuerza de brazos y técnica de piernas.",
                "Espalda",
                3,
                3,
                camino,
                pro,
                "https://youtu.be/rope-climb",
                175L,  // Requiere fuerza en brazos y agarre
                0d
        ));

        // Nuevos ejercicios para Pro
        ejerciciosPro.add(new ExerciseEntity(
                "Handstand push ups sin apoyo",
                "Flexiones de brazos en posición invertida sin apoyo en la pared.",
                "Hombros, Core, Equilibrio",
                3,
                5,
                camino,
                pro,
                "https://youtu.be/freestanding-hspu",
                195L,  // Máxima dificultad, control total
                0d
        ));

        ejerciciosPro.add(new ExerciseEntity(
                "Pegboard ascent",
                "Escalar un tablero perforado usando clavijas que se insertan en los agujeros.",
                "Brazos, Espalda, Coordinación",
                3,
                4,
                camino,
                pro,
                "https://youtu.be/pegboard",
                185L,  // Fuerza específica y coordinación
                0d
        ));

        ejerciciosPro.add(new ExerciseEntity(
                "Ring Iron Cross",
                "Sostener el cuerpo suspendido en anillas con los brazos extendidos horizontalmente.",
                "Hombros, Pecho, Core",
                3,
                3,
                camino,
                pro,
                "https://youtu.be/iron-cross",
                200L,  // Ejercicio de gimnasia avanzado
                0d
        ));

        ejerciciosPro.add(new ExerciseEntity(
                "Legless rope climb",
                "Escalar una cuerda usando únicamente la fuerza de los brazos sin ayuda de las piernas.",
                "Brazos, Espalda, Agarre",
                3,
                2,
                camino,
                pro,
                "https://youtu.be/legless-rope",
                190L,  // Máxima demanda en brazos y agarre
                0d
        ));

        ejerciciosPro.add(new ExerciseEntity(
                "Back lever",
                "Sostener el cuerpo horizontal boca abajo suspendido de una barra o anillas.",
                "Full body, Core",
                3,
                10,
                camino,
                pro,
                "https://youtu.be/back-lever",
                160L,// Posición isométrica avanzada
                0d
        ));

        ejerciciosPro.add(new ExerciseEntity(
                "One arm pull-up",
                "Dominada completa usando solamente un brazo.",
                "Espalda, Brazos, Core",
                3,
                3,
                camino,
                pro,
                "https://youtu.be/one-arm-pullup",
                198L,  // Fuerza extrema en un solo brazo
                0d
        ));

        exerciseRepository.saveAll(ejerciciosPro);
    }
}