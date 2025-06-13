// src/main/java/com/TrainX/TrainX/forum/PostRepository.java
package com.TrainX.TrainX.forum;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PostRepository extends JpaRepository<PostEntity, Long> {
}