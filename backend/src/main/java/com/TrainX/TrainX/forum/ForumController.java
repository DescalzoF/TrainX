package com.TrainX.TrainX.forum;

import com.TrainX.TrainX.User.UserEntity;
import com.TrainX.TrainX.User.UserService;
import com.TrainX.TrainX.forum.dto.CategoryDTO;
import com.TrainX.TrainX.forum.dto.CommentDTO;
import com.TrainX.TrainX.forum.dto.LikeDTO;
import com.TrainX.TrainX.forum.dto.PostDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/forum")
public class ForumController {

    @Autowired
    private ForumService forumService;

    @Autowired
    private UserService userService;

    // --- DTO Conversion Methods ---
    private CategoryDTO convertToCategoryDTO(CategoryEntity entity) {
        CategoryDTO dto = new CategoryDTO();
        dto.setId(entity.getId());
        dto.setValue(entity.getValue());
        dto.setLabel(entity.getLabel());
        return dto;
    }

    private PostDTO convertToPostDTO(PostEntity entity) {
        PostDTO dto = new PostDTO();
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setContent(entity.getContent());
        dto.setCreatedAt(entity.getCreatedAt() != null ? entity.getCreatedAt().toString() : null);
        dto.setAuthorName(entity.getAuthor() != null ? entity.getAuthor().getName() : null);
        dto.setAuthorUsername(entity.getAuthor() != null ? entity.getAuthor().getUsername() : null);
        dto.setAuthorPhoto(entity.getAuthor() != null ? entity.getAuthor().getUserPhoto() : null);
        dto.setCategory(entity.getCategory() != null ? entity.getCategory().getValue() : null);

        // Count likes for this post
        Long likeCount = forumService.countLikesByPostId(entity.getId());
        dto.setLikes(likeCount);

        // Count comments for this post
        Long commentCount = forumService.countCommentsByPostId(entity.getId());
        dto.setCommentCount(commentCount);

        return dto;
    }

    private CommentDTO convertToCommentDTO(CommentEntity entity) {
        CommentDTO dto = new CommentDTO();
        dto.setId(entity.getId());
        dto.setContent(entity.getContent());
        dto.setCreatedAt(entity.getCreatedAt() != null ? entity.getCreatedAt().toString() : null);
        dto.setAuthorName(entity.getAuthor() != null ? entity.getAuthor().getName() : null);
        dto.setAuthorUsername(entity.getAuthor() != null ? entity.getAuthor().getUsername() : null);
        dto.setAuthorPhoto(entity.getAuthor() != null ? entity.getAuthor().getUserPhoto() : null);
        dto.setPostId(entity.getPost() != null ? entity.getPost().getId() : null);
        dto.setParentId(entity.getParent() != null ? entity.getParent().getId() : null);

        // Count likes for this comment
        Long likeCount = forumService.countLikesByCommentId(entity.getId());
        dto.setLikes(likeCount);

        return dto;
    }

    private LikeDTO convertToLikeDTO(LikeEntity entity) {
        LikeDTO dto = new LikeDTO();
        dto.setId(entity.getId());
        dto.setUserId(entity.getUser() != null ? entity.getUser().getId() : null);
        dto.setPostId(entity.getPost() != null ? entity.getPost().getId() : null);
        dto.setCommentId(entity.getComment() != null ? entity.getComment().getId() : null);
        return dto;
    }

    // --- Categories ---
    @GetMapping("/categories")
    public List<CategoryDTO> getCategories() {
        return forumService.getAllCategories()
                .stream()
                .map(this::convertToCategoryDTO)
                .collect(Collectors.toList());
    }

    // --- Posts ---
    @GetMapping("/posts")
    public List<PostDTO> getPosts() {
        return forumService.getAllPosts()
                .stream()
                .map(this::convertToPostDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/posts/{id}")
    public PostDTO getPost(@PathVariable Long id) {
        Optional<PostEntity> postOpt = forumService.getPostById(id);
        return postOpt.map(this::convertToPostDTO).orElse(null);
    }

    @PostMapping("posting/posts")
    public PostDTO createPost(@RequestBody Map<String, Object> payload) {
        try {
            // Extract data from payload
            String title = (String) payload.get("title");
            String content = (String) payload.get("content");

            // Get author ID
            Map<String, Object> authorMap = (Map<String, Object>) payload.get("author");
            Long authorId = Long.valueOf(authorMap.get("id").toString());

            // Get category value
            Map<String, Object> categoryMap = (Map<String, Object>) payload.get("category");
            String categoryValue = (String) categoryMap.get("value");

            // Find or create category
            CategoryEntity category = forumService.getCategoryByValue(categoryValue);
            if (category == null) {
                category = new CategoryEntity();
                category.setValue(categoryValue);
                category.setLabel((String) categoryMap.get("label"));
                category = forumService.saveCategory(category);
            }

            // Create and save post
            PostEntity post = new PostEntity();
            post.setTitle(title);
            post.setContent(content);
            post.setCreatedAt(LocalDateTime.now());

            // Set author
            UserEntity author = userService.getUserById(authorId);
            if (author == null) {
                throw new RuntimeException("User not found");
            }

            post.setAuthor(author);

            // Set category
            post.setCategory(category);

            // Save post
            PostEntity savedPost = forumService.savePost(post);

            // Return DTO
            return convertToPostDTO(savedPost);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create post: " + e.getMessage(), e);
        }
    }

    @PostMapping("/posts/{postId}/like")
    public LikeDTO likePost(@PathVariable Long postId, @RequestBody Map<String, Object> payload) {
        try {
            Long userId = Long.valueOf(payload.get("id").toString());
            UserEntity user = userService.getUserById(userId);

            if (user == null) {
                throw new RuntimeException("User not found");
            }

            Optional<PostEntity> postOpt = forumService.getPostById(postId);
            if (!postOpt.isPresent()) {
                throw new RuntimeException("Post not found");
            }

            // Check if user already liked this post
            if (forumService.hasUserLikedPost(userId, postId)) {
                throw new RuntimeException("User already liked this post");
            }

            LikeEntity like = new LikeEntity();
            like.setUser(user);
            like.setPost(postOpt.get());

            LikeEntity savedLike = forumService.saveLike(like);
            return convertToLikeDTO(savedLike);
        } catch (Exception e) {
            throw new RuntimeException("Failed to like post: " + e.getMessage(), e);
        }
    }

    // --- Comments ---
    @GetMapping("/comments")
    public List<CommentDTO> getCommentsByPostId(@RequestParam Long postId) {
        List<CommentEntity> comments = forumService.getCommentsByPostId(postId);
        return comments.stream()
                .map(this::convertToCommentDTO)
                .collect(Collectors.toList());
    }

    @PostMapping("/posts/{postId}/comments")
    public CommentDTO addComment(@PathVariable Long postId, @RequestBody Map<String, Object> payload) {
        try {
            String content = (String) payload.get("content");
            Map<String, Object> authorMap = (Map<String, Object>) payload.get("author");
            Long authorId = Long.valueOf(authorMap.get("id").toString());

            UserEntity author = userService.getUserById(authorId);
            if (author == null) {
                throw new RuntimeException("User not found");
            }

            Optional<PostEntity> postOpt = forumService.getPostById(postId);
            if (!postOpt.isPresent()) {
                throw new RuntimeException("Post not found");
            }

            CommentEntity comment = new CommentEntity();
            comment.setContent(content);
            comment.setAuthor(author);
            comment.setPost(postOpt.get());
            comment.setCreatedAt(LocalDateTime.now());

            CommentEntity savedComment = forumService.saveComment(comment);
            return convertToCommentDTO(savedComment);
        } catch (Exception e) {
            throw new RuntimeException("Failed to add comment: " + e.getMessage(), e);
        }
    }

    @PostMapping("/comments/{commentId}/like")
    public LikeDTO likeComment(@PathVariable Long commentId, @RequestBody Map<String, Object> payload) {
        try {
            Long userId = Long.valueOf(payload.get("id").toString());
            UserEntity user = userService.getUserById(userId);

            if (user == null) {
                throw new RuntimeException("User not found");
            }

            Optional<CommentEntity> commentOpt = forumService.getCommentById(commentId);
            if (!commentOpt.isPresent()) {
                throw new RuntimeException("Comment not found");
            }

            // Check if user already liked this comment
            if (forumService.hasUserLikedComment(userId, commentId)) {
                throw new RuntimeException("User already liked this comment");
            }

            LikeEntity like = new LikeEntity();
            like.setUser(user);
            like.setComment(commentOpt.get());

            LikeEntity savedLike = forumService.saveLike(like);
            return convertToLikeDTO(savedLike);
        } catch (Exception e) {
            throw new RuntimeException("Failed to like comment: " + e.getMessage(), e);
        }
    }
}