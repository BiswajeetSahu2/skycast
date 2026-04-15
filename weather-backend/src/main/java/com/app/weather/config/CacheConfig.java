package com.app.weather.config;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Configuration;

/**
 * CacheConfig — enables Spring's caching infrastructure.
 *
 * Without @EnableCaching, the @Cacheable annotations in WeatherService
 * are silently ignored — every call goes to OpenWeather every time.
 *
 * With @EnableCaching + spring.cache.type=simple (in application.properties),
 * Spring uses a ConcurrentHashMap as the cache store.
 *
 * Phase B upgrade: swap "simple" for Redis by changing one property
 * and adding the Redis dependency. No service code changes needed.
 */
@Configuration
@EnableCaching
public class CacheConfig {
    // No beans needed for simple in-memory cache.
    // @EnableCaching does the work.
}