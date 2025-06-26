package com.TrainX.TrainX;
import com.TrainX.TrainX.scheduler.WorkoutReminderScheduler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class MailTestController {
    @Autowired
    private WorkoutReminderScheduler workoutReminderScheduler;

    @PostMapping("/trigger-reminder")
    public ResponseEntity<String> triggerReminder() {
        workoutReminderScheduler.triggerManualReminderForAll();
        return ResponseEntity.ok("Manual reminder triggered for all users");
    }
}
