package com.TrainX.TrainX.jwt.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class UserNotFoundException extends RuntimeException {

    public UserNotFoundException(String identifier) {
        super("Usuario no encontrado: " + identifier);
    }

    public UserNotFoundException(Long id) {
        super("Usuario no encontrado con id: " + id);
    }
}

