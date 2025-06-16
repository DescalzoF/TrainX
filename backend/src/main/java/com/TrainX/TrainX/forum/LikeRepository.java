package com.TrainX.TrainX.forum;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LikeRepository extends JpaRepository<LikeEntity, Long> {
    // Count likes for a post
    long countByPostId(Long postId);

    // Count likes for a comment
    long countByCommentId(Long commentId);

    // Check if a user has liked a post
    boolean existsByUserIdAndPostId(Long userId, Long postId);

    // Check if a user has liked a comment
    boolean existsByUserIdAndCommentId(Long userId, Long commentId);
}
