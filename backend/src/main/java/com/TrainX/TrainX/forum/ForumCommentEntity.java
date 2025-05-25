package com.TrainX.TrainX.forum;

import com.TrainX.TrainX.User.UserEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "forum_comments")
@Data
@NoArgsConstructor
public class ForumCommentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private UserEntity author;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private ForumPostEntity post;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private Integer likes = 0;

    @Column(nullable = false)
    private Boolean isActive = true;

    public ForumCommentEntity(String content, UserEntity author, ForumPostEntity post) {
        this.content = content;
        this.author = author;
        this.post = post;
    }
}