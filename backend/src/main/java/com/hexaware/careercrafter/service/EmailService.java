package com.hexaware.careercrafter.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
	
	@Autowired
    private JavaMailSender mailSender;

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

}
