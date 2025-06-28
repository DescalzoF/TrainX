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

    public void sendWorkoutReminderEmail(String toEmail, String username, boolean isManualTrigger) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        Context context = new Context();
        context.setVariable("username", username);
        context.setVariable("appName", "TrainX");

        String htmlContent = templateEngine.process("workout-reminder", context);

        helper.setFrom("francodescalzo@gmail.com");
        helper.setTo(toEmail);
        helper.setSubject(isManualTrigger ?
                "TrainX - Recordatorio Manual 💪" :
                "¡Te extrañamos en TrainX! 💪");
        helper.setText(htmlContent, true);

        mailSender.send(message);
        System.out.println("HTML workout reminder mail sent to: " + toEmail);
    }
    // En EmailService.java, agregar:
    public void sendVerificationEmail(String toEmail, String username, String token) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        Context context = new Context();
        context.setVariable("username", username);
        context.setVariable("verificationUrl", "http://localhost:5173/verify-email?token=" + token);
        context.setVariable("appName", "TrainX");

        String htmlContent = templateEngine.process("email-verification", context);

        helper.setFrom("francodescalzo@gmail.com");
        helper.setTo(toEmail);
        helper.setSubject("TrainX - Verifica tu cuenta 📧");
        helper.setText(htmlContent, true);

        mailSender.send(message);
        System.out.println("Verification email sent to: " + toEmail);
    }

    public void sendPasswordResetEmail(String toEmail, String username, String token) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        Context context = new Context();
        context.setVariable("username", username);
        context.setVariable("resetUrl", "http://localhost:5173/reset-password?token=" + token);
        context.setVariable("appName", "TrainX");

        String htmlContent = templateEngine.process("password-reset", context);

        helper.setFrom("francodescalzo@gmail.com");
        helper.setTo(toEmail);
        helper.setSubject("TrainX - Restablece tu contraseña 🔑");
        helper.setText(htmlContent, true);

        mailSender.send(message);
        System.out.println("Password reset email sent to: " + toEmail);
    }
}