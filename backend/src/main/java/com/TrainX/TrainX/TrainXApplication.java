package com.TrainX.TrainX;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class TrainXApplication {

	public static void main(String[] args) {
		SpringApplication.run(TrainXApplication.class, args);
	}

}
