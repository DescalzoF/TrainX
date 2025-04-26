package com.TrainX.TrainX.jwt.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Excepción lanzada cuando se intenta registrar un email ya en uso.
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class EmailAlreadyUsedException extends RuntimeException {

    public EmailAlreadyUsedException(String email) {
        super("El email ya está en uso: " + email);
    }
}