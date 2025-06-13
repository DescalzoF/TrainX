package com.TrainX.TrainX.forum.dto;

import lombok.Data;

// In PostDTO.java
@Data
public class PostDTO {
    private Long id;
    private String title;
    private String content;
    private String createdAt;
    private String authorName;
    private String authorUsername;
    private String authorPhoto;
    private String category;
    private Long likes;
    private Long commentCount;
}

