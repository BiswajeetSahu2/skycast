package com.app.weather.controller;

import com.app.weather.dto.ForecastDTO;
import com.app.weather.dto.WeatherDTO;
import com.app.weather.service.WeatherService;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * WeatherController — the HTTP entry point.
 *
 * DESIGN PRINCIPLE (Single Responsibility):
 *   This class does ONLY three things:
 *     1. Receives the HTTP request
 *     2. Validates the input
 *     3. Calls the service and returns the result
 *
 *   It does NOT contain business logic.
 *   It does NOT know about OpenWeather.
 *   It does NOT build DTOs.
 *   All of that lives in WeatherService.
 *
 * @RestController = @Controller + @ResponseBody
 *   Means every method automatically serializes its return value to JSON.
 *
 * @RequestMapping("/api") = all endpoints start with /api
 *
 * @Validated = enables @NotBlank etc. on method parameters
 */
@RestController
@RequestMapping("/api")
@Validated
public class WeatherController {

    private final WeatherService weatherService;

    // Constructor injection (preferred over @Autowired field injection)
    public WeatherController(WeatherService weatherService) {
        this.weatherService = weatherService;
    }


    // ════════════════════════════════════════════════════════════════════
    //  ENDPOINT 1: GET /api/weather?city=Balasore
    //
    //  Returns: WeatherDTO (current conditions)
    //
    //  Test in Postman:
    //    GET http://localhost:8080/api/weather?city=Balasore
    // ════════════════════════════════════════════════════════════════════

    @GetMapping("/weather")
    public ResponseEntity<WeatherDTO> getWeather(
            @RequestParam
            @NotBlank(message = "City name cannot be blank")
            String city) {

        WeatherDTO dto = weatherService.getCurrentWeather(city.trim());
        return ResponseEntity.ok(dto);
    }


    // ════════════════════════════════════════════════════════════════════
    //  ENDPOINT 2: GET /api/forecast?city=Balasore
    //
    //  Returns: ForecastDTO (hourly + 5-day summary)
    //
    //  Test in Postman:
    //    GET http://localhost:8080/api/forecast?city=Balasore
    // ════════════════════════════════════════════════════════════════════

    @GetMapping("/forecast")
    public ResponseEntity<ForecastDTO> getForecast(
            @RequestParam
            @NotBlank(message = "City name cannot be blank")
            String city) {

        ForecastDTO dto = weatherService.getForecast(city.trim());
        return ResponseEntity.ok(dto);
    }


    // ════════════════════════════════════════════════════════════════════
    //  ENDPOINT 3: GET /api/health
    //
    //  Simple health check — confirm backend is running.
    //  Test in browser: http://localhost:8080/api/health
    // ════════════════════════════════════════════════════════════════════

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Weather backend is running ✅");
    }


    // ════════════════════════════════════════════════════════════════════
    //  GLOBAL ERROR HANDLING
    //  When WeatherService throws RuntimeException (e.g. city not found),
    //  this catches it and returns a proper 404 JSON instead of a 500.
    // ════════════════════════════════════════════════════════════════════

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleError(RuntimeException ex) {
        return ResponseEntity
            .status(404)
            .body(new ErrorResponse(ex.getMessage()));
    }

    /** Simple error body sent to the client */
    public record ErrorResponse(String error) {}
}