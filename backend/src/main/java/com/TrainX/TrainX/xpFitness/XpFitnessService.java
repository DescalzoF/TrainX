package com.TrainX.TrainX.xpFitness;

import com.TrainX.TrainX.level.LevelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class XpFitnessService {

    private final XpFitnessRepository xpFitnessRepository;
    private final LevelService levelService;

    @Autowired
    public XpFitnessService(XpFitnessRepository xpFitnessRepository, LevelService levelService) {
        this.xpFitnessRepository = xpFitnessRepository;
        this.levelService = levelService;
    }

    public XpFitnessEntity getXpFitnessByUser(Long userId) {
        return xpFitnessRepository.findByUser_Id(userId);
    }

    @Transactional
    public XpFitnessEntity updateXpFitness(Long userId, Long xpToAdd) {
        XpFitnessEntity xpFitness = getXpFitnessByUser(userId);
        if (xpFitness != null) {
            xpFitness.addXp(xpToAdd);
            XpFitnessEntity savedXpFitness = xpFitnessRepository.save(xpFitness);

            levelService.checkAndUpdateUserLevel(userId, savedXpFitness.getTotalXp());

            return savedXpFitness;
        }
        return null;
    }

    @Transactional
    public XpFitnessEntity createXpFitness(Long userId, Long initialXp) {
        XpFitnessEntity xpFitness = new XpFitnessEntity();
        xpFitness.setTotalXp(initialXp != null ? initialXp : 0L);
        XpFitnessEntity savedXpFitness = xpFitnessRepository.save(xpFitness);

        levelService.checkAndUpdateUserLevel(userId, savedXpFitness.getTotalXp());

        return savedXpFitness;
    }

    @Transactional
    public XpFitnessEntity resetXpFitness(Long userId) {
        XpFitnessEntity xpFitness = getXpFitnessByUser(userId);
        if (xpFitness != null) {
            // Resetear XP a 0
            xpFitness.setTotalXp(0L);
            XpFitnessEntity savedXpFitness = xpFitnessRepository.save(xpFitness);

            // También actualiza el nivel del usuario ya que ahora tiene 0 XP
            levelService.checkAndUpdateUserLevel(userId, 0L);

            return savedXpFitness;
        }
        return null;
    }
}