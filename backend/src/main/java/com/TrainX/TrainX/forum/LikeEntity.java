package com.TrainX.TrainX.forum;

import com.TrainX.TrainX.User.UserEntity;
import jakarta.persistence.*;
import lombok.*;


@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class LikeEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private UserEntity user;

    @ManyToOne
    private PostEntity post;

    @ManyToOne
    private CommentEntity comment;
}
