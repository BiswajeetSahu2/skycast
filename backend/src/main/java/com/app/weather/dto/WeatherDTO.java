package com.app.weather.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class WeatherDTO {

    private String  city;
    private String  country;
    private double  lat;
    private double  lon;

    private double  temperature;
    private double  feelsLike;
    private double  tempMin;
    private double  tempMax;

    private String  condition;
    private String  description;
    private String  icon;

    private int     humidity;
    private int     pressure;
    private double  visibility;

    private double  windSpeed;
    private int     windDeg;
    /** -1 when OpenWeather does not report gust speed. */
    private double  windGust;

    /** -999 when unavailable; frontend treats as missing. */
    private double  dewPoint;
    private int     clouds;
    /** -1 when One Call API is unavailable; frontend treats as missing. */
    private double  uvi;

    private double  rainLastHour;
    private double  snowLastHour;

    private long    sunrise;
    private long    sunset;

    private long    timestamp;
}
