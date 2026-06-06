# SkyCast v2

SkyCast v2 is a full-stack weather application built with React, Spring Boot, PostgreSQL, JWT authentication, and cached OpenWeatherMap API integrations.

The app provides current weather, hourly forecasts, 5-day forecasts, air quality data, Pokemon-inspired weather mascots, account-based favorites, recent searches, and a compact responsive dashboard UI.

## Features

- Search current weather by city
- Search weather from browser geolocation
- City autocomplete powered by the backend
- Today dashboard with current temperature, conditions, sunrise/sunset, and air quality
- Hourly weather view
- 5-day forecast with rain chance on every card
- Air quality index with pollutant breakdown
- Pokemon mascot selection based on weather, temperature, and country
- Light and dark themes
- Celsius/Fahrenheit unit toggle
- Recent searches stored locally
- Favorites page with saved locations, country flag, country name, and temperature
- Reload persistence for the last weather result and active tab
- Floating dismissible error toasts

## Authentication

- Signup
- Login
- Logout
- BCrypt password hashing
- JWT access tokens
- Refresh tokens
- Role model: `USER` and `ADMIN`
- Protected user endpoints
- Account deletion
- Forgot-password token endpoint
- Email-verification token endpoint

Note: the forgot-password and email-verification flows currently return tokens from the API. A real SMTP/email provider can be connected as a production polish step.

## Tech Stack

**Frontend**

- React 19
- Vite
- CSS modules by component structure
- LocalStorage for recents, auth session, active tab, and last weather state

**Backend**

- Java 21
- Spring Boot 3.2
- Spring Web
- Spring Security
- Spring Data JPA
- PostgreSQL
- JWT using `jjwt`
- BCrypt
- Spring Cache with Caffeine

**External API**

- OpenWeatherMap weather, forecast, geocoding, and air pollution APIs

## Project Structure

For a full chapter-by-chapter guide to architecture, data flow, and algorithms, see **[docs/SKYCAST_GUIDE.md](docs/SKYCAST_GUIDE.md)**.

```text
weather-app/
  backend/
    src/main/java/com/app/weather/
      config/
      controller/
      dto/
      model/
      repository/
      service/
    src/main/resources/
    pom.xml

  frontend/
    src/
      assets/
      components/
      hooks/
      services/
      utils/
    package.json
    vite.config.js
```

## Backend API Overview

Public weather endpoints:

```text
GET  /api/weather?city={city}
GET  /api/weather/coords?lat={lat}&lon={lon}
GET  /api/forecast?city={city}
GET  /api/forecast/coords?lat={lat}&lon={lon}
GET  /api/aqi?lat={lat}&lon={lon}
GET  /api/suggestions?q={query}
GET  /api/health
```

Auth endpoints:

```text
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout
GET    /api/auth/me
DELETE /api/auth/account
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
POST   /api/auth/email-verification
POST   /api/auth/verify-email
```

Protected user endpoints:

```text
GET    /api/user/favorites
POST   /api/user/favorites
DELETE /api/user/favorites/{city}
```

## Local Setup

### Prerequisites

- Java 21
- Maven
- Node.js and npm
- PostgreSQL
- OpenWeatherMap API key

### Database

Create a PostgreSQL database:

```sql
CREATE DATABASE weather_app;
```

### Backend

The shared backend config lives in:

```text
backend/src/main/resources/application.properties
```

For local secrets, create:

```text
backend/src/main/resources/application-local.properties
```

Example:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/weather_app
spring.datasource.username=postgres
spring.datasource.password=your_password

openweather.api.key=your_openweather_api_key
app.jwt.secret=replace-with-a-long-random-secret-at-least-32-characters
```

Run the backend:

```bash
cd backend
mvn spring-boot:run
```

Backend default URL:

```text
http://localhost:8080
```

### Frontend

Install dependencies and run Vite:

```bash
cd frontend
npm install
npm run dev
```

Frontend default URL:

```text
http://localhost:5173
```

Optional frontend API override:

```text
frontend/.env
```

```env
VITE_API_URL=http://localhost:8080/api
```

## Build And Verify

Frontend production build:

```bash
cd frontend
npm run build
```

Backend tests/build verification:

```bash
cd backend
mvn test
```

## Caching

SkyCast v2 uses Spring Cache with Caffeine for backend-side caching.

Cached data includes:

- Current weather
- Forecast data
- Coordinate-based weather
- Coordinate-based forecast
- AQI
- City suggestions

Current cache TTL:

```text
10 minutes
```

## Security Notes

- The OpenWeatherMap API key is used only by the backend.
- The frontend calls only the SkyCast backend API.
- Passwords are encrypted with BCrypt.
- Protected endpoints require JWT authentication.
- Refresh tokens are stored server-side and can be revoked.
- Local secrets should stay in `application-local.properties` or environment variables.

## Version 2 Highlights

- Redesigned compact weather dashboard
- Auth service with PostgreSQL persistence
- Favorites system
- Favorites page
- JWT access and refresh tokens
- Caffeine caching layer
- Backend proxy for weather, forecast, geocoding, and AQI
- Pokemon mascot weather theming
- Improved reload persistence and error handling

## Recommended Next Polish

- Docker Compose for frontend, backend, PostgreSQL, and Redis
- Redis cache option for production deployments
- Live deployment URL
- JUnit and Mockito service/controller coverage
- SMTP provider integration for forgot-password and email verification
- CI workflow for frontend build and backend tests

