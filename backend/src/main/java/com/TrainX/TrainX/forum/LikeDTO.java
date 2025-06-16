package com.TrainX.TrainX.forum;
import lombok.Data;

@Data
public class LikeDTO {
    private Long id;
    private Long userId;
    private Long postId;
    private Long commentId;
}