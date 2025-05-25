package com.TrainX.TrainX.forum;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ForumPostRepository extends JpaRepository<ForumPostEntity, Long> {

    Page<ForumPostEntity> findByIsActiveTrueOrderByCreatedAtDesc(Pageable pageable);

    Page<ForumPostEntity> findByCategoryAndIsActiveTrueOrderByCreatedAtDesc(ForumCategory category, Pageable pageable);

    @Query("SELECT p FROM ForumPostEntity p WHERE p.isActive = true AND (p.title LIKE %:keyword% OR p.content LIKE %:keyword%) ORDER BY p.createdAt DESC")
    Page<ForumPostEntity> findByKeywordAndIsActiveTrue(@Param("keyword") String keyword, Pageable pageable);

    List<ForumPostEntity> findByAuthor_IdAndIsActiveTrueOrderByCreatedAtDesc(Long authorId);

    @Query("SELECT p FROM ForumPostEntity p WHERE p.isActive = true ORDER BY p.likes DESC, p.createdAt DESC")
    Page<ForumPostEntity> findMostPopularPosts(Pageable pageable);
}