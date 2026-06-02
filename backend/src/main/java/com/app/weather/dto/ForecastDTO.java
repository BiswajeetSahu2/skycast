package com.app.weather.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ForecastDTO {

    private String city;
    private String country;

    private List<HourlySlot> hourlySlots;
    private List<DailySummary> dailySummaries;


    @Data
    @Builder
    public static class HourlySlot {

        private long   dt;
        private String time;

        private double temperature;
        private double feelsLike;
        private int    humidity;
        private double windSpeed;

        private String condition;
        private String icon;

        private int    precipitationChance;
    }


    @Data
    @Builder
    public static class DailySummary {
        
        private long   dt;
        private String dayName;

        private double tempDay;
        private double tempMin;
        private double tempMax;

        private String condition;
        private String icon;

        private int    humidity;
        private int    precipitationChance;
    }
}