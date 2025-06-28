package com.TrainX.TrainX.User;

import com.TrainX.TrainX.caminoFitness.CaminoFitnessEntity;
import com.TrainX.TrainX.desafioSemanal.DesafioCompletion;
import com.TrainX.TrainX.desafioSemanal.DesafioSemanal;
import com.TrainX.TrainX.level.LevelEntity;
import com.TrainX.TrainX.xpFitness.XpFitnessEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
public class UserEntity implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String surname;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private LocalDate dateOfBirth;

    @Column(nullable = false)
    private String phoneNumber;

    @Column(nullable = false)
    private Long height;

    @Column(nullable = false)
    private Long weight;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private Long coins = 0L;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "level_id")
    private LevelEntity level;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String sex;

    @Column(nullable = false)
    private Boolean isPublic;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.USER;

    @Column(nullable = false, length = 500000)
    private String userPhoto;
    // En UserEntity.java, agregar estos campos:
    @Column(name = "is_verified")
    private Boolean isVerified = false;

    @Column(name = "verification_token")
    private String verificationToken;

    @Column(name = "verification_token_expires")
    private LocalDateTime verificationTokenExpires;

    @Column(name = "password_reset_token")
    private String passwordResetToken;

    @Column(name = "password_reset_token_expires")
    private LocalDateTime passwordResetTokenExpires;

// Getters y setters correspondientes

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "camino_fitness_id", referencedColumnName = "idCF")
    private CaminoFitnessEntity caminoFitnessActual;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private XpFitnessEntity xpFitnessEntity;


    @ManyToMany
    @JoinTable(
            name = "user_desafios",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "desafio_id")
    )
    private Set<DesafioSemanal> desafiosCompletados = new HashSet<>();

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL)
    private Set<DesafioCompletion> historialDesafios = new HashSet<>();

    public UserEntity(String username,
                      String name,
                      String email,
                      String surname,
                      String password,
                      LocalDate dateOfBirth,
                      String phoneNumber,
                      Long height,
                      Long weight,
                      String userPhoto,
                      String sex,
                      String address,
                      Boolean isPublic,
                      Long coins,
                      Role role) {
        this.username = username;
        this.name = name;
        this.email = email;
        this.surname = surname;
        this.password = password;
        this.dateOfBirth = dateOfBirth;
        this.phoneNumber = phoneNumber;
        this.height = height;
        this.weight = weight;
        this.userPhoto = "";
        this.sex = sex;
        this.address = address;
        this.coins = coins != null ? coins : 0L;
        this.isPublic = isPublic;
        this.role = role != null ? role : Role.USER;
    }

    public void setXpFitnessEntity(XpFitnessEntity xpFitnessEntity) {
        this.xpFitnessEntity = xpFitnessEntity;
        if (xpFitnessEntity != null && xpFitnessEntity.getUser() != this) {
            xpFitnessEntity.setUser(this);
        }
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role.name());
        return Collections.singletonList(authority);
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}