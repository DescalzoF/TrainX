package com.TrainX.TrainX.forum;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/forum")
@CrossOrigin(origins = "*")
public class ForumController {

    private final ForumService forumService;

    @Autowired
    public ForumController(ForumService forumService) {
        this.forumService = forumService;
    }

    // Get all categories
    @GetMapping("/categories")
    public ResponseEntity<Map<String, Object>> getCategories() {
        List<Map<String, String>> categories = Arrays.stream(ForumCategory.values())
                .map(category -> Map.of(
                        "value", category.name(),
                        "label", category.getDisplayName()
                ))
                .toList();
        return ResponseEntity.ok(Map.of("categories", categories));
    }

    // Get all posts with pagination
    @GetMapping("/posts")
    public ResponseEntity<Map<String, Object>> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<PostResponseDTO> posts = forumService.getAllPosts(page, size);
            return ResponseEntity.ok(Map.of(
                    "content", posts.getContent(),
                    "totalPages", posts.getTotalPages(),
                    "totalElements", posts.getTotalElements(),
                    "number", posts.getNumber(),
                    "size", posts.getSize()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get posts by category
    @GetMapping("/posts/category/{category}")
    public ResponseEntity<Map<String, Object>> getPostsByCategory(
            @PathVariable ForumCategory category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<PostResponseDTO> posts = forumService.getPostsByCategory(category, page, size);
            return ResponseEntity.ok(Map.of(
                    "content", posts.getContent(),
                    "totalPages", posts.getTotalPages(),
                    "totalElements", posts.getTotalElements(),
                    "number", posts.getNumber(),
                    "size", posts.getSize()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Search posts
    @GetMapping("/posts/search")
    public ResponseEntity<Map<String, Object>> searchPosts(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<PostResponseDTO> posts = forumService.searchPosts(keyword, page, size);
            return ResponseEntity.ok(Map.of(
                    "content", posts.getContent(),
                    "totalPages", posts.getTotalPages(),
                    "totalElements", posts.getTotalElements(),
                    "number", posts.getNumber(),
                    "size", posts.getSize()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get popular posts
    @GetMapping("/posts/popular")
    public ResponseEntity<Map<String, Object>> getPopularPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<PostResponseDTO> posts = forumService.getPopularPosts(page, size);
            return ResponseEntity.ok(Map.of(
                    "content", posts.getContent(),
                    "totalPages", posts.getTotalPages(),
                    "totalElements", posts.getTotalElements(),
                    "number", posts.getNumber(),
                    "size", posts.getSize()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get post with comments
    @GetMapping("/posts/{id}")
    public ResponseEntity<PostDetailDTO> getPost(@PathVariable Long id) {
        try {
            PostDetailDTO postDetail = forumService.getPostWithComments(id);
            return ResponseEntity.ok(postDetail);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Create new post
    @PostMapping("/posts")
    public ResponseEntity<PostResponseDTO> createPost(@RequestBody CreatePostDTO createPostDTO) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();

            PostResponseDTO createdPost = forumService.createPost(createPostDTO, username);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdPost);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Like a post
    @PostMapping("/posts/{id}/like")
    public ResponseEntity<PostResponseDTO> likePost(@PathVariable Long id) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();

            PostResponseDTO likedPost = forumService.likePost(id, username);
            return ResponseEntity.ok(likedPost);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Delete a post
    @DeleteMapping("/posts/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();

            forumService.deletePost(id, username);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Create comment
    @PostMapping("/posts/{id}/comments")
    public ResponseEntity<CommentResponseDTO> createComment(
            @PathVariable Long id,
            @RequestBody CreateCommentDTO createCommentDTO) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();

            CommentResponseDTO createdComment = forumService.createComment(id, createCommentDTO, username);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdComment);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Like a comment
    @PostMapping("/comments/{id}/like")
    public ResponseEntity<CommentResponseDTO> likeComment(@PathVariable Long id) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();

            CommentResponseDTO likedComment = forumService.likeComment(id, username);
            return ResponseEntity.ok(likedComment);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Delete a comment
    @DeleteMapping("/comments/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();

            forumService.deleteComment(id, username);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get user's posts
    @GetMapping("/users/{userId}/posts")
    public ResponseEntity<List<PostResponseDTO>> getUserPosts(@PathVariable Long userId) {
        try {
            List<PostResponseDTO> userPosts = forumService.getUserPosts(userId);
            return ResponseEntity.ok(userPosts);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}