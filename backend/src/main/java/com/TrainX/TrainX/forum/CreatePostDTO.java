package com.TrainX.TrainX.forum;

import java.time.LocalDateTime;
import java.util.List;

// DTO for creating a new post
public class CreatePostDTO {
    private String title;
    private String content;
    private ForumCategory category;

    public CreatePostDTO() {}

    public CreatePostDTO(String title, String content, ForumCategory category) {
        this.title = title;
        this.content = content;
        this.category = category;
    }

    // Getters and setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public ForumCategory getCategory() { return category; }
    public void setCategory(ForumCategory category) { this.category = category; }
}