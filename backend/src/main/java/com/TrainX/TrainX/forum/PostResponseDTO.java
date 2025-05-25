package com.TrainX.TrainX.forum;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
class PostResponseDTO {
    private Long id;
    private String title;
    private String content;
    private String authorUsername;
    private String authorName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer likes;
    private ForumCategory category;
    private Integer commentCount;

    public PostResponseDTO() {
    }

    public PostResponseDTO(ForumPostEntity post) {
        this.id = post.getId();
        this.title = post.getTitle();
        this.content = post.getContent();
        this.authorUsername = post.getAuthor().getUsername();
        this.authorName = post.getAuthor().getName() + " " + post.getAuthor().getSurname();
        this.createdAt = post.getCreatedAt();
        this.updatedAt = post.getUpdatedAt();
        this.likes = post.getLikes();
        this.category = post.getCategory();
        this.commentCount = post.getComments().size();
    }
}
