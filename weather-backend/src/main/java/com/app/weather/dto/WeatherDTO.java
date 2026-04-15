package com.app.weather.dto;

import lombok.Builder;
import lombok.Data;

/**
 * WeatherDTO — the exact shape of data we send to the React frontend.
 *
 * DESIGN PRINCIPLE:
 *   OpenWeather gives us ~60 fields. We expose exactly what the UI needs.
 *   This protects the frontend from upstream API changes, and prevents
 *   accidentally leaking internal data (like our API key or raw coordinates).
 *
 * This class uses Lombok:
 *   @Data    → generates getters, setters, equals, hashCode, toString
 *   @Builder → lets us build the object like:
 *              WeatherDTO.builder().city("Balasore").temp(37.0).build()
 */
@Data
@Builder
public class WeatherDTO {

    // ── Location ──────────────────────────────────────────────────────────
    private String  city;           // "Balasore"
    private String  country;        // "IN"
    private double  lat;
    private double  lon;

    // ── Temperature ───────────────────────────────────────────────────────
    private double  temperature;    // current temp in °C
    private double  feelsLike;      // perceived temp in °C
    private double  tempMin;        // day low
    private double  tempMax;        // day high

    // ── Condition ─────────────────────────────────────────────────────────
    private String  condition;      // "Clear", "Rain", "Clouds" etc.
    private String  description;    // "clear sky", "light rain" etc.
    private String  icon;           // OWM icon code e.g. "01d" — frontend uses this

    // ── Atmosphere ────────────────────────────────────────────────────────
    private int     humidity;       // % relative humidity
    private int     pressure;       // hPa
    private double  visibility;     // metres → we convert to km in the service

    // ── Wind ──────────────────────────────────────────────────────────────
    private double  windSpeed;      // m/s from OWM → we convert to km/h
    private int     windDeg;        // direction in degrees

    // ── Precipitation (mm in last 1h — 0 if dry) ─────────────────────────
    private double  rainLastHour;
    private double  snowLastHour;

    // ── Sun ───────────────────────────────────────────────────────────────
    private long    sunrise;        // Unix timestamp
    private long    sunset;         // Unix timestamp

    // ── Metadata ─────────────────────────────────────────────────────────
    private long    timestamp;      // when this data was fetched (Unix)
}