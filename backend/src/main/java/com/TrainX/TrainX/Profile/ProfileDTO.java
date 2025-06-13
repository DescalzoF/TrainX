package com.TrainX.TrainX.Profile;

import com.TrainX.TrainX.User.Role;

import java.io.Serializable;
import java.time.LocalDate;

public class ProfileDTO implements Serializable {

    private Long id;
    private String username;
    private String surname;
    private String email;
    private Long weight;
    private Long height;
    private String address;
    private String phoneNumber;
    private LocalDate dateOfBirth;
    private String sex;
    private String userPhoto;
    private Boolean isPublic;
    private Role role;
    private Long coins;
    private Long caminoFitnessId;

    public ProfileDTO() {
    }

    // Getters
    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getSurname() {
        return surname;
    }

    public String getEmail() {
        return email;
    }

    public Long getWeight() {
        return weight;
    }

    public Long getHeight() {
        return height;
    }

    public String getAddress() {
        return address;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public String getSex() {
        return sex;
    }

    public String getUserPhoto() {
        return userPhoto;
    }

    public Boolean getIsPublic() {
        return isPublic;
    }

    public Role getRole() {
        return role;
    }

    public Long getCoins() {
        return coins;
    }

    // Setters
    public void setId(Long id) {
        this.id = id;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setSurname(String surname) {
        this.surname = surname;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setWeight(Long weight) {
        this.weight = weight;
    }

    public void setHeight(Long height) {
        this.height = height;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public void setSex(String sex) {
        this.sex = sex;
    }

    public void setUserPhoto(String userPhoto) {
        this.userPhoto = userPhoto;
    }

    public void setIsPublic(Boolean isPublic) {
        this.isPublic = isPublic;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public void setCoins(Long coins) {
        this.coins = coins;
    }


    // Getter and setter for caminoFitnessId in ProfileDTO.java
    public Long getCaminoFitnessId() {
        return caminoFitnessId;
    }
    public void setCaminoFitnessId(Long caminoFitnessId) {
        this.caminoFitnessId = caminoFitnessId;
    }
}