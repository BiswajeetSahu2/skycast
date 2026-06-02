package com.app.weather.service;

import com.app.weather.model.User;
import com.app.weather.model.RefreshToken;
import com.app.weather.repository.UserRepository;
import com.app.weather.repository.RefreshTokenRepository;
import com.app.weather.repository.FavoriteRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final FavoriteRepository favoriteRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecretKey jwtSigningKey;
    private final long jwtExpirationMs;
    private final long refreshExpirationMs;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthService(
            UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            FavoriteRepository favoriteRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.jwt.secret}") String jwtSecret,
            @Value("${app.jwt.expiration-ms:900000}") long jwtExpirationMs,
            @Value("${app.jwt.refresh-expiration-ms:604800000}") long refreshExpirationMs) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.favoriteRepository = favoriteRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtSigningKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        this.jwtExpirationMs = jwtExpirationMs;
        this.refreshExpirationMs = refreshExpirationMs;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.email());

        if (userRepository.existsByEmail(email)) {
            throw new AuthException("Email is already registered");
        }

        User user = new User();
        user.setName(request.name().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setEmailVerificationToken(randomToken());
        user.setEmailVerificationExpiresAt(Instant.now().plusMillis(refreshExpirationMs));

        User savedUser = userRepository.save(user);
        return buildAuthResponse(savedUser);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String email = normalizeEmail(request.email());
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new AuthException("Invalid email or password");
        }

        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse refresh(RefreshRequest request) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.refreshToken())
                .orElseThrow(() -> new AuthException("Invalid refresh token"));

        if (refreshToken.isRevoked() || refreshToken.getExpiresAt().isBefore(Instant.now())) {
            throw new AuthException("Invalid refresh token");
        }

        refreshToken.setRevoked(true);
        return buildAuthResponse(refreshToken.getUser());
    }

    @Transactional
    public void logout(RefreshRequest request) {
        refreshTokenRepository.findByToken(request.refreshToken())
                .ifPresent(token -> token.setRevoked(true));
    }

    @Transactional
    public TokenResponse requestPasswordReset(EmailRequest request) {
        User user = userRepository.findByEmail(normalizeEmail(request.email()))
                .orElseThrow(() -> new AuthException("No account found for that email"));
        user.setPasswordResetToken(randomToken());
        user.setPasswordResetExpiresAt(Instant.now().plusMillis(900_000));
        return new TokenResponse(user.getPasswordResetToken(), "Use this token to reset the password.");
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByPasswordResetToken(request.token())
                .orElseThrow(() -> new AuthException("Invalid reset token"));

        if (user.getPasswordResetExpiresAt() == null || user.getPasswordResetExpiresAt().isBefore(Instant.now())) {
            throw new AuthException("Reset token has expired");
        }

        user.setPassword(passwordEncoder.encode(request.password()));
        user.setPasswordResetToken(null);
        user.setPasswordResetExpiresAt(null);
        refreshTokenRepository.deleteByUser(user);
    }

    @Transactional
    public TokenResponse requestEmailVerification(EmailRequest request) {
        User user = userRepository.findByEmail(normalizeEmail(request.email()))
                .orElseThrow(() -> new AuthException("No account found for that email"));
        user.setEmailVerificationToken(randomToken());
        user.setEmailVerificationExpiresAt(Instant.now().plusMillis(refreshExpirationMs));
        return new TokenResponse(user.getEmailVerificationToken(), "Use this token to verify the email.");
    }

    @Transactional
    public void verifyEmail(TokenRequest request) {
        User user = userRepository.findByEmailVerificationToken(request.token())
                .orElseThrow(() -> new AuthException("Invalid verification token"));

        if (user.getEmailVerificationExpiresAt() == null
                || user.getEmailVerificationExpiresAt().isBefore(Instant.now())) {
            throw new AuthException("Verification token has expired");
        }

        user.setEmailVerified(true);
        user.setEmailVerificationToken(null);
        user.setEmailVerificationExpiresAt(null);
    }

    @Transactional(readOnly = true)
    public User currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new AuthException("Authentication required");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new AuthException("Authentication required"));
    }

    @Transactional
    public void deleteCurrentAccount() {
        User user = currentUser();
        refreshTokenRepository.deleteByUser(user);
        favoriteRepository.deleteByUser(user);
        userRepository.delete(user);
    }

    public TokenUser readAccessToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(jwtSigningKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return new TokenUser(
                claims.getSubject(),
                String.valueOf(claims.get("role", String.class)));
    }

    private AuthResponse buildAuthResponse(User user) {
        String token = createToken(user);
        RefreshToken refreshToken = createRefreshToken(user);
        return new AuthResponse(
                token,
                refreshToken.getToken(),
                "Bearer",
                jwtExpirationMs,
                refreshExpirationMs,
                new UserProfile(user.getId(), user.getName(), user.getEmail(), user.getRole().name(), user.isEmailVerified()));
    }

    private String createToken(User user) {
        Instant now = Instant.now();
        Instant expiresAt = now.plusMillis(jwtExpirationMs);

        return Jwts.builder()
                .subject(user.getEmail())
                .claim("userId", user.getId())
                .claim("name", user.getName())
                .claim("role", user.getRole().name())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiresAt))
                .signWith(jwtSigningKey)
                .compact();
    }

    private RefreshToken createRefreshToken(User user) {
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setToken(randomToken());
        refreshToken.setExpiresAt(Instant.now().plusMillis(refreshExpirationMs));
        return refreshTokenRepository.save(refreshToken);
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }

    private String randomToken() {
        byte[] bytes = new byte[48];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    public record RegisterRequest(String name, String email, String password) {}

    public record LoginRequest(String email, String password) {}

    public record RefreshRequest(String refreshToken) {}

    public record EmailRequest(String email) {}

    public record TokenRequest(String token) {}

    public record ResetPasswordRequest(String token, String password) {}

    public record AuthResponse(
            String accessToken,
            String refreshToken,
            String tokenType,
            long expiresInMs,
            long refreshExpiresInMs,
            UserProfile user) {}

    public record UserProfile(Long id, String name, String email, String role, boolean emailVerified) {}

    public record TokenUser(String email, String role) {}

    public record TokenResponse(String token, String message) {}

    public static class AuthException extends RuntimeException {
        public AuthException(String message) {
            super(message);
        }
    }
}
