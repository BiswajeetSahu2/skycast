package com.app.weather.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

/**
 * ForecastDTO — wraps the full forecast response sent to React.
 *
 * OpenWeather's /forecast endpoint returns up to 40 slots (5 days × 8 slots/day).
 * We break this into:
 *   - hourlySlots  → first 8 slots (24h), used by the Chart
 *   - dailySummaries → one entry per day, used by the ForecastGrid (5-day view)
 */
@Data
@Builder
public class ForecastDTO {

    private String city;
    private String country;

    /** First 8 forecast slots (~24 hours). Drives the Chart. */
    private List<HourlySlot> hourlySlots;

    /** One entry per unique day (filtered at 12:00). Drives the 5-day grid. */
    private List<DailySummary> dailySummaries;


    // ════════════════════════════════════════════════════════════════════
    //  INNER CLASS: HourlySlot
    //  One 3-hour forecast block from OWM
    // ════════════════════════════════════════════════════════════════════
    @Data
    @Builder
    public static class HourlySlot {

        private long   dt;          // Unix timestamp of this slot
        private String time;        // formatted: "14:00" — built in service

        private double temperature;
        private double feelsLike;
        private int    humidity;
        private double windSpeed;

        private String condition;   // "Clear", "Rain" etc.
        private String icon;        // OWM icon code

        /** Probability of precipitation (0.0 → 1.0 from OWM)
         *  We multiply ×100 and store as int percentage. */
        private int    precipitationChance;
    }


    // ════════════════════════════════════════════════════════════════════
    //  INNER CLASS: DailySummary
    //  One entry per day, built from the 12:00 slot of each day
    // ════════════════════════════════════════════════════════════════════
    @Data
    @Builder
    public static class DailySummary {

        private long   dt;          // Unix timestamp
        private String dayName;     // "Mon", "Tue" etc. — built in service

        private double tempDay;     // temperature at midday
        private double tempMin;     // lowest temp in that day's slots
        private double tempMax;     // highest temp in that day's slots

        private String condition;
        private String icon;

        private int    humidity;
        private int    precipitationChance;
    }
}