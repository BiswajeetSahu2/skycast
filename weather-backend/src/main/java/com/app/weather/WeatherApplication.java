package com.app.weather;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * WeatherApplication — Spring Boot entry point.
 *
 * @SpringBootApplication is shorthand for:
 *   @Configuration     → this is a config class
 *   @EnableAutoConfiguration → auto-configure Spring based on classpath
 *   @ComponentScan     → scan this package for @Service, @Controller etc.
 */
@SpringBootApplication
public class WeatherApplication {
    public static void main(String[] args) {
        SpringApplication.run(WeatherApplication.class, args);
    }
}package com.app.weather;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * WeatherApplication — Spring Boot entry point.
 *
 * @SpringBootApplication is shorthand for:
 *   @Configuration     → this is a config class
 *   @EnableAutoConfiguration → auto-configure Spring based on classpath
 *   @ComponentScan     → scan this package for @Service, @Controller etc.
 */
@SpringBootApplication
public class WeatherApplication {
    public static void main(String[] args) {
        SpringApplication.run(WeatherApplication.class, args);
    }
}