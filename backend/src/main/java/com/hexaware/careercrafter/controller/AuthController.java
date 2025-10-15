package com.hexaware.careercrafter.controller;

import com.hexaware.careercrafter.dto.UserDTO;
import com.hexaware.careercrafter.entities.User;
import com.hexaware.careercrafter.repository.UserRepository;
import com.hexaware.careercrafter.security.JwtUtil;
import com.hexaware.careercrafter.service.EmailService;
import com.hexaware.careercrafter.service.IUserService;
import com.hexaware.careercrafter.service.OtpService;
import com.hexaware.careercrafter.security.CustomUserDetailsService;
import jakarta.validation.Valid;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/*
 * Rest Controller for authentication operations.
 * Handles user registration, login, forgot password, reset password, and OTP-based verification.
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
@Tag(name = "Authentication", description = "Authentication and registration APIs")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private IUserService userService;

    @Autowired
    private OtpService otpService;

    @Autowired
    private EmailService emailService;

    // ✅ Register User
    @Operation(summary = "Register a new user")
    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@Valid @RequestBody UserDTO userDTO) {
        if (userRepository.findByEmail(userDTO.getEmail()) != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email is already registered!");
        }
        userService.createUser(userDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body("User registered successfully!");
    }

    // ✅ Login
    @Operation(summary = "Login and retrieve a JWT token")
    @PostMapping("/login")
    public ResponseEntity<?> createToken(@RequestBody Map<String, String> loginData) throws Exception {
        String email = loginData.get("email");
        String password = loginData.get("password");

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, password)
            );
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }

        final UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        final String token = jwtUtil.generateToken(userDetails);
        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        return ResponseEntity.ok(response);
    }

    // ✅ Forgot Password - Send Reset Link via Email
    @Operation(summary = "Forgot password - send reset link via email")
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }

        var userOpt = userRepository.findByEmail(email);
        if (userOpt == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "No user found with this email"));
        }

        // Generate a unique token
        String token = UUID.randomUUID().toString();
        userService.savePasswordResetToken(userOpt.getUserId(), token);

        // Create reset link (frontend URL)
        String resetLink = "http://localhost:3000/reset-password?token=" + token;

        // Send the password reset email
        emailService.sendPasswordResetEmail(email, resetLink);

        return ResponseEntity.ok(Map.of(
                "message", "Password reset link sent to your email.",
                "email", email
        ));
    }

    // ✅ Reset Password using Token
    @Operation(summary = "Reset password using token and new password")
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");

        if (token == null || token.isEmpty() || newPassword == null || newPassword.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Token and new password are required"));
        }

        Integer userId = userService.getUserIdByResetToken(token);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Invalid or expired token"));
        }

        userService.updatePassword(userId, newPassword);
        userService.invalidateResetToken(token);

        return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
    }
    
    @Operation(summary = "Change password for logged-in user")
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> request) {
        String email = request.get("email"); // or get from JWT if authenticated
        String currentPassword = request.get("currentPassword");
        String newPassword = request.get("newPassword");

        if (currentPassword == null || currentPassword.isEmpty() ||
            newPassword == null || newPassword.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Current and new passwords are required"));
        }

        // Verify current password
        boolean valid = userService.verifyUserCredentials(email, currentPassword);
        if (!valid) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Current password is incorrect"));
        }

        // Update to new password
        User user = userRepository.findByEmail(email);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found"));
        }
        userService.updatePassword(user.getUserId(), newPassword);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));

    }


    // ✅ Send OTP
    @PostMapping("/send-otp")
    public ResponseEntity<String> sendOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body("Email is required");
        }

        String otp = otpService.generateOtp(email);
        emailService.sendOtpEmail(email, "Your OTP Code", "Your OTP is: " + otp);

        return ResponseEntity.ok("OTP sent to email");
    }

    // ✅ Verify OTP
    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");

        if (email == null || otp == null) {
            return ResponseEntity.badRequest().body("Email and OTP are required");
        }

        boolean verified = otpService.verifyOtp(email, otp);
        if (verified)
            return ResponseEntity.ok("OTP verified successfully");
        else
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid or expired OTP");
    }
}
