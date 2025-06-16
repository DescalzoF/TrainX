package com.TrainX.TrainX;

import com.TrainX.TrainX.scheduler.WorkoutReminderScheduler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class TrainXApplication {

	@Autowired
	private WorkoutReminderScheduler workoutReminderScheduler;

	public static void main(String[] args) {
		SpringApplication.run(TrainXApplication.class, args);
	}

	@EventListener(ApplicationReadyEvent.class)
	public void sendTestMail() {
		workoutReminderScheduler.triggerManualReminderForAll();
	}
}
