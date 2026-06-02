package com.app.weather.controller;

import com.app.weather.dto.ForecastDTO;
import com.app.weather.dto.WeatherDTO;
import com.app.weather.service.WeatherService;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@Validated
public class WeatherController {

    private final WeatherService weatherService;

    public WeatherController(WeatherService weatherService) {
        this.weatherService = weatherService;
    }

    @GetMapping("/weather")
    public ResponseEntity<WeatherDTO> getWeather(
            @RequestParam @NotBlank(message = "City name cannot be blank") String city) {
        return ResponseEntity.ok(weatherService.getCurrentWeather(city.trim()));
    }

    @GetMapping("/weather/coords")
    public ResponseEntity<WeatherDTO> getWeatherByCoords(
            @RequestParam double lat,
            @RequestParam double lon) {
        return ResponseEntity.ok(weatherService.getCurrentWeatherByCoords(lat, lon));
    }

    @GetMapping("/forecast")
    public ResponseEntity<ForecastDTO> getForecast(
            @RequestParam @NotBlank(message = "City name cannot be blank") String city) {
        return ResponseEntity.ok(weatherService.getForecast(city.trim()));
    }

    @GetMapping("/forecast/coords")
    public ResponseEntity<ForecastDTO> getForecastByCoords(
            @RequestParam double lat,
            @RequestParam double lon) {
        return ResponseEntity.ok(weatherService.getForecastByCoords(lat, lon));
    }

    @GetMapping("/aqi")
    public ResponseEntity<WeatherService.AQIData> getAQI(
            @RequestParam double lat,
            @RequestParam double lon) {
        return ResponseEntity.ok(weatherService.getAQI(lat, lon));
    }

    @GetMapping("/suggestions")
    public ResponseEntity<List<Map<String, Object>>> getSuggestions(
            @RequestParam String q) {
        return ResponseEntity.ok(weatherService.getCitySuggestions(q.trim()));
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Weather backend is running");
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleError(RuntimeException ex) {
        return ResponseEntity.status(404).body(new ErrorResponse(ex.getMessage()));
    }

    public record ErrorResponse(String error) {}
}