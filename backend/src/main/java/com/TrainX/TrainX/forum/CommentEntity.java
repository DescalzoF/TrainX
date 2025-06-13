package com.TrainX.TrainX.forum;

import com.TrainX.TrainX.User.UserEntity;
import com.TrainX.TrainX.forum.PostEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CommentEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(length = 1000)
    private String content;
    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne
    private UserEntity author;

    @ManyToOne
    private PostEntity post;

    @ManyToOne
    private CommentEntity parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL)
    private List<CommentEntity> replies;
}
