package com.TrainX.TrainX.email;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.io.UnsupportedEncodingException;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${app.email.from}")
    private String fromEmail;

    @Value("${app.email.from-name}")
    private String fromName;

    @Autowired
    public EmailService(JavaMailSender mailSender, TemplateEngine templateEngine) {
        this.mailSender = mailSender;
        this.templateEngine = templateEngine;
    }

    public void sendWorkoutReminderEmail(String toEmail, String username) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            Context context = new Context();
            context.setVariable("username", username);
            context.setVariable("appName", "TrainX");

            String htmlContent = templateEngine.process("workout-reminder", context);

            helper.setFrom(fromEmail, fromName);
            helper.setTo(toEmail);
            helper.setSubject("¡Te extrañamos en TrainX! 💪");
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Workout reminder email sent successfully to: {}", toEmail);

        } catch (MessagingException | UnsupportedEncodingException e) {
            log.error("Failed to send workout reminder email to: {}. Error: {}", toEmail, e.getMessage());
            throw new RuntimeException("Failed to send email", e);
        }
    }

    public void sendSimpleWorkoutReminder(String toEmail, String username) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            String htmlContent = buildSimpleReminderHtml(username);

            helper.setFrom(fromEmail, fromName);
            helper.setTo(toEmail);
            helper.setSubject("¡Te extrañamos en TrainX! 💪");
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Simple workout reminder email sent successfully to: {}", toEmail);

        } catch (MessagingException | UnsupportedEncodingException e) {
            log.error("Failed to send simple workout reminder email to: {}. Error: {}", toEmail, e.getMessage());
            throw new RuntimeException("Failed to send email", e);
        }
    }

    private String buildSimpleReminderHtml(String username) {
        String template = """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>TrainX - Workout Reminder</title>
                <style>
                    body {
                        font-family: 'Arial', sans-serif;
                        margin: 0;
                        padding: 0;
                        background-color: #f5f5f5;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        border-radius: 10px;
                        overflow: hidden;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    }
                    .header {
                        background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%);
                        padding: 30px;
                        text-align: center;
                        color: white;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 28px;
                        font-weight: bold;
                    }
                    .content {
                        padding: 40px 30px;
                        text-align: center;
                    }
                    .content h2 {
                        color: #333;
                        margin-bottom: 20px;
                        font-size: 24px;
                    }
                    .content p {
                        color: #666;
                        line-height: 1.6;
                        margin-bottom: 20px;
                        font-size: 16px;
                    }
                    .emoji {
                        font-size: 48px;
                        margin: 20px 0;
                    }
                    .cta-button {
                        display: inline-block;
                        padding: 15px 30px;
                        background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%);
                        color: white;
                        text-decoration: none;
                        border-radius: 25px;
                        font-weight: bold;
                        margin: 20px 0;
                        transition: transform 0.3s ease;
                    }
                    .cta-button:hover {
                        transform: translateY(-2px);
                    }
                    .footer {
                        background-color: #f8f9fa;
                        padding: 20px;
                        text-align: center;
                        color: #666;
                        font-size: 14px;
                    }
                    .stats {
                        background-color: #f8f9fa;
                        padding: 20px;
                        margin: 20px 0;
                        border-radius: 8px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🏋️‍♂️ TrainX</h1>
                    </div>
                    
                    <div class="content">
                        <div class="emoji">💪</div>
                        <h2>¡Hola %s!</h2>
                        <p>Hemos notado que no has completado ningún ejercicio en la última semana. ¡Tu progreso fitness te está esperando!</p>
                        
                        <div class="stats">
                            <p><strong>📅 Han pasado más de 7 días desde tu último entrenamiento</strong></p>
                            <p>Recuerda que la consistencia es clave para alcanzar tus objetivos fitness.</p>
                        </div>
                        
                        <p>¡Es momento de retomar tu rutina y seguir construyendo la mejor versión de ti mismo!</p>
                        
                        <a href="#" class="cta-button">¡Entrenar Ahora! 🚀</a>
                        
                        <div class="emoji">🔥</div>
                        <p><em>"El éxito es la suma de pequeños esfuerzos repetidos día tras día."</em></p>
                    </div>
                    
                    <div class="footer">
                        <p>Este mensaje fue enviado por TrainX</p>
                        <p>¡Seguimos creyendo en tu potencial! 💙</p>
                    </div>
                </div>
            </body>
            </html>
            """;

        return String.format(template, username);
    }
}