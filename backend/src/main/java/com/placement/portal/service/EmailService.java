package com.placement.portal.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.email.from}")
    private String fromEmail;

    @org.springframework.scheduling.annotation.Async
    public void sendApplicationConfirmation(String toEmail, String studentName, String companyName, String jobRole) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Application Received - " + companyName);

            String body = String.format(
                    "Dear %s,\n\n" +
                            "Your application for the role of %s at %s has been successfully received.\n\n" +
                            "It is currently under review. The company will notify you once there is an update.\n\n" +
                            "Best regards,\n" +
                            "Student Placement Hub Team",
                    studentName, jobRole, companyName);

            message.setText(body);
            mailSender.send(message);
        } catch (Exception e) {
            // Log error but don't fail the application process
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }

    public void sendOtp(String toEmail, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Password Reset OTP - Admin");

            String body = String.format(
                    "Dear Admin,\n\n" +
                            "Your One-Time Password (OTP) for password change is: %s\n\n" +
                            "This OTP is valid for 10 minutes.\n\n" +
                            "If you did not request this, please ignore this email.\n\n" +
                            "Best regards,\n" +
                            "Student Placement Hub Team",
                    otp);

            message.setText(body);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send OTP email: " + e.getMessage());
            throw new RuntimeException("Email sending failed: " + e.getMessage(), e);
        }
    }
}
