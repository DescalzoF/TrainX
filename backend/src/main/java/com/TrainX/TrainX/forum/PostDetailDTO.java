package com.TrainX.TrainX.forum;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
class PostDetailDTO {
    private PostResponseDTO post;
    private List<CommentResponseDTO> comments;

    public PostDetailDTO() {
    }

    public PostDetailDTO(PostResponseDTO post, List<CommentResponseDTO> comments) {
        this.post = post;
        this.comments = comments;
    }
}
