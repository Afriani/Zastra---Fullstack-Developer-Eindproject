package com.zastra.zastra.infra.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendVerificationEmail(String toEmail, String firstName, String token) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("🔐 Verify Your Email - Damage Reporting App");

            String verificationUrl = baseUrl + "/api/auth/verify?token=" + token;

            String htmlContent = String.format("""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #007bff; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
                        .button { display: inline-block; background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Zastra</h1>
                        </div>
                        <div class="content">
                            <h2>Welcome %s! 👋</h2>
                            <p>Thank you for registering with Zastra!</p>
                            <p>To complete your registration and activate your account,
                            please verify your email address by clicking the button below:</p>
                            <div style="text-align: center;">
                                <a href="%s" class="button">✅ Verify Email Address</a>
                            </div>
                
                            <p><strong>Important:</strong> This verification link will expire in 24 hours.</p>
                
                            <p>If the button doesn't work, copy and paste this link into your browser:</p>
                            <p style="word-break: break-all; background-color: #e9ecef; padding: 10px; border-radius: 4px;">%s</p>
                
                            <p>If you didn't create an account with us, please ignore this email.</p>
              
                            <hr style="margin: 30px 0;">
                            <p><strong>What you can do after verification:</strong></p>
                            <ul>
                                <li>🚧 Report damage in your area</li>
                                <li>📊 Track your reports status</li>
                                <li>💬 Communicate with municipal officers</li>
                                <li>📈 View your dashboard with statistics</li>
                            </ul>
                        </div>
                        <div class="footer">
                            <p>Best regards,<br>Zastra Team</p>
                        </div>
                    </div>
                </body>
                </html>
                """, firstName, verificationUrl, verificationUrl);

            helper.setText(htmlContent, true);
            mailSender.send(message);

            log.info("Verification email sent successfully to: {}", toEmail);

        } catch (MessagingException e) {
            log.error("Failed to send verification email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send verification email", e);
        }
    }

    public void sendWelcomeEmail(String toEmail, String firstName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Welcome to Zastra");

            String loginUrl = frontendUrl + "/login";

            String htmlContent = String.format("""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #28a745; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
                        .button { display: inline-block; background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎉 Account Verified!</h1>
                        </div>
                        <div class="content">
                            <h2>Welcome %s!</h2>
                            <p>Congratulations! Your email has been successfully verified and your account is now active.</p>
                
                            <div style="text-align: center;">
                                <a href="%s" class="button">🚀 Start Reporting</a>
                            </div>
                            <p><strong>You can now:</strong></p>
                            <ul>
                                <li>🚧 Report damage in your area with photos</li>
                                <li>📍 Use GPS location for accurate reporting</li>
                                <li>📊 Track your reports status in real-time</li>
                                <li>💬 Communicate directly with municipal officers</li>
                                <li>📈 View your personal dashboard with statistics</li>
                            </ul>
                            <p>Thank you for helping make our community better and safer!</p>
                        </div>
                        <div class="footer">
                            <p>Best regards,<br>ZastraTeam</p>
                        </div>
                    </div>
                </body>
                </html>
                """, firstName, loginUrl);

            helper.setText(htmlContent, true);
            mailSender.send(message);

            log.info("Welcome email sent successfully to: {}", toEmail);

        } catch (MessagingException e) {
            log.error("Failed to send welcome email to: {}", toEmail, e);
        }
    }

    public void sendReportStatusUpdateEmail(String toEmail, String firstName, String reportTitle, String newStatus) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("📋 Report Status Update - " + reportTitle);

            String emailBody = String.format(
                    "Dear %s,\n\n" +
                            "Your damage report has been updated:\n\n" +
                            "Report: %s\n" +
                            "New Status: %s\n\n" +
                            "You can view more details and communicate with officers by logging into your dashboard:\n" +
                            "%s/dashboard\n\n" +
                            "Thank you for helping improve our community!\n\n" +
                            "Best regards,\n" +
                            "Zastra Team",
                    firstName, reportTitle, newStatus, frontendUrl
            );

            message.setText(emailBody);
            mailSender.send(message);

            log.info("Status update email sent to: {}", toEmail);

        } catch (Exception e) {
            log.error("Failed to send status update email to: {}", toEmail, e);
        }
    }

    // New method to send password reset email
    public void sendPasswordResetEmail(String toEmail, String resetLink) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("🔑 Password Reset Request");

            String emailBody = String.format(
                    "Hello,\n\n" +
                            "We received a request to reset your password. You can reset your password by clicking the link below:\n\n" +
                            "%s\n\n" +
                            "If you did not request a password reset, please ignore this email.\n\n" +
                            "Best regards,\n" +
                            "Zastra Team",
                    resetLink
            );

            message.setText(emailBody);
            mailSender.send(message);

            log.info("Password reset email sent to: {}", toEmail);

        } catch (Exception e) {
            log.error("Failed to send password reset email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }
}


