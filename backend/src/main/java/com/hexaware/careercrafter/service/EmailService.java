package com.hexaware.careercrafter.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.hexaware.careercrafter.repository.UserRepository;
import com.hexaware.careercrafter.entities.User;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private UserRepository userRepository;

    // ✅ Existing methods (keep them)
    public void sendOtpEmail(String to, String subject, String description) {
        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setTo(to);
        mailMessage.setSubject(subject);
        mailMessage.setText(description);
        mailSender.send(mailMessage);
    }

    public void sendPasswordResetEmail(String to, String resetLink) {
        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setTo(to);
        mailMessage.setSubject("Password Reset Request - CareerCrafter");
        mailMessage.setText("Hi,\n\nWe received a request to reset your password. "
                + "Please click the link below to set a new password:\n\n"
                + resetLink
                + "\n\nThis link will expire in 1 hour.\n\n"
                + "If you didn’t request this, please ignore this email.");
        mailSender.send(mailMessage);
    }

    public void sendNotificationEmail(Integer userId, String subject, String message) {
        User user = userRepository.findById(userId).orElse(null);
        if (user != null && user.getEmail() != null) {
            sendEmail(user.getEmail(), subject, message);
        }
    }


    // ✅ Utility method for plain email sending
    public void sendEmail(String toEmail, String subject, String body) {
        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setTo(toEmail);
            mailMessage.setSubject(subject);
            mailMessage.setText(body);
            mailSender.send(mailMessage);
        } catch (Exception e) {
            System.err.println("Error sending email: " + e.getMessage());
        }
    }
}
