package com.app.weather.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CorsConfig — Cross-Origin Resource Sharing configuration.
 *
 * WHY THIS IS NEEDED:
 *   Your React app runs on http://localhost:5173 (Vite)
 *   Your Spring Boot backend runs on http://localhost:8080
 *
 *   Browsers block cross-origin requests by default (CORS policy).
 *   Without this config, every request from React to Spring would fail with:
 *     "Access to fetch blocked by CORS policy"
 *
 * WHAT THIS DOES:
 *   Tells Spring: "It is okay to accept requests from these origins."
 *
 * PHASE A: We allow localhost only (development).
 * PHASE D: We will restrict this to our production domain only.
 */
@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    // Allow React dev servers (Vite default: 5173, CRA default: 3000)
                    .allowedOrigins(
                        "http://localhost:5173",
                        "http://localhost:3000",
                        "http://127.0.0.1:5173"
                    )
                    .allowedMethods("GET", "POST", "DELETE", "OPTIONS")
                    .allowedHeaders("*")
                    // Allow credentials (needed for JWT cookies in Phase D)
                    .allowCredentials(true)
                    .maxAge(3600); // Cache preflight response for 1 hour
            }
        };
    }
}