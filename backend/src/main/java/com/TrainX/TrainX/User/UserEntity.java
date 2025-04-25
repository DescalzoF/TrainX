package com.TrainX.TrainX.User;

import com.TrainX.TrainX.caminoFitness.CaminoFitnessEntity;
import com.TrainX.TrainX.level.LevelEntity;
import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;


@Entity
@Table(name="users")
public class UserEntity implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

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
    private Long height;

    @Column(nullable = false)
    private Long weight;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private Long coins;

    @Column(nullable = false)
    private Long xpFitness = 0L;

    @ManyToOne
    @JoinColumn(name = "id_level")
    private LevelEntity level;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String sex;

    @Column(nullable = false)
    private Boolean isPublic;

    @Column (nullable = false)
    @Enumerated(EnumType.STRING)
    private Role role = Role.USER;

    @Column(nullable = false, length = 500000)
    private String userPhoto;

    @ManyToOne
    @JoinColumn(name = "camino_fitness_id", referencedColumnName = "idCF")
    private CaminoFitnessEntity caminoFitnessActual;



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
            String sex,
            String address,
            Boolean isPublic,
            Long coins,
            Role role
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
        this.sex = sex;
        this.xpFitness = xpFitness != null ? xpFitness : 0L;
        this.address = address;
        this.coins = coins != null ? coins : 0L;
        this.isPublic = isPublic;
        this.role = role;
        this.caminoFitnessActual = null;
        // Level will be set after user creation

    }

    // Getters
    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return UserDetails.super.isAccountNonExpired();
    }

    @Override
    public boolean isAccountNonLocked() {
        return UserDetails.super.isAccountNonLocked();
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return UserDetails.super.isCredentialsNonExpired();
    }

    @Override
    public boolean isEnabled() {
        return UserDetails.super.isEnabled();
    }

    public String getSurname() {
        return surname;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    public String getPassword() {
        return password;
    }

    public String getAge() {
        return age;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public Long getHeight() {
        return height;
    }

    public Long getWeight() {
        return weight;
    }

    public String getUserPhoto() {
        return userPhoto;
    }

    public String getAddress() {
        return address;
    }

    public Long getCoins() {
        return coins;
    }

    public Long getXpFitness() {
        return xpFitness;
    }

    public String getEmail() {
        return email;
    }

    public String getSex() {
        return sex;
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

    public void setPassword(String password) {
        this.password = password;
    }

    public void setAge(String age) {
        this.age = age;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public void setHeight(Long height) {
        this.height = height;
    }

    public void setWeight(Long weight) {
        this.weight = weight;
    }

    public void setUserPhoto(String userPhoto) {
        this.userPhoto = userPhoto;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public void setCoins(Long coins) {
        this.coins = coins;
    }

    public void setXpFitness(Long xpFitness) {
        this.xpFitness = xpFitness;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setSex(String sex) {
        this.sex = sex;
    }

    public void setIsPublic(boolean b) {
        this.isPublic = b;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public boolean getIsPublic() {
        return this.isPublic;
    }

    public Role getRole() {
        return this.role;
    }

    public CaminoFitnessEntity getCaminoFitnessActual() {
        return caminoFitnessActual;
    }

    public void setCaminoFitnessActual(CaminoFitnessEntity caminoFitnessActual) {
        this.caminoFitnessActual = caminoFitnessActual;
    }
    public LevelEntity getLevel() {
        return level;
    }

    public void setLevel(LevelEntity level) {
        this.level = level;
    }
}