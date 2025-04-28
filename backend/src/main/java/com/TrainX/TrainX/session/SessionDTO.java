package com.TrainX.TrainX.session;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SessionDTO {
    private Long id;
    private String sessionType;
    private List<SessionExerciseDTO> exercises;
}