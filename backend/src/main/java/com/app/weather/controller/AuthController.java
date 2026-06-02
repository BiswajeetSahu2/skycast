package com.app.weather.controller;

import com.app.weather.service.AuthService;
import com.app.weather.service.AuthService.AuthException;
import com.app.weather.service.AuthService.AuthResponse;
import com.app.weather.service.AuthService.EmailRequest;
import com.app.weather.service.AuthService.LoginRequest;
import com.app.weather.service.AuthService.RefreshRequest;
import com.app.weather.service.AuthService.RegisterRequest;
import com.app.weather.service.AuthService.ResetPasswordRequest;
import com.app.weather.service.AuthService.TokenRequest;
import com.app.weather.service.AuthService.TokenResponse;
import com.app.weather.service.AuthService.UserProfile;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@Validated
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterPayload payload) {
        AuthResponse response = authService.register(
                new RegisterRequest(payload.name(), payload.email(), payload.password()));
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginPayload payload) {
        AuthResponse response = authService.login(new LoginRequest(payload.email(), payload.password()));
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshPayload payload) {
        return ResponseEntity.ok(authService.refresh(new RefreshRequest(payload.refreshToken())));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@Valid @RequestBody RefreshPayload payload) {
        authService.logout(new RefreshRequest(payload.refreshToken()));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<TokenResponse> forgotPassword(@Valid @RequestBody EmailPayload payload) {
        return ResponseEntity.ok(authService.requestPasswordReset(new EmailRequest(payload.email())));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordPayload payload) {
        authService.resetPassword(new ResetPasswordRequest(payload.token(), payload.password()));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/email-verification")
    public ResponseEntity<TokenResponse> requestEmailVerification(@Valid @RequestBody EmailPayload payload) {
        return ResponseEntity.ok(authService.requestEmailVerification(new EmailRequest(payload.email())));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<Void> verifyEmail(@Valid @RequestBody TokenPayload payload) {
        authService.verifyEmail(new TokenRequest(payload.token()));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfile> me(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        var user = authService.currentUser();
        return ResponseEntity.ok(new UserProfile(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                user.isEmailVerified()));
    }

    @DeleteMapping("/account")
    public ResponseEntity<Void> deleteAccount() {
        authService.deleteCurrentAccount();
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(AuthException.class)
    public ResponseEntity<ErrorResponse> handleAuthError(AuthException ex) {
        HttpStatus status = ex.getMessage().contains("already registered")
                ? HttpStatus.CONFLICT
                : HttpStatus.UNAUTHORIZED;
        return ResponseEntity.status(status).body(new ErrorResponse(ex.getMessage()));
    }

    public record RegisterPayload(
            @NotBlank(message = "Name is required")
            @Size(max = 80, message = "Name must be 80 characters or fewer")
            String name,

            @NotBlank(message = "Email is required")
            @Email(message = "Email must be valid")
            @Size(max = 120, message = "Email must be 120 characters or fewer")
            String email,

            @NotBlank(message = "Password is required")
            @Size(min = 8, max = 72, message = "Password must be between 8 and 72 characters")
            String password) {}

    public record LoginPayload(
            @NotBlank(message = "Email is required")
            @Email(message = "Email must be valid")
            String email,

            @NotBlank(message = "Password is required")
            String password) {}

    public record RefreshPayload(
            @NotBlank(message = "Refresh token is required")
            String refreshToken) {}

    public record EmailPayload(
            @NotBlank(message = "Email is required")
            @Email(message = "Email must be valid")
            String email) {}

    public record TokenPayload(
            @NotBlank(message = "Token is required")
            String token) {}

    public record ResetPasswordPayload(
            @NotBlank(message = "Token is required")
            String token,

            @NotBlank(message = "Password is required")
            @Size(min = 8, max = 72, message = "Password must be between 8 and 72 characters")
            String password) {}

    public record ErrorResponse(String error) {}
}
