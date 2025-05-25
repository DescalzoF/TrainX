package com.TrainX.TrainX.forum;

public enum ForumCategory {
    ANNOUNCEMENTS("Anuncios"),
    CAMINO_FUERZA("Camino Fuerza"),
    CAMINO_HIBRIDO("Camino Híbrido"),
    CAMINO_DEPORTISTA("Camino Deportista"),
    CAMINO_HIPERTROFIA("Camino Hipertrofia"),
    CUSTOM_CAMINOS("Caminos Personalizados"),
    GENERAL("General"),
    FITNESS("Fitness"),
    NUTRITION("Nutrición"),
    TRAINING("Entrenamiento"),
    MOTIVATION("Motivación"),
    EQUIPMENT("Equipamiento"),
    QUESTIONS("Preguntas"),
    SUCCESS_STORIES("Historias de Éxito");

    private final String displayName;

    ForumCategory(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}