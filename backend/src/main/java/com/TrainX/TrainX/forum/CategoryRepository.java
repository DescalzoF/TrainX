// src/main/java/com/TrainX/TrainX/forum/CategoryRepository.java
package com.TrainX.TrainX.forum;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<CategoryEntity, Long> {
    CategoryEntity findByValue(String value);
}
