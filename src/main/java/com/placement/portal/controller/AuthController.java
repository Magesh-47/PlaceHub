package com.placement.portal.controller;

import com.placement.portal.dto.LoginRequest;
import com.placement.portal.dto.LoginResponse;
import com.placement.portal.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(
            @Valid @RequestBody com.placement.portal.dto.ChangePasswordRequest request,
            java.security.Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        authService.changePassword(principal.getName(), request.getCurrentPassword(), request.getNewPassword());
        return ResponseEntity.ok().build();
    }
}
