package com.TrainX.TrainX.jwt.dtos;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Setter
@Getter
public class RegisterUserDto {
    private String username;
    private String name;
    private String surname;
    private String password;
    private String email;
    private LocalDate dateOfBirth;
    private String phoneNumber;
    private String address;
    private Long weight;
    private Long height;
    private String sex;
    private Boolean isPublic;

}
