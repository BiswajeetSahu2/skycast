package com.app.weather.service;

import com.app.weather.dto.ForecastDTO;
import com.app.weather.dto.WeatherDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * WeatherService — the ONLY place that knows about OpenWeather.
 *
 * LAYER RESPONSIBILITIES:
 *   Controller → receives HTTP request, delegates here
 *   Service    → calls external API, maps to DTOs, returns clean data
 *   Controller → receives DTO, sends to client as JSON
 *
 * The controller never sees raw OpenWeather JSON.
 * The frontend never sees our API key or raw OpenWeather structure.
 */
@Service
public class WeatherService {

    // ── Injected from application.properties ─────────────────────────────
    @Value("${openweather.api.key}")
    private String apiKey;

    @Value("${openweather.base.url}")
    private String baseUrl;

    // ── RestTemplate: Spring's HTTP client ───────────────────────────────
    // We create one instance and reuse it (it is thread-safe).
    private final RestTemplate restTemplate = new RestTemplate();

    // ── Formatters ────────────────────────────────────────────────────────
    private static final DateTimeFormatter TIME_FMT =
            DateTimeFormatter.ofPattern("HH:mm").withZone(ZoneId.of("UTC"));
    private static final DateTimeFormatter DAY_FMT  =
            DateTimeFormatter.ofPattern("EEE").withZone(ZoneId.of("UTC"));


    // ════════════════════════════════════════════════════════════════════
    //  PUBLIC METHOD 1: getCurrentWeather(city)
    //  Called by: WeatherController → GET /api/weather?city=Balasore
    // ════════════════════════════════════════════════════════════════════

    /**
     * @Cacheable: after the first call for a city, the result is stored
     * in memory. The next call with the same city name returns instantly
     * WITHOUT hitting OpenWeather again. (Phase A: simple in-memory cache)
     */
    @Cacheable(value = "weather", key = "#city.toLowerCase()")
    public WeatherDTO getCurrentWeather(String city) {

        String url = String.format(
            "%s/weather?q=%s&appid=%s&units=metric",
            baseUrl, city, apiKey
        );

        try {
            // RestTemplate.getForObject calls the URL and deserializes
            // the JSON body into a Map<String, Object>
            @SuppressWarnings("unchecked")
            Map<String, Object> raw = restTemplate.getForObject(url, Map.class);

            return mapToWeatherDTO(raw);

        } catch (HttpClientErrorException.NotFound e) {
            // OpenWeather returns 404 for unknown cities
            throw new RuntimeException("City not found: " + city);
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch weather data: " + e.getMessage());
        }
    }


    // ════════════════════════════════════════════════════════════════════
    //  PUBLIC METHOD 2: getForecast(city)
    //  Called by: WeatherController → GET /api/forecast?city=Balasore
    // ════════════════════════════════════════════════════════════════════

    @Cacheable(value = "forecast", key = "#city.toLowerCase()")
    public ForecastDTO getForecast(String city) {

        String url = String.format(
            "%s/forecast?q=%s&appid=%s&units=metric",
            baseUrl, city, apiKey
        );

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> raw = restTemplate.getForObject(url, Map.class);

            return mapToForecastDTO(raw);

        } catch (HttpClientErrorException.NotFound e) {
            throw new RuntimeException("City not found: " + city);
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch forecast data: " + e.getMessage());
        }
    }


    // ════════════════════════════════════════════════════════════════════
    //  PRIVATE MAPPING METHODS
    //  These translate raw OpenWeather JSON → our clean DTOs
    // ════════════════════════════════════════════════════════════════════

    /**
     * Maps raw OpenWeather /weather response to WeatherDTO.
     *
     * Raw JSON structure (simplified):
     * {
     *   "name": "Balasore",
     *   "coord": { "lat": 21.49, "lon": 86.93 },
     *   "main":  { "temp": 37.0, "feels_like": 40.0, "humidity": 36, "pressure": 1005 },
     *   "weather": [ { "main": "Clear", "description": "clear sky", "icon": "01d" } ],
     *   "wind":  { "speed": 1.8, "deg": 200 },
     *   "visibility": 10000,
     *   "rain":  { "1h": 0.5 },
     *   "sys":   { "country": "IN", "sunrise": 1713318000, "sunset": 1713362000 },
     *   "dt":    1713330000
     * }
     */
    @SuppressWarnings("unchecked")
    private WeatherDTO mapToWeatherDTO(Map<String, Object> raw) {

        // ── Extract nested maps ───────────────────────────────────────────
        Map<String, Object> main    = (Map<String, Object>) raw.get("main");
        Map<String, Object> wind    = (Map<String, Object>) raw.get("wind");
        Map<String, Object> sys     = (Map<String, Object>) raw.get("sys");
        Map<String, Object> coord   = (Map<String, Object>) raw.get("coord");
        Map<String, Object> rain    = (Map<String, Object>) raw.getOrDefault("rain", Map.of());
        Map<String, Object> snow    = (Map<String, Object>) raw.getOrDefault("snow", Map.of());

        List<Map<String, Object>> weatherList =
                (List<Map<String, Object>>) raw.get("weather");
        Map<String, Object> weather = weatherList.get(0);

        // ── Build and return DTO ──────────────────────────────────────────
        return WeatherDTO.builder()

            // Location
            .city(    (String) raw.get("name"))
            .country( (String) sys.get("country"))
            .lat(     toDouble(coord.get("lat")))
            .lon(     toDouble(coord.get("lon")))

            // Temperature (already in °C because we pass units=metric)
            .temperature( toDouble(main.get("temp")))
            .feelsLike(   toDouble(main.get("feels_like")))
            .tempMin(     toDouble(main.get("temp_min")))
            .tempMax(     toDouble(main.get("temp_max")))

            // Condition
            .condition(  (String) weather.get("main"))
            .description((String) weather.get("description"))
            .icon(       (String) weather.get("icon"))

            // Atmosphere
            .humidity(   toInt(main.get("humidity")))
            .pressure(   toInt(main.get("pressure")))
            // OWM gives visibility in metres; we convert to km
            .visibility( toDouble(raw.getOrDefault("visibility", 0)) / 1000.0)

            // Wind: OWM gives m/s; multiply by 3.6 to get km/h
            .windSpeed(  toDouble(wind.get("speed")) * 3.6)
            .windDeg(    toInt(wind.getOrDefault("deg", 0)))

            // Precipitation (mm)
            .rainLastHour( toDouble(rain.getOrDefault("1h", 0.0)))
            .snowLastHour( toDouble(snow.getOrDefault("1h", 0.0)))

            // Sun
            .sunrise( toLong(sys.get("sunrise")))
            .sunset(  toLong(sys.get("sunset")))

            // Metadata
            .timestamp( toLong(raw.get("dt")))

            .build();
    }


    /**
     * Maps raw OpenWeather /forecast response to ForecastDTO.
     *
     * Raw JSON has a "list" array of up to 40 slots (3h intervals).
     * We split this into:
     *   - hourlySlots: first 8 slots for the chart
     *   - dailySummaries: one slot per day at 12:00
     */
    @SuppressWarnings("unchecked")
    private ForecastDTO mapToForecastDTO(Map<String, Object> raw) {

        Map<String, Object>       cityMap = (Map<String, Object>) raw.get("city");
        List<Map<String, Object>> list    = (List<Map<String, Object>>) raw.get("list");

        // ── Build hourly slots (first 8 = next 24h) ───────────────────────
        List<ForecastDTO.HourlySlot> hourlySlots = list.stream()
            .limit(8)
            .map(this::toHourlySlot)
            .collect(Collectors.toList());

        // ── Build daily summaries (12:00 slot per day) ────────────────────
        List<ForecastDTO.DailySummary> dailySummaries = list.stream()
            .filter(slot -> {
                String dtTxt = (String) slot.get("dt_txt");
                return dtTxt != null && dtTxt.contains("12:00:00");
            })
            .limit(5)
            .map(slot -> toDailySummary(slot, list))
            .collect(Collectors.toList());

        return ForecastDTO.builder()
            .city(    (String) cityMap.get("name"))
            .country( (String) ((Map<String, Object>) cityMap.get("country")).toString())
            .hourlySlots(hourlySlots)
            .dailySummaries(dailySummaries)
            .build();
    }


    @SuppressWarnings("unchecked")
    private ForecastDTO.HourlySlot toHourlySlot(Map<String, Object> slot) {

        Map<String, Object> main    = (Map<String, Object>) slot.get("main");
        Map<String, Object> wind    = (Map<String, Object>) slot.get("wind");
        List<Map<String, Object>> weatherList =
                (List<Map<String, Object>>) slot.get("weather");
        Map<String, Object> weather = weatherList.get(0);

        long dt    = toLong(slot.get("dt"));
        double pop = toDouble(slot.getOrDefault("pop", 0.0)); // probability 0-1

        return ForecastDTO.HourlySlot.builder()
            .dt(dt)
            .time(TIME_FMT.format(Instant.ofEpochSecond(dt)))
            .temperature(         toDouble(main.get("temp")))
            .feelsLike(           toDouble(main.get("feels_like")))
            .humidity(            toInt(main.get("humidity")))
            .windSpeed(           toDouble(wind.get("speed")) * 3.6)
            .condition(           (String) weather.get("main"))
            .icon(                (String) weather.get("icon"))
            .precipitationChance( (int) Math.round(pop * 100))
            .build();
    }


    /**
     * For the daily summary we use the 12:00 slot for conditions,
     * but scan all slots for that day to find true min/max temps.
     */
    @SuppressWarnings("unchecked")
    private ForecastDTO.DailySummary toDailySummary(
            Map<String, Object> noonSlot,
            List<Map<String, Object>> allSlots) {

        Map<String, Object> main    = (Map<String, Object>) noonSlot.get("main");
        List<Map<String, Object>> weatherList =
                (List<Map<String, Object>>) noonSlot.get("weather");
        Map<String, Object> weather = weatherList.get(0);

        long dt       = toLong(noonSlot.get("dt"));
        String dayKey = noonSlot.get("dt_txt").toString().substring(0, 10); // "2024-04-15"

        // Scan all slots for same day to find real min/max
        List<Map<String, Object>> sameDay = allSlots.stream()
            .filter(s -> s.get("dt_txt").toString().startsWith(dayKey))
            .collect(Collectors.toList());

        double min = sameDay.stream()
            .mapToDouble(s -> toDouble(((Map<String, Object>) s.get("main")).get("temp_min")))
            .min().orElse(toDouble(main.get("temp_min")));

        double max = sameDay.stream()
            .mapToDouble(s -> toDouble(((Map<String, Object>) s.get("main")).get("temp_max")))
            .max().orElse(toDouble(main.get("temp_max")));

        double pop = toDouble(noonSlot.getOrDefault("pop", 0.0));

        return ForecastDTO.DailySummary.builder()
            .dt(dt)
            .dayName(DAY_FMT.format(Instant.ofEpochSecond(dt)))
            .tempDay(     toDouble(main.get("temp")))
            .tempMin(min)
            .tempMax(max)
            .condition(   (String) weather.get("main"))
            .icon(        (String) weather.get("icon"))
            .humidity(    toInt(main.get("humidity")))
            .precipitationChance((int) Math.round(pop * 100))
            .build();
    }


    // ════════════════════════════════════════════════════════════════════
    //  TYPE-SAFE CONVERSION HELPERS
    //  OpenWeather returns numbers as either Integer or Double depending
    //  on the field. These helpers handle both without ClassCastException.
    // ════════════════════════════════════════════════════════════════════

    private double toDouble(Object val) {
        if (val == null)             return 0.0;
        if (val instanceof Double d) return d;
        if (val instanceof Integer i) return i.doubleValue();
        if (val instanceof Long l)   return l.doubleValue();
        return Double.parseDouble(val.toString());
    }

    private int toInt(Object val) {
        if (val == null)              return 0;
        if (val instanceof Integer i) return i;
        if (val instanceof Double d)  return d.intValue();
        return Integer.parseInt(val.toString());
    }

    private long toLong(Object val) {
        if (val == null)              return 0L;
        if (val instanceof Long l)    return l;
        if (val instanceof Integer i) return i.longValue();
        return Long.parseLong(val.toString());
    }
}