package com.TrainX.TrainX.forum;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommentRepository extends JpaRepository<CommentEntity, Long> {
    // Find all comments for a post, ordered by creation date (newest first)
    List<CommentEntity> findByPostIdOrderByCreatedAtDesc(Long postId);

    // Count comments for a post
    long countByPostId(Long postId);
}
