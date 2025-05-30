package com.TrainX.TrainX.jwt.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
public class LoginResponse {
    private String token;
    private Long expiresIn;
    private String username;
    private Long id;
}