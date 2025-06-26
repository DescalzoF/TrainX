package com.TrainX.TrainX.auth;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class AuthResponse {
    private String token;
    private String username;
    private String message;
}
