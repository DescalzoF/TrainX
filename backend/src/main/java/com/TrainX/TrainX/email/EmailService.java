package com.TrainX.TrainX.email;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Autowired
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendWorkoutReminderEmail(String toEmail, String username) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("francodescalzo@gmail.com");
        message.setTo(toEmail);
        message.setText("¡Te extrañamos en TrainX! 💪 Hace rato que entras.");
        message.setSubject(username);

        mailSender.send(message);

        System.out.println("Mail sent");
    }
}