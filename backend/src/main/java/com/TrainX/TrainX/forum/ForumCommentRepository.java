package com.TrainX.TrainX.forum;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ForumCommentRepository extends JpaRepository<ForumCommentEntity, Long> {

    List<ForumCommentEntity> findByPost_IdAndIsActiveTrueOrderByCreatedAtAsc(Long postId);

    Page<ForumCommentEntity> findByPost_IdAndIsActiveTrueOrderByCreatedAtAsc(Long postId, Pageable pageable);

    List<ForumCommentEntity> findByAuthor_IdAndIsActiveTrueOrderByCreatedAtDesc(Long authorId);

    Long countByPost_IdAndIsActiveTrue(Long postId);
}