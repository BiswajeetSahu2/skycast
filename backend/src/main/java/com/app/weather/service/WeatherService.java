package com.app.weather.service;

import com.app.weather.dto.ForecastDTO;
import com.app.weather.dto.WeatherDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class WeatherService {

    /** Returned when UV index is unavailable; frontend renders a dash. */
    private static final double UVI_UNAVAILABLE = -1.0;
    /** Returned when dew point is unavailable; frontend renders a dash. */
    private static final double DEW_POINT_UNAVAILABLE = -999.0;
    /** Returned when wind gust is not reported by OpenWeather. */
    private static final double WIND_GUST_UNAVAILABLE = -1.0;

    @Value("${openweather.api.key}")
    private String apiKey;

    @Value("${openweather.base.url}")
    private String baseUrl;

    // Optional One Call API 3.0 endpoint; override in application.properties if needed.
    @Value("${openweather.onecall.url:https://api.openweathermap.org/data/3.0/onecall}")
    private String oneCallUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    private static final DateTimeFormatter TIME_FMT
            = DateTimeFormatter.ofPattern("HH:mm").withZone(ZoneId.of("UTC"));

    private static final DateTimeFormatter DAY_FMT
            = DateTimeFormatter.ofPattern("EEE").withZone(ZoneId.of("UTC"));

    @Cacheable(value = "weather", key = "#city.toLowerCase()")
    public WeatherDTO getCurrentWeather(String city) {
        return fetchWeather(
                String.format("%s/weather?q=%s&appid=%s&units=metric", baseUrl, city, apiKey),
                city
        );
    }

    @Cacheable(value = "forecast", key = "#city.toLowerCase()")
    public ForecastDTO getForecast(String city) {
        return fetchForecast(
                String.format("%s/forecast?q=%s&appid=%s&units=metric", baseUrl, city, apiKey),
                city
        );
    }

    @Cacheable(value = "weatherCoords", key = "#lat + ':' + #lon")
    public WeatherDTO getCurrentWeatherByCoords(double lat, double lon) {
        return fetchWeather(
                String.format("%s/weather?lat=%s&lon=%s&appid=%s&units=metric", baseUrl, lat, lon, apiKey),
                "coords"
        );
    }

    @Cacheable(value = "forecastCoords", key = "#lat + ':' + #lon")
    public ForecastDTO getForecastByCoords(double lat, double lon) {
        return fetchForecast(
                String.format("%s/forecast?lat=%s&lon=%s&appid=%s&units=metric", baseUrl, lat, lon, apiKey),
                "coords"
        );
    }

    @Cacheable(value = "aqi", key = "#lat + ':' + #lon")
    public AQIData getAQI(double lat, double lon) {
        try {
            String url = String.format("%s/air_pollution?lat=%s&lon=%s&appid=%s", baseUrl, lat, lon, apiKey);

            @SuppressWarnings("unchecked")
            Map<String, Object> raw = restTemplate.getForObject(url, Map.class);

            if (raw == null) throw new RuntimeException("Empty AQI response");

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> list = (List<Map<String, Object>>) raw.get("list");

            if (list == null || list.isEmpty()) throw new RuntimeException("No AQI data");

            Map<String, Object> entry = list.get(0);

            @SuppressWarnings("unchecked")
            Map<String, Object> mainMap = (Map<String, Object>) entry.get("main");

            @SuppressWarnings("unchecked")
            Map<String, Object> comp = (Map<String, Object>) entry.get("components");

            return new AQIData(
                    toInt(mainMap.get("aqi")),
                    toDouble(comp.getOrDefault("co", 0.0)),
                    toDouble(comp.getOrDefault("no2", 0.0)),
                    toDouble(comp.getOrDefault("o3", 0.0)),
                    toDouble(comp.getOrDefault("so2", 0.0)),
                    toDouble(comp.getOrDefault("pm2_5", 0.0)),
                    toDouble(comp.getOrDefault("pm10", 0.0))
            );
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch AQI: " + e.getMessage());
        }
    }

    public record AQIData(
            int aqi,
            double co,
            double no2,
            double o3,
            double so2,
            double pm2_5,
            double pm10) {}

    @Scheduled(fixedRate = 600_000)
    @CacheEvict(value = {"weather", "forecast", "weatherCoords", "forecastCoords", "aqi", "suggestions"}, allEntries = true)
    public void evictAllCaches() {}

    private WeatherDTO fetchWeather(String url, String label) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> raw = restTemplate.getForObject(url, Map.class);
            WeatherDTO dto = mapToWeatherDTO(raw);

            // Basic /weather lacks dew point and UV; enrich from One Call when available.
            OneCallExtras extras = fetchOneCallExtras(dto.getLat(), dto.getLon());
            double dewPoint = extras.dewPoint() > DEW_POINT_UNAVAILABLE + 1
                    ? extras.dewPoint()
                    : dto.getDewPoint();
            
            return WeatherDTO.builder()
                    .city(dto.getCity())
                    .country(dto.getCountry())
                    .lat(dto.getLat())
                    .lon(dto.getLon())
                    .temperature(dto.getTemperature())
                    .feelsLike(dto.getFeelsLike())
                    .tempMin(dto.getTempMin())
                    .tempMax(dto.getTempMax())
                    .condition(dto.getCondition())
                    .description(dto.getDescription())
                    .icon(dto.getIcon())
                    .humidity(dto.getHumidity())
                    .pressure(dto.getPressure())
                    .visibility(dto.getVisibility())
                    .windSpeed(dto.getWindSpeed())
                    .windDeg(dto.getWindDeg())
                    .windGust(dto.getWindGust())
                    .dewPoint(dewPoint)
                    .clouds(dto.getClouds())
                    .uvi(extras.uvi())
                    .rainLastHour(dto.getRainLastHour())
                    .snowLastHour(dto.getSnowLastHour())
                    .sunrise(dto.getSunrise())
                    .sunset(dto.getSunset())
                    .timestamp(dto.getTimestamp())
                    .build();

        } catch (HttpClientErrorException.NotFound e) {
            throw new RuntimeException("City not found: " + label);
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch weather: " + e.getMessage());
        }
    }

    private ForecastDTO fetchForecast(String url, String label) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> raw = restTemplate.getForObject(url, Map.class);
            return mapToForecastDTO(raw);
        } catch (HttpClientErrorException.NotFound e) {
            throw new RuntimeException("City not found: " + label);
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch forecast: " + e.getMessage());
        }
    }

    private record OneCallExtras(double uvi, double dewPoint) {}

    /**
     * Fetches UV index and dew point from One Call API 3.0.
     * Returns sentinel values if the call fails so the frontend can show a dash gracefully.
     */
    private OneCallExtras fetchOneCallExtras(double lat, double lon) {
        try {
            String url = String.format(
                    "%s?lat=%s&lon=%s&exclude=minutely,hourly,daily,alerts&appid=%s&units=metric",
                    oneCallUrl, lat, lon, apiKey);

            @SuppressWarnings("unchecked")
            Map<String, Object> raw = restTemplate.getForObject(url, Map.class);

            if (raw == null) return new OneCallExtras(UVI_UNAVAILABLE, DEW_POINT_UNAVAILABLE);

            @SuppressWarnings("unchecked")
            Map<String, Object> current = (Map<String, Object>) raw.get("current");

            if (current == null) return new OneCallExtras(UVI_UNAVAILABLE, DEW_POINT_UNAVAILABLE);

            double uvi = toDouble(current.getOrDefault("uvi", UVI_UNAVAILABLE));
            double dewPoint = current.containsKey("dew_point")
                    ? toDouble(current.get("dew_point"))
                    : DEW_POINT_UNAVAILABLE;
            return new OneCallExtras(uvi, dewPoint);
        } catch (Exception e) {
            return new OneCallExtras(UVI_UNAVAILABLE, DEW_POINT_UNAVAILABLE);
        }
    }

    @SuppressWarnings("unchecked")
    private WeatherDTO mapToWeatherDTO(Map<String, Object> raw) {

        Map<String, Object> main   = (Map<String, Object>) raw.get("main");
        Map<String, Object> wind   = (Map<String, Object>) raw.get("wind");
        Map<String, Object> sys    = (Map<String, Object>) raw.get("sys");
        Map<String, Object> coord  = (Map<String, Object>) raw.get("coord");
        Map<String, Object> rain   = (Map<String, Object>) raw.getOrDefault("rain", Map.of());
        Map<String, Object> snow   = (Map<String, Object>) raw.getOrDefault("snow", Map.of());
        Map<String, Object> cloudsMap = (Map<String, Object>) raw.getOrDefault("clouds", Map.of());

        List<Map<String, Object>> wList = (List<Map<String, Object>>) raw.get("weather");
        if (wList == null || wList.isEmpty()) {
            throw new RuntimeException("No weather data available");
        }
        Map<String, Object> weather = wList.get(0);

        double lat = (coord != null) ? toDouble(coord.get("lat")) : 0.0;
        double lon = (coord != null) ? toDouble(coord.get("lon")) : 0.0;
        String country = (sys != null) ? Locale.of("", (String) sys.get("country")).getDisplayCountry(Locale.ENGLISH) : "Unknown";
        double windSpeed = (wind != null) ? toDouble(wind.get("speed")) * 3.6 : 0.0;
        double windGust = (wind != null && wind.containsKey("gust")) ? toDouble(wind.get("gust")) * 3.6 : WIND_GUST_UNAVAILABLE;
        int windDeg = (wind != null) ? toInt(wind.getOrDefault("deg", 0)) : 0;

        return WeatherDTO.builder()
                .city((String) raw.get("name"))
                .country(country)
                .lat(lat)
                .lon(lon)
                .temperature(toDouble(main.get("temp")))
                .feelsLike(toDouble(main.get("feels_like")))
                .tempMin(toDouble(main.get("temp_min")))
                .tempMax(toDouble(main.get("temp_max")))
                .condition((String) weather.get("main"))
                .description((String) weather.get("description"))
                .icon((String) weather.get("icon"))
                .humidity(toInt(main.get("humidity")))
                .pressure(toInt(main.get("pressure")))
                .visibility(toDouble(raw.getOrDefault("visibility", 0)) / 1000.0)
                .windSpeed(windSpeed)
                .windDeg(windDeg)
                .windGust(windGust)
                .dewPoint(toDouble(main.getOrDefault("dew_point", DEW_POINT_UNAVAILABLE)))
                .clouds(toInt(cloudsMap.getOrDefault("all", 0)))
                .uvi(UVI_UNAVAILABLE) // overwritten in fetchWeather() when One Call succeeds
                .rainLastHour(toDouble(rain.getOrDefault("1h", 0.0)))
                .snowLastHour(toDouble(snow.getOrDefault("1h", 0.0)))
                .sunrise(toLong(sys != null ? sys.get("sunrise") : 0))
                .sunset(toLong(sys != null ? sys.get("sunset") : 0))
                .timestamp(toLong(raw.get("dt")))
                .build();
    }

    @SuppressWarnings("unchecked")
    private ForecastDTO mapToForecastDTO(Map<String, Object> raw) {

        Map<String, Object> cityMap = (Map<String, Object>) raw.get("city");
        List<Map<String, Object>> list = (List<Map<String, Object>>) raw.get("list");

        if (cityMap == null || list == null || list.isEmpty()) {
            throw new RuntimeException("Invalid forecast data");
        }

        List<ForecastDTO.HourlySlot> hourlySlots = list.stream()
                .limit(8)
                .map(this::toHourlySlot)
                .collect(Collectors.toList());

        List<ForecastDTO.DailySummary> dailySummaries = list.stream()
                .filter(s -> s.get("dt_txt").toString().contains("12:00:00"))
                .limit(5)
                .map(s -> toDailySummary(s, list))
                .collect(Collectors.toList());

        String country = Locale.of("", (String) cityMap.get("country")).getDisplayCountry(Locale.ENGLISH);

        return ForecastDTO.builder()
                .city((String) cityMap.get("name"))
                .country(country)
                .hourlySlots(hourlySlots)
                .dailySummaries(dailySummaries)
                .build();
    }

    @SuppressWarnings("unchecked")
    private ForecastDTO.HourlySlot toHourlySlot(Map<String, Object> slot) {

        Map<String, Object> main = (Map<String, Object>) slot.get("main");
        Map<String, Object> wind = (Map<String, Object>) slot.get("wind");
        List<Map<String, Object>> wList = (List<Map<String, Object>>) slot.get("weather");

        if (wList == null || wList.isEmpty()) {
            throw new RuntimeException("No weather data in hourly slot");
        }

        long dt = toLong(slot.get("dt"));
        double pop = toDouble(slot.getOrDefault("pop", 0.0));
        double windSpeed = (wind != null) ? toDouble(wind.get("speed")) * 3.6 : 0.0;

        return ForecastDTO.HourlySlot.builder()
                .dt(dt)
                .time(TIME_FMT.format(Instant.ofEpochSecond(dt)))
                .temperature(toDouble(main.get("temp")))
                .feelsLike(toDouble(main.get("feels_like")))
                .humidity(toInt(main.get("humidity")))
                .windSpeed(windSpeed)
                .condition((String) wList.get(0).get("main"))
                .icon((String) wList.get(0).get("icon"))
                .precipitationChance((int) Math.round(pop * 100))
                .build();
    }

    @SuppressWarnings("unchecked")
    private ForecastDTO.DailySummary toDailySummary(Map<String, Object> noon, List<Map<String, Object>> all) {

        Map<String, Object> main = (Map<String, Object>) noon.get("main");
        List<Map<String, Object>> wList = (List<Map<String, Object>>) noon.get("weather");

        if (wList == null || wList.isEmpty()) {
            throw new RuntimeException("No weather data in daily summary");
        }

        long dt = toLong(noon.get("dt"));
        String dayKey = noon.get("dt_txt").toString().substring(0, 10);

        List<Map<String, Object>> sameDay = all.stream()
                .filter(s -> s.get("dt_txt").toString().startsWith(dayKey))
                .collect(Collectors.toList());

        double min = sameDay.stream()
                .mapToDouble(s -> toDouble(((Map<String, Object>) s.get("main")).get("temp_min")))
                .min().orElse(toDouble(main.get("temp_min")));

        double max = sameDay.stream()
                .mapToDouble(s -> toDouble(((Map<String, Object>) s.get("main")).get("temp_max")))
                .max().orElse(toDouble(main.get("temp_max")));

        return ForecastDTO.DailySummary.builder()
                .dt(dt)
                .dayName(DAY_FMT.format(Instant.ofEpochSecond(dt)))
                .tempDay(toDouble(main.get("temp")))
                .tempMin(min)
                .tempMax(max)
                .condition((String) wList.get(0).get("main"))
                .icon((String) wList.get(0).get("icon"))
                .humidity(toInt(main.get("humidity")))
                .precipitationChance((int) Math.round(toDouble(noon.getOrDefault("pop", 0.0)) * 100))
                .build();
    }

    private double toDouble(Object v) {
        if (v == null) return 0.0;
        if (v instanceof Double d) return d;
        if (v instanceof Integer i) return i.doubleValue();
        if (v instanceof Long l) return l.doubleValue();
        return Double.parseDouble(v.toString());
    }

    private int toInt(Object v) {
        if (v == null) return 0;
        if (v instanceof Integer i) return i;
        if (v instanceof Double d) return d.intValue();
        return Integer.parseInt(v.toString());
    }

    private long toLong(Object v) {
        if (v == null) return 0L;
        if (v instanceof Long l) return l;
        if (v instanceof Integer i) return i.longValue();
        return Long.parseLong(v.toString());
    }

    @Cacheable(value = "suggestions", key = "#query == null ? '' : #query.trim().toLowerCase()")
    public List<Map<String, Object>> getCitySuggestions(String query) {

        if (query == null || query.trim().length() < 1) return List.of();

        try {
            String url = String.format(
                    "https://api.openweathermap.org/geo/1.0/direct?q=%s&limit=5&appid=%s",
                    java.net.URLEncoder.encode(query.trim(), java.nio.charset.StandardCharsets.UTF_8),
                    apiKey);

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> results = restTemplate.getForObject(url, List.class);

            if (results == null) return List.of();

            return results.stream().map(c -> {
                Map<String, Object> out = new java.util.LinkedHashMap<>();
                out.put("name", c.get("name"));
                String countryCode = String.valueOf(c.get("country"));
                String countryName = Locale.of("", countryCode).getDisplayCountry(Locale.ENGLISH);
                out.put("country", countryName);
                out.put("state", c.getOrDefault("state", ""));
                out.put("lat", c.get("lat"));
                out.put("lon", c.get("lon"));

                String state = String.valueOf(c.getOrDefault("state", ""));
                String label = state.isBlank()
                        ? c.get("name") + ", " + c.get("country")
                        : c.get("name") + ", " + state + ", " + c.get("country");
                out.put("label", label);

                return out;
            }).collect(Collectors.toList());

        } catch (Exception e) {
            return List.of();
        }
    }
}
