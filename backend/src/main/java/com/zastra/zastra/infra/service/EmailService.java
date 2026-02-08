package com.zastra.zastra.infra.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
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

    // Helper method to generate icon URLs
    private String getIconUrl(String iconName) {
        return frontendUrl + "/assets/pictures/email-service/" + iconName;
    }

    public void sendVerificationEmail(String toEmail, String firstName, String token) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Verify Your Email - Damage Reporting App");


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
                        .icon { width: 20px; height: 20px; vertical-align: middle; margin-right: 8px; }
                        .header-icon { width: 32px; height: 32px; vertical-align: middle; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <img src="%s" class="header-icon" alt="lock">
                            <h1>Zastra</h1>
                        </div>
                        <div class="content">
                            <h2>
                                Welcome %s!
                                <img src="%s" class="icon" alt="wave">
                            </h2>
                            <p>Thank you for registering with Zastra!</p>
                            <p>To complete your registration and activate your account,
                            please verify your email address by clicking the button below:</p>
                            <div style="text-align: center;">
                                <a href="%s" class="button">
                                    <img src="%s" class="icon" alt="checkmark">
                                    Verify Email Address
                                </a>
                            </div>
                
                            <p><strong>Important:</strong> This verification link will expire in 24 hours.</p>
                
                            <p>If the button doesn't work, copy and paste this link into your browser:</p>
                            <p style="word-break: break-all; background-color: #e9ecef; padding: 10px; border-radius: 4px;">%s</p>
                
                            <p>If you didn't create an account with us, please ignore this email.</p>
              
                            <hr style="margin: 30px 0;">
                            <p><strong>What you can do after verification:</strong></p>
                            <ul>
                                <li>
                                    <img src="%s" class="icon" alt="construction">
                                    Report damage in your area
                                </li>
                                <li>
                                    <img src="%s" class="icon" alt="chart">
                                    Track your reports status
                                </li>
                                <li>
                                    <img src="%s" class="icon" alt="chat">
                                    Communicate with municipal officers
                                </li>
                                <li>
                                    <img src="%s" class="icon" alt="dashboard">
                                    View your dashboard with statistics
                                </li>
                            </ul>
                        </div>
                        <div class="footer">
                            <p>Best regards,<br>Zastra Team</p>
                        </div>
                    </div>
                </body>
                </html>
                """,
                firstName,
                getIconUrl("welcome.png"),
                verificationUrl,
                getIconUrl("verify-email.png"),
                verificationUrl,
                getIconUrl("report-damage.png"),
                getIconUrl("track-report.png"),
                getIconUrl("communicate-directly.png"),
                getIconUrl("personal-dashboard.png")
            );
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
                            <h1>
                                <img src="%s" class="icon" alt="party">
                                Account Verified!
                            </h1>
                        </div>
                        <div class="content">
                            <h2>Welcome %s!</h2>
                            <p>Congratulations! Your email has been successfully verified and your account is now active.</p>
                
                            <div style="text-align: center;">
                                <a href="%s" class="button">
                                <img src="%s" class="icon" alt="rocket">
                                Start Reporting</a>
                            </div>
                
                            <p><strong>You can now:</strong></p>
                            <ul>
                                <li>
                                    <img src="%s" class="icon" alt="construction">
                                    Report damage in your area with photos
                                </li>
                                <li>
                                    <img src="%s" class="icon" alt="location">
                                    Use GPS location for accurate reporting
                                </li>
                                <li>
                                    <img src="%s" class="icon" alt="chart">
                                    Track your reports status in real-time
                                </li>
                                <li>
                                    <img src="%s" class="icon" alt="chat">
                                    Communicate directly with municipal officers
                                </li>
                                <li>
                                    <img src="%s" class="icon" alt="dashboard">
                                    View your personal dashboard with statistics
                                </li>
                            </ul>
                            <p>Thank you for helping make our community better and safer!</p>
                        </div>
                        <div class="footer">
                            <p>Best regards,<br>ZastraTeam</p>
                        </div>
                    </div>
                </body>
                </html>
                """,
                getIconUrl("account-verified.png"),
                firstName,
                loginUrl,
                getIconUrl("start-reporting.png"),
                getIconUrl("use-gps.png"),
                getIconUrl("track-report.png"),
                getIconUrl("use-gps.png"),
                getIconUrl("communicate-directly.png"),
                getIconUrl("personal-dashboard.png")
            );

            helper.setText(htmlContent, true);
            mailSender.send(message);

            log.info("Welcome email sent successfully to: {}", toEmail);

        } catch (MessagingException e) {
            log.error("Failed to send welcome email to: {}", toEmail, e);
        }
    }

    public void sendReportStatusUpdateEmail(String toEmail, String firstName, String reportTitle, String newStatus) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Report Status Update - " + reportTitle);

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
                        .icon { width: 20px; height: 20px; vertical-align: middle; margin-right: 8px; }
                        .header-icon { width: 32px; height: 32px; vertical-align: middle; margin-right: 10px; }
                        .status-box { background-color: #9ecef; padding: 15px; border-radius: 5px; margin: 15px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>
                                <img src="%s" class="header-icon" alt="clipboard">
                                Report Status Update
                            </h1>
                        </div>
                        <div class="content">
                            <h2>Dear %s,</h2>
                            <p>Your damage report has been updated:</p>
                
                            <div class="status-box">
                                <p><strong>
                                    <img src="%s" class="icon" alt="report">
                                    Report:
                                </strong> %s</p>
                                <p><strong>
                                    <img src="%s" class="icon" alt="status">
                                    New Status:
                                </strong> %s</p>
                            </div>
                
                            <p>You can view more details and communicate with officers by logging into your dashboard:</p>
                
                            <div style="text-align: center;">
                                <a href="%s/dashboard" class="button">
                                    <img src="%s" class="icon" alt="dashboard">
                                    View Dashboard
                                </a>
                            </div>
                
                            <p>Thank you for helping improve our community!</p>
                        </div>
                        <div class="footer">
                            <p>Best regards,<br>Zastra Team</p>
                        </div>
                    </div>
                </body>
                </html>
                """,
                    getIconUrl("clipboard.png"),     // Header icon
                    firstName,
                    getIconUrl("report-damage.png"),  // Report icon
                    reportTitle,
                    getIconUrl("verify-email.png"),     // Status icon
                    newStatus,
                    frontendUrl,
                    getIconUrl("personal-dashboard.png")      // Button icon
            );

            helper.setText(htmlContent, true);
            mailSender.send(message);

            log.info("Status update email sent to: {}", toEmail);

        } catch (Exception e) {
            log.error("Failed to send status update email to: {}", toEmail, e);
        }
    }

    // New method to send password reset email
    public void sendPasswordResetEmail(String toEmail, String resetLink) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Password Reset Request");

            String htmlContent = String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #dc3545; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
                    .button { display: inline-block; background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                    .icon { width: 20px; height: 20px; vertical-align: middle; margin-right: 8px; }
                    .header-icon { width: 32px; height: 32px; vertical-align: middle; margin-right: 10px; }
                    .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 15px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>
                            <img src="%s" class="header-icon" alt="key">
                            Password Reset Request
                        </h1>
                    </div>
                    <div class="content">
                        <h2>Hello,</h2>
                        <p>We received a request to reset your password. You can reset your password by clicking the button below:</p>
            
                        <div style="text-align: center;">
                            <a href="%s" class="button">
                                <img src="%s" class="icon" alt="lock">
                                Reset Password
                            </a>
                        </div>
            
                        <p>If the button doesn't work, copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; background-color: #e9ecef; padding: 10px; border-radius: 4px;">%s</p>
            
                        <div class="warning">
                            <p><strong>
                                <img src="%s" class="icon" alt="warning">
                                Security Notice:
                            </strong></p>
                            <ul>
                                <li>This link will expire in 1 hour</li>
                                <li>If you didn't request this, please ignore this email</li>
                                <li>Your password will remain unchanged</li>
                            </ul>
                        </div>
                    </div>
                    <div class="footer">
                        <p>Best regards,<br>Zastra Team</p>
                    </div>
                </div>
            </body>
            </html>
            """,
                    getIconUrl("key.png"),           // Header icon
                    resetLink,
                    getIconUrl("lock.png"),          // Button icon
                    resetLink,
                    getIconUrl("warning.png")        // Warning icon (FIXED)
            );

            helper.setText(htmlContent, true);
            mailSender.send(message);

            log.info("Password reset email sent to: {}", toEmail);

        } catch (Exception e) {
            log.error("Failed to send password reset email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }
}


