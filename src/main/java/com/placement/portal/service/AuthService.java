package com.placement.portal.service;

import com.placement.portal.dto.LoginRequest;
import com.placement.portal.dto.LoginResponse;
import com.placement.portal.entity.User;
import com.placement.portal.exception.UnauthorizedException;
import com.placement.portal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new UnauthorizedException("Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid username or password");
        }

        if (!user.getEnabled()) {
            throw new UnauthorizedException("Account is disabled");
        }

        String token = jwtService.generateToken(user.getUsername(), user.getRole().name());

        return new LoginResponse(token, user.getRole().name(), user.getId(), user.getUsername());
    }

    @Autowired
    private EmailService emailService;

    public String generateAdminOtp(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        if (user.getRole() != User.Role.ADMIN) {
            throw new UnauthorizedException("Only admins can request OTP");
        }

        String otp = String.format("%06d", new java.util.Random().nextInt(999999));
        user.setOtp(otp);
        user.setOtpExpiry(java.time.LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        try {
            emailService.sendOtp("studentplacementhub@gmail.com", otp);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send OTP email: " + e.getMessage());
        }
        return "OTP sent successfully to registered email";
    }

    public void verifyAdminOtpAndChangePassword(String username, String otp, String newPassword) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        if (user.getOtp() == null || !user.getOtp().equals(otp)) {
            throw new UnauthorizedException("Invalid OTP");
        }

        if (user.getOtpExpiry().isBefore(java.time.LocalDateTime.now())) {
            throw new UnauthorizedException("OTP expired");
        }

        // Clear OTP and update password
        user.setOtp(null);
        user.setOtpExpiry(null);
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public void resetStudentPassword(Long studentId, String newPassword) {
        if (studentId == null) {
            throw new UnauthorizedException("Student ID is required");
        }
        User user = userRepository.findById(studentId)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        if (user.getRole() != User.Role.STUDENT) {
            throw new UnauthorizedException("Only students' passwords can be reset via this endpoint");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public void changePassword(String username, String currentPassword, String newPassword) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new UnauthorizedException("Invalid current password");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
