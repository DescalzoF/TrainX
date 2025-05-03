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
}