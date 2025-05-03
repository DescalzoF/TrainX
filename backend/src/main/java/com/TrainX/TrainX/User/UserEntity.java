package com.TrainX.TrainX.User;

import com.TrainX.TrainX.caminoFitness.CaminoFitnessEntity;
import com.TrainX.TrainX.level.LevelEntity;
import com.TrainX.TrainX.session.SessionEntity;
import com.TrainX.TrainX.xpFitness.XpFitnessEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_level")
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "camino_fitness_id", referencedColumnName = "idCF")
    private CaminoFitnessEntity caminoFitnessActual;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private XpFitnessEntity xpFitnessEntity;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SessionEntity> sessions = new ArrayList<>();

    public UserEntity(String username,
                      String name,
                      String email,
                      String surname,
                      String password,
                      String age,
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
        this.age = age;
        this.phoneNumber = phoneNumber;
        this.height = height;
        this.weight = weight;
        this.userPhoto = userPhoto;
        this.sex = sex;
        this.address = address;
        this.coins = coins != null ? coins : 0L;
        this.isPublic = isPublic;
        this.role = role != null ? role : Role.USER;
    }

    public void addSession(SessionEntity session) {
        sessions.add(session);
        session.setUser(this);
    }

    public void removeSession(SessionEntity session) {
        sessions.remove(session);
        session.setUser(null);
    }

    public void setXpFitnessEntity(XpFitnessEntity xpFitnessEntity) {
        this.xpFitnessEntity = xpFitnessEntity;
        if (xpFitnessEntity != null && xpFitnessEntity.getUser() != this) {
            xpFitnessEntity.setUser(this);
        }
    }

    @PrePersist
    private void ensureXpFitness() {
        if (this.xpFitnessEntity == null) {
            setXpFitnessEntity(new XpFitnessEntity(this));
        }
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
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