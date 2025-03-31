package com.TrainX.TrainX.Person;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@Setter
@Getter
@Entity
public class PersonEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;

    @Column(nullable = false)
    private String name;

    @Column
    private String email;

    public PersonEntity() {}

    public PersonEntity(String name, String email) {
        this.name = name;
        this.email = email;
    }

}
