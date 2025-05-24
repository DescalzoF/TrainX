package com.TrainX.TrainX.progress;

import com.TrainX.TrainX.User.UserEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "progress")
public class ProgressEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "photo_one" , length = 500000)
    private String photoOne;

    @Column(name = "photo_two" , length = 500000)
    private String photoTwo;

    @Column(name = "photo_three" , length = 500000)
    private String photoThree;

    @Column(name = "photo_four" , length = 500000)
    private String photoFour;

    @Column(name = "photo_five" , length = 500000)
    private String photoFive;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private UserEntity user;

    // Getters y setters

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPhotoOne() { return photoOne; }
    public void setPhotoOne(String photoOne) { this.photoOne = photoOne; }

    public String getPhotoTwo() { return photoTwo; }
    public void setPhotoTwo(String photoTwo) { this.photoTwo = photoTwo; }

    public String getPhotoThree() { return photoThree; }
    public void setPhotoThree(String photoThree) { this.photoThree = photoThree; }

    public String getPhotoFour() { return photoFour; }
    public void setPhotoFour(String photoFour) { this.photoFour = photoFour; }

    public String getPhotoFive() { return photoFive; }
    public void setPhotoFive(String photoFive) { this.photoFive = photoFive; }

    public UserEntity getUser() { return user; }
    public void setUser(UserEntity user) { this.user = user; }
}

