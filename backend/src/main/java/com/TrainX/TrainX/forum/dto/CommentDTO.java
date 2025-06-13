package com.TrainX.TrainX.forum.dto;

import lombok.Data;

@Data
public class CommentDTO {
    private Long id;
    private String content;
    private String createdAt;
    private String authorName;
    private String authorUsername;
    private String authorPhoto;
    private Long postId;
    private Long parentId;
    private Long likes;
}