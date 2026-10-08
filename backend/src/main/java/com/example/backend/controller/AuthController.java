package com.example.backend.controller;

import com.example.backend.dto.auth.AuthResponse;
import com.example.backend.dto.auth.LoginRequest;
import com.example.backend.dto.auth.RegisterRequest;
import com.example.backend.dto.auth.UserResponse;
import com.example.backend.service.AuthRateLimiter;
import com.example.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final AuthRateLimiter authRateLimiter;

    public AuthController(
            AuthService authService,
            AuthRateLimiter authRateLimiter
    ) {
        this.authService = authService;
        this.authRateLimiter = authRateLimiter;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse register(
            @Valid @RequestBody RegisterRequest request
    ) {
        authRateLimiter.checkRegistration(request.email());
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(
            @Valid @RequestBody LoginRequest request
    ) {
        authRateLimiter.checkLogin(request.email());
        return authService.login(request);
    }
}
