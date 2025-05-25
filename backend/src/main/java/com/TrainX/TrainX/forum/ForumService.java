package com.TrainX.TrainX.forum;

import com.TrainX.TrainX.User.UserEntity;
import com.TrainX.TrainX.User.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ForumService {

    private final ForumPostRepository postRepository;
    private final ForumCommentRepository commentRepository;
    private final UserService userService;

    @Autowired
    public ForumService(ForumPostRepository postRepository,
                        ForumCommentRepository commentRepository,
                        UserService userService) {
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.userService = userService;
    }

    // Post operations
    public PostResponseDTO createPost(CreatePostDTO createPostDTO, String username) {
        UserEntity author = userService.getUserByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ForumPostEntity post = new ForumPostEntity(
                createPostDTO.getTitle(),
                createPostDTO.getContent(),
                author,
                createPostDTO.getCategory()
        );

        ForumPostEntity savedPost = postRepository.save(post);
        return new PostResponseDTO(savedPost);
    }

    public Page<PostResponseDTO> getAllPosts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return postRepository.findByIsActiveTrueOrderByCreatedAtDesc(pageable)
                .map(PostResponseDTO::new);
    }

    public Page<PostResponseDTO> getPostsByCategory(ForumCategory category, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return postRepository.findByCategoryAndIsActiveTrueOrderByCreatedAtDesc(category, pageable)
                .map(PostResponseDTO::new);
    }

    public Page<PostResponseDTO> searchPosts(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return postRepository.findByKeywordAndIsActiveTrue(keyword, pageable)
                .map(PostResponseDTO::new);
    }

    public PostDetailDTO getPostWithComments(Long postId) {
        ForumPostEntity post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (!post.getIsActive()) {
            throw new RuntimeException("Post not available");
        }

        List<CommentResponseDTO> comments = commentRepository
                .findByPost_IdAndIsActiveTrueOrderByCreatedAtAsc(postId)
                .stream()
                .map(CommentResponseDTO::new)
                .collect(Collectors.toList());

        return new PostDetailDTO(new PostResponseDTO(post), comments);
    }

    public PostResponseDTO likePost(Long postId, String username) {
        ForumPostEntity post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        post.setLikes(post.getLikes() + 1);
        ForumPostEntity savedPost = postRepository.save(post);
        return new PostResponseDTO(savedPost);
    }

    public void deletePost(Long postId, String username) {
        ForumPostEntity post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        UserEntity currentUser = userService.getUserByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Only allow deletion by author or admin
        if (!post.getAuthor().getId().equals(currentUser.getId()) &&
                !currentUser.getRole().name().equals("ADMIN")) {
            throw new RuntimeException("Not authorized to delete this post");
        }

        post.setIsActive(false);
        postRepository.save(post);
    }

    // Comment operations
    public CommentResponseDTO createComment(Long postId, CreateCommentDTO createCommentDTO, String username) {
        ForumPostEntity post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (!post.getIsActive()) {
            throw new RuntimeException("Cannot comment on inactive post");
        }

        UserEntity author = userService.getUserByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ForumCommentEntity comment = new ForumCommentEntity(
                createCommentDTO.getContent(),
                author,
                post
        );

        ForumCommentEntity savedComment = commentRepository.save(comment);
        return new CommentResponseDTO(savedComment);
    }

    public CommentResponseDTO likeComment(Long commentId, String username) {
        ForumCommentEntity comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        comment.setLikes(comment.getLikes() + 1);
        ForumCommentEntity savedComment = commentRepository.save(comment);
        return new CommentResponseDTO(savedComment);
    }

    public void deleteComment(Long commentId, String username) {
        ForumCommentEntity comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        UserEntity currentUser = userService.getUserByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Only allow deletion by author or admin
        if (!comment.getAuthor().getId().equals(currentUser.getId()) &&
                !currentUser.getRole().name().equals("ADMIN")) {
            throw new RuntimeException("Not authorized to delete this comment");
        }

        comment.setIsActive(false);
        commentRepository.save(comment);
    }

    public List<PostResponseDTO> getUserPosts(Long userId) {
        return postRepository.findByAuthor_IdAndIsActiveTrueOrderByCreatedAtDesc(userId)
                .stream()
                .map(PostResponseDTO::new)
                .collect(Collectors.toList());
    }

    public Page<PostResponseDTO> getPopularPosts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return postRepository.findMostPopularPosts(pageable)
                .map(PostResponseDTO::new);
    }
}