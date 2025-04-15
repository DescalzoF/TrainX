package com.TrainX.TrainX.jwt.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
public class ForgotPasswordDto {
    String username;
    String email;
}
