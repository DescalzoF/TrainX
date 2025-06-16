package com.TrainX.TrainX.forum;

import lombok.Data;

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

