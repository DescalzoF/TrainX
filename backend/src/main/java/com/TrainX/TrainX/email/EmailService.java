package com.TrainX.TrainX.email;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Autowired
    public EmailService(JavaMailSender mailSender, TemplateEngine templateEngine) {
        this.mailSender = mailSender;
        this.templateEngine = templateEngine;
    }

    public void sendWorkoutReminderEmail(String toEmail, String username) throws MessagingException {
        sendWorkoutReminderEmail(toEmail, username, false);
    }

    public void sendWorkoutReminderEmail(String toEmail, String username, boolean isManualTrigger) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        // Create Thymeleaf context with variables
        Context context = new Context();
        context.setVariable("username", username);
        context.setVariable("appName", "TrainX");

        // Process the HTML template
        String htmlContent = templateEngine.process("workout-reminder", context);

        helper.setFrom("francodescalzo@gmail.com");
        helper.setTo(toEmail);
        helper.setSubject(isManualTrigger ?
                "TrainX - Recordatorio Manual 💪" :
                "¡Te extrañamos en TrainX! 💪");
        helper.setText(htmlContent, true); // true indicates HTML content

        mailSender.send(message);
        System.out.println("HTML workout reminder mail sent to: " + toEmail);
    }

    // Fallback method for simple text emails (keeping for compatibility)
    public void sendSimpleWorkoutReminderEmail(String toEmail, String username) {
        try {
            sendWorkoutReminderEmail(toEmail, username, false);
        } catch (MessagingException e) {
            System.err.println("Failed to send HTML email, this method is deprecated: " + e.getMessage());
        }
    }
}