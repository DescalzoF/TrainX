package com.TrainX.TrainX.Person;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController

public class PersonController{
    @Autowired
    PersonService personService;

 @PostMapping("/person")
 @ResponseBody
 public PersonEntity addPerson(@RequestBody PersonEntity person){
     return personService.createPerson(person);
 }

 @GetMapping("/person")
 public List<PersonEntity> getAllUsers(){
     return personService.listPerson();
 }
}
