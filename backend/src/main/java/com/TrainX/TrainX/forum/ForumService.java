// src/main/java/com/TrainX/TrainX/forum/ForumService.java
package com.TrainX.TrainX.forum;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ForumService {

    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private PostRepository postRepository;
    @Autowired
    CommentRepository commentRepository;
    @Autowired
    private LikeRepository likeRepository;

    public List<CategoryEntity> getAllCategories() {
        return categoryRepository.findAll();
    }

    public List<PostEntity> getAllPosts() {
        return postRepository.findAll();
    }

    public Optional<PostEntity> getPostById(Long id) {
        return postRepository.findById(id);
    }

    public PostEntity savePost(PostEntity post) {
        return postRepository.save(post);
    }

    public CommentEntity saveComment(CommentEntity comment) {
        return commentRepository.save(comment);
    }

    public LikeEntity saveLike(LikeEntity like) {
        return likeRepository.save(like);
    }
    public CategoryEntity getCategoryByValue(String value) {
        return categoryRepository.findByValue(value);
    }

    public CategoryEntity saveCategory(CategoryEntity category) {
        return categoryRepository.save(category);
    }

    public Long countLikesByPostId(Long postId) {
        return likeRepository.countByPostId(postId);
    }

    public Long countLikesByCommentId(Long commentId) {
        return likeRepository.countByCommentId(commentId);
    }

    public Long countCommentsByPostId(Long postId) {
        return commentRepository.countByPostId(postId);
    }

    public List<CommentEntity> getCommentsByPostId(Long postId) {
        return commentRepository.findByPostIdOrderByCreatedAtDesc(postId);
    }

    public Optional<CommentEntity> getCommentById(Long id) {
        return commentRepository.findById(id);
    }

    public boolean hasUserLikedPost(Long userId, Long postId) {
        return likeRepository.existsByUserIdAndPostId(userId, postId);
    }

    public boolean hasUserLikedComment(Long userId, Long commentId) {
        return likeRepository.existsByUserIdAndCommentId(userId, commentId);
    }
}
