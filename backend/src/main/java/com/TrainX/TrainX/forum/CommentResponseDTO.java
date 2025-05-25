package com.TrainX.TrainX.forum;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
class CommentResponseDTO {
    private Long id;
    private String content;
    private String authorUsername;
    private String authorName;
    private LocalDateTime createdAt;
    private Integer likes;

    public CommentResponseDTO() {}

    public CommentResponseDTO(ForumCommentEntity comment) {
        this.id = comment.getId();
        this.content = comment.getContent();
        this.authorUsername = comment.getAuthor().getUsername();
        this.authorName = comment.getAuthor().getName() + " " + comment.getAuthor().getSurname();
        this.createdAt = comment.getCreatedAt();
        this.likes = comment.getLikes();
    }
    }
