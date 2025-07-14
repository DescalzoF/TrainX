package com.TrainX.TrainX.duels;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class DuelScheduler {

    private final DuelService duelService;

    @Autowired
    public DuelScheduler(DuelService duelService) {
        this.duelService = duelService;
    }

    @Scheduled(cron = "0 * * * * ?") // Every minute
    public void checkExpiredDuels() {
        duelService.checkExpiredDuels();
        duelService.checkExpiredPendingDuels();
    }
}