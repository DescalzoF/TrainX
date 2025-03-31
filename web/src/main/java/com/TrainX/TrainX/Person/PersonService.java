package com.TrainX.TrainX.Person;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PersonService {
    @Autowired
    PersonRepository personRepository;


    public List<PersonEntity> listPerson() {
        return personRepository.findAll();
    }

    public PersonEntity createPerson(PersonEntity person) {
        return personRepository.save(person);
    }
}
