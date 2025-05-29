package com.TrainX.TrainX.forum;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
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
}