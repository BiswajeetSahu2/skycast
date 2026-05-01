# SkyCast — Full-Stack Weather App

A production-style weather application built with React and Spring Boot.

## Tech Stack

**Frontend:** React 18, Vite, Custom Hooks, CSS  
**Backend:** Spring Boot 3.2, Java 17, Spring Cache  
**API:** OpenWeatherMap (weather + forecast + geocoding)

## Features

- Real-time weather by city search or auto-detected location
- 5-day forecast with precipitation probability
- Hourly temperature chart
- City autocomplete with arrow-key navigation
- Recent searches with delete (localStorage)
- Dark / Light theme toggle
- Celsius / Fahrenheit unit switch
- Backend proxies API key — never exposed to frontend
- In-memory caching on backend (Spring Cache)

## Architecture
React (localhost:5173)
└── services/api.js
└── GET /api/weather?city=
└── GET /api/forecast?city=
↓
Spring Boot (localhost:8080)
└── WeatherController
└── WeatherService  ← caches results
└── OpenWeatherMap API