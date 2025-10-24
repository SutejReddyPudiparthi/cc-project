package com.hexaware.careercrafter.service;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    private static class OtpEntry {
        String otp;
        LocalDateTime expiry;

        OtpEntry(String otp, LocalDateTime expiry) {
            this.otp = otp;
            this.expiry = expiry;
        }
    }

    private final Map<String, OtpEntry> otpStore = new ConcurrentHashMap<>();

    public String generateOtp(String email) {
        String otp = String.valueOf((int)(Math.random() * 900000) + 100000);
        OtpEntry entry = new OtpEntry(otp, LocalDateTime.now().plusMinutes(5));
        otpStore.put(email, entry);
        return otp;
    }

    public boolean verifyOtp(String email, String otp) {
        OtpEntry entry = otpStore.get(email);
        if (entry == null) return false;
        if (entry.expiry.isBefore(LocalDateTime.now())) {
            otpStore.remove(email);
            return false;
        }
        boolean valid = entry.otp.equals(otp);
        if (valid) otpStore.remove(email);
        return valid;
    }
}
