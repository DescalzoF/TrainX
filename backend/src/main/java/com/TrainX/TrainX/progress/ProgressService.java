package com.TrainX.TrainX.progress;

import com.TrainX.TrainX.User.UserEntity;
import com.TrainX.TrainX.User.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProgressService {

    private final ProgressRepository progressRepository;
    private final UserRepository userRepository;
    private final ProgressMapper mapper;

    public ProgressService(ProgressRepository progressRepository,
                           UserRepository userRepository,
                           ProgressMapper mapper) {
        this.progressRepository = progressRepository;
        this.userRepository = userRepository;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public ProgressDTO getProgressByUserId(Long userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        ProgressEntity entity = progressRepository.findByUser(user)
                .orElseGet(() -> {
                    ProgressEntity e = new ProgressEntity();
                    e.setUser(user);
                    return e;
                });
        return mapper.toDTO(entity);
    }

    @Transactional
    public ProgressDTO updateProgress(Long userId, ProgressDTO dto) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ProgressEntity entity = progressRepository.findByUser(user)
                .orElseGet(() -> {
                    ProgressEntity e = new ProgressEntity();
                    e.setUser(user);
                    return e;
                });

        mapper.toEntity(dto, entity);
        ProgressEntity saved = progressRepository.save(entity);
        return mapper.toDTO(saved);
    }
}
