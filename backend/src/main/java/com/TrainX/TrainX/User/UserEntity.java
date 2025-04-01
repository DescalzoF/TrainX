package com.TrainX.TrainX.User;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Entity
@Table(name="users")
public class UserEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private String surname;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String age;

    @Column(nullable = false)
    private String phoneNumber;

    @Column(nullable = false)
    private Long height ;

    @Column(nullable = false)
    private Long weight;

    @Column(nullable = false)
    private String userPhoto;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private Long coins;

    @Column(nullable = false)
    private Long xpFitness;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String sex;



    public UserEntity() {}

    public UserEntity(
            String name,
            String email,
            String surname,
            String password,
            String age,
            String phoneNumber,
            Long height,
            Long weight,
            Long xpFitness,
            String userPhoto,
            String sex
      ) {
        this.username = name;
        this.email = email;
        this.surname = surname;
        this.password = password;
        this.age = age;
        this.phoneNumber = phoneNumber;
        this.height = height;
        this.weight = weight;
        this.userPhoto = userPhoto;
        this.sex=sex;
        this.xpFitness=xpFitness;

    }

}
