package com.TrainX.TrainX.level;

import com.TrainX.TrainX.User.UserEntity;
import com.TrainX.TrainX.User.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
public class LevelService {

    private final LevelRepository levelRepository;
    private final UserRepository userRepository;

    @Autowired
    public LevelService(LevelRepository levelRepository, UserRepository userRepository) {
        this.levelRepository = levelRepository;
        this.userRepository = userRepository;
    }

    public List<LevelEntity> getAllLevels() {
        return levelRepository.findAll();
    }

    public List<LevelEntity> getLevelsByCaminoFitness(Long caminoFitnessId) {
        List<LevelEntity> levels = levelRepository.findByCaminos_IdCF(caminoFitnessId);
        if (levels.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "No levels found for camino fitness with ID: " + caminoFitnessId
            );
        }
        return levels;
    }

    public LevelEntity getLevelByNameAndCamino(String nameLevel, Long caminoFitnessId) {
        return levelRepository.findByNameLevelAndCaminos_IdCF(nameLevel, caminoFitnessId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Level not found with name: " + nameLevel + " and camino fitness ID: " + caminoFitnessId
                ));
    }

    public Optional<LevelEntity> getLevelById(Long id) {
        return levelRepository.findById(id);
    }

    public LevelEntity createLevel(LevelEntity levelEntity) {
        return levelRepository.save(levelEntity);
    }

    public LevelEntity updateLevel(Long id, LevelEntity levelEntity) {
        if (!levelRepository.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Level not found with ID: " + id
            );
        }
        levelEntity.setIdLevel(id);
        return levelRepository.save(levelEntity);
    }

    public void deleteLevel(Long id) {
        if (!levelRepository.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Level not found with ID: " + id
            );
        }
        levelRepository.deleteById(id);
    }

    public Optional<LevelEntity> getLevelByXP(Long xp) {
        List<LevelEntity> allLevels = levelRepository.findAll();

        return allLevels.stream()
                .filter(level -> xp >= level.getXpMin() && xp <= level.getXpMax())
                .findFirst();
    }

    @Transactional
    public void checkAndUpdateUserLevel(Long userId, Long currentXp) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found with ID: " + userId
                ));

        Optional<LevelEntity> appropriateLevel = getLevelByXP(currentXp);

        if (appropriateLevel.isPresent()) {
            LevelEntity newLevel = appropriateLevel.get();

            if (user.getLevel() == null || !user.getLevel().getIdLevel().equals(newLevel.getIdLevel())) {
                user.setLevel(newLevel);
                userRepository.save(user);
            }
        }
    }
}