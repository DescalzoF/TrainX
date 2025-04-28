package com.TrainX.TrainX.User;

import com.TrainX.TrainX.caminoFitness.CaminoFitnessEntity;
import com.TrainX.TrainX.level.LevelEntity;
import com.TrainX.TrainX.session.SessionEntity;
import com.TrainX.TrainX.xpFitness.XpFitnessEntity;
import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
public class UserEntity implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
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

    // One-to-One relation with XP Fitness (inverse side)
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private XpFitnessEntity xpFitnessEntity;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SessionEntity> sessions = new ArrayList<>();

    // Constructors
    public UserEntity() {
        // Default constructor for JPA
    }

    public UserEntity(String username,
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

    public List<SessionEntity> getSessions() {
        return sessions;
    }

    public void setSessions(List<SessionEntity> sessions) {
        this.sessions = sessions;
    }

    public void addSession(SessionEntity session) {
        sessions.add(session);
        session.setUser(this);
    }

    public void removeSession(SessionEntity session) {
        sessions.remove(session);
        session.setUser(null);
    }

    // Getters y setters omitidos para brevedad (mantener todos los originales)

    public void setXpFitnessEntity(XpFitnessEntity xpFitnessEntity) {
        this.xpFitnessEntity = xpFitnessEntity;
        if (xpFitnessEntity != null && xpFitnessEntity.getUser() != this) {
            xpFitnessEntity.setUser(this);
        }
    }

    // Optional: Método para inicializar XP antes de persistir
    @PrePersist
    private void ensureXpFitness() {
        if (this.xpFitnessEntity == null) {
            setXpFitnessEntity(new XpFitnessEntity(this));
        }
    }


    // Standard getters and setters
    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getSurname() {
        return surname;
    }

    public void setSurname(String surname) {
        this.surname = surname;
    }

    @Override
    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getAge() {
        return age;
    }

    public void setAge(String age) {
        this.age = age;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public Long getHeight() {
        return height;
    }

    public void setHeight(Long height) {
        this.height = height;
    }

    public Long getWeight() {
        return weight;
    }

    public void setWeight(Long weight) {
        this.weight = weight;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Long getCoins() {
        return coins;
    }

    public void setCoins(Long coins) {
        this.coins = coins;
    }

    public LevelEntity getLevel() {
        return level;
    }

    public void setLevel(LevelEntity level) {
        this.level = level;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSex() {
        return sex;
    }

    public void setSex(String sex) {
        this.sex = sex;
    }

    public Boolean getIsPublic() {
        return isPublic;
    }

    public void setIsPublic(Boolean isPublic) {
        this.isPublic = isPublic;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getUserPhoto() {
        return userPhoto;
    }

    public void setUserPhoto(String userPhoto) {
        this.userPhoto = userPhoto;
    }

    public CaminoFitnessEntity getCaminoFitnessActual() {
        return caminoFitnessActual;
    }

    public void setCaminoFitnessActual(CaminoFitnessEntity caminoFitnessActual) {
        this.caminoFitnessActual = caminoFitnessActual;
    }

    public XpFitnessEntity getXpFitnessEntity() {
        return xpFitnessEntity;
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