# SkyCast — Project Guide

A chapter-by-chapter guide to how SkyCast is built, how data flows through the system, and how the main algorithms work.

---

## Chapter 1 — What SkyCast Is

SkyCast is a full-stack weather dashboard. Users search for a city (or use geolocation), see current conditions, hourly and 5-day forecasts, air quality, and a Pokémon-inspired weather guardian. Logged-in users can save favorite cities.

**Major capabilities**

| Area | What it does |
|------|----------------|
| Weather | Current temp, feels-like, wind, visibility, sunrise/sunset |
| Forecast | 8 hourly slots (3 h steps) + 5 daily summaries |
| AQI | OpenWeather air pollution index + pollutant breakdown |
| Auth | Signup, login, JWT access + refresh tokens |
| Favorites | Persist cities per user in PostgreSQL |
| UX | Dark/light theme, °C/°F, recent searches, tab persistence |

**Tech stack**

- **Frontend:** React 19, Vite, plain CSS per component
- **Backend:** Java 21, Spring Boot 3.2, Spring Security, JPA
- **Database:** PostgreSQL (users, favorites, refresh tokens)
- **Cache:** Caffeine (10-minute TTL on weather data)
- **External API:** OpenWeatherMap (weather, forecast, geocoding, air pollution)

---

## Chapter 2 — System Architecture

SkyCast uses a classic three-tier layout:

```
┌─────────────────────────────────────────────────────────────┐
│  Browser (React SPA)                                        │
│  localhost:5173                                             │
│  • Components, hooks, localStorage                          │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP / JSON
                           │ Authorization: Bearer <JWT>
┌──────────────────────────▼──────────────────────────────────┐
│  Spring Boot API                                            │
│  localhost:8080/api                                         │
│  • Controllers → Services → Repositories                      │
│  • JWT filter, Caffeine cache, RestTemplate → OpenWeather   │
└──────────────┬─────────────────────────────┬────────────────┘
               │ JDBC                         │ HTTPS
┌──────────────▼──────────────┐   ┌───────────▼───────────────┐
│  PostgreSQL                 │   │  OpenWeatherMap API       │
│  users, favorites, tokens   │   │  (API key on server only) │
└─────────────────────────────┘   └───────────────────────────┘
```

**Design choices**

1. **Backend proxy** — The OpenWeather API key never reaches the browser. All weather calls go through Spring Boot.
2. **Stateless auth** — No server sessions; JWT in the `Authorization` header.
3. **Client-side UI state** — Theme, unit, recents, last weather result, and active tab live in `localStorage`.
4. **Server-side favorites** — Tied to authenticated users in PostgreSQL.

---

## Chapter 3 — Repository Layout

```
weather-app/
├── backend/
│   └── src/main/java/com/app/weather/
│       ├── config/          Security, CORS, JWT filter, cache
│       ├── controller/      REST endpoints (weather, auth, user)
│       ├── dto/             JSON shapes sent to frontend
│       ├── model/           JPA entities (User, Favorite, RefreshToken)
│       ├── repository/      Spring Data JPA interfaces
│       └── service/         Business logic + OpenWeather integration
├── frontend/
│   └── src/
│       ├── components/      UI (one folder per feature)
│       ├── hooks/           Reusable React state logic
│       ├── services/        api.js — all fetch calls
│       ├── utils/           weatherIcons.js
│       ├── App.jsx          Root layout and orchestration
│       └── tokens.css       Design tokens (colors, fonts)
└── docs/
    └── SKYCAST_GUIDE.md     This file
```

---

## Chapter 4 — Frontend Layers

### 4.1 Entry point

`main.jsx` mounts `<App />` into the DOM. `App.jsx` is the single orchestrator: it wires hooks, owns tab state, favorites, and decides which views to render.

### 4.2 Hooks (`src/hooks/`)

| Hook | Responsibility |
|------|----------------|
| `useWeather` | Fetch weather, persist last result to `localStorage`, auto geolocation on first visit |
| `useAuth` | Login/signup/logout, store JWT pair in `localStorage` |
| `useTheme` | Toggle `light` class on `<body>` |
| `useUnit` | Celsius ↔ Fahrenheit conversion |
| `useRecents` | Recent city list in `localStorage` |
| `useWeatherPalette` | Sets `data-palette` on `<body>` for global background theming |

Hooks keep components thin. They do not call OpenWeather directly — only `services/api.js` talks to the backend.

### 4.3 API layer (`src/services/api.js`)

Single module for all HTTP:

- Weather: `fetchWeather`, `fetchForecast`, `fetchWeatherByCoords`, `fetchAQI`
- Auth: `login`, `signup`, `refreshAuth`, `logout`
- User: `fetchFavorites`, `addFavorite`, `removeFavorite`
- Search: `fetchCitySuggestions`

Errors attach an `error.status` when the response is non-OK so callers can detect 401/403 and refresh tokens.

### 4.4 Components (`src/components/`)

| Component | Role |
|-----------|------|
| `NavBar` | Logo, tabs (Today / Hourly / Favorites), theme, unit, auth buttons |
| `SearchBar` | City input, debounced autocomplete, geolocation button |
| `MainWeatherCard` | City, temp, guardian theme, favorite heart |
| `DetailsCard` | Conditions grid (wind, UV, dew point, etc.) |
| `ForecastStrip` | 5-day forecast; pushes hourly data up to `App` |
| `HourlyView` | Sparkline + hourly slot cards |
| `AQICard` | Semi-circle gauge + pollutant grid |
| `PokemonMascot` | Guardian artwork from PokeAPI sprites |
| `FavoritesPage` | Saved cities with live temperature |
| `AuthModal` | Login / signup form |

Each component has a co-located `.css` file. Shared visual language comes from `tokens.css` and utility classes like `glass-card`.

### 4.5 App routing (tabs, not React Router)

Navigation is tab-based inside `App.jsx`:

- `activeTab`: `'today' | 'hourly' | 'favorites'` (persisted in `localStorage`)
- **Hero view** — Shown when there is no weather *and* user is not on Favorites
- **Main content** — Weather grid, hourly view, or favorites page

---

## Chapter 5 — Backend Layers

### 5.1 Controllers

| Controller | Base path | Purpose |
|------------|-----------|---------|
| `WeatherController` | `/api` | Weather, forecast, AQI, suggestions (public) |
| `AuthController` | `/api/auth` | Register, login, refresh, logout, password reset |
| `UserController` | `/api/user` | Favorites CRUD (JWT required) |

Controllers validate input, delegate to services, and return DTOs. Runtime errors from weather lookups become `404` JSON `{ "error": "..." }`.

### 5.2 Services

**`WeatherService`** — Core integration with OpenWeather:

1. Calls OpenWeather REST endpoints via `RestTemplate`
2. Maps raw JSON `Map<String,Object>` into typed DTOs
3. Applies `@Cacheable` so repeated city lookups hit Caffeine
4. Enriches current weather with One Call API for UV index and dew point when available
5. Uses **sentinel values** for missing optional fields (`uvi: -1`, `dewPoint: -999`, `windGust: -1`) so the frontend can show "—"

**`AuthService`** — Registration, login, JWT creation/validation, refresh token rotation, password reset tokens.

**`UserService`** — Favorite cities linked to the authenticated user.

### 5.3 Models & repositories

JPA entities:

- `User` — email, BCrypt password, roles, verification tokens
- `Favorite` — city + country per user
- `RefreshToken` — opaque token stored server-side, revocable on logout

Spring Data repositories provide `findByEmail`, `findByUser`, etc.

### 5.4 Security

`SecurityConfig` defines a **stateless** filter chain:

- Public: all `/api/weather/**`, `/api/forecast/**`, `/api/aqi`, auth register/login/refresh
- Protected: `/api/user/**` and anything else under `/api`
- `JwtAuthenticationFilter` runs before Spring Security, parses `Authorization: Bearer`, and sets the security context

CORS is configured in `CorsConfig` so the Vite dev server (`localhost:5173`) can call the API.

### 5.5 Caching

`CacheConfig` registers Caffeine caches:

- `weather`, `forecast`, `weatherCoords`, `forecastCoords`, `aqi`, `suggestions`
- TTL: **10 minutes**, max 500 entries each
- `WeatherService.evictAllCaches()` runs on a 10-minute schedule as a safety net

---

## Chapter 6 — Data Flow Walkthroughs

### 6.1 Search for a city

```
User types "London" → SearchBar debounces 250ms
  → GET /api/suggestions?q=London
  → WeatherService.getCitySuggestions() → OpenWeather Geocoding API

User selects city → App.handleSearch()
  → useWeather.searchWeather(city)
  → GET /api/weather?city=London
  → WeatherService.getCurrentWeather()
      → OpenWeather /weather
      → fetchOneCallExtras() for UV + dew point
  → weather state updated → MainWeatherCard, DetailsCard render

ForecastStrip mounts with searchedCity
  → GET /api/forecast?city=London
  → hourlySlots[0].precipitationChance → rainChance on main card
  → hourlySlots → App.hourlyData → HourlyView (no duplicate fetch)
```

### 6.2 Geolocation

```
SearchBar geo button → navigator.geolocation.getCurrentPosition()
  → GET /api/weather/coords?lat=&lon=
  → useWeather sets city from response
```

On first app load, `useWeather` also attempts geolocation once if nothing is stored in `localStorage`.

### 6.3 Air quality

```
AQICard receives lat/lon from current weather
  → GET /api/aqi?lat=&lon=
  → WeatherService.getAQI() → OpenWeather /air_pollution
  → Renders semi-circle gauge + PM2.5, PM10, NO₂, O₃, CO, SO₂
```

### 6.4 Favorites (authenticated)

```
User clicks heart on MainWeatherCard
  → App.handleToggleFavorite()
  → runWithFreshToken() wraps API call
      → On 401/403: auth.refreshAccessToken() then retry
  → POST or DELETE /api/user/favorites

App.loadFavorites()
  → GET /api/user/favorites (with token refresh)
  → Runs on login, tab open, and session restore
```

---

## Chapter 7 — Algorithms & Logic

### 7.1 Forecast mapping (backend)

OpenWeather **5-day / 3-hour forecast** returns ~40 slots. `WeatherService.mapToForecastDTO()` derives:

**Hourly slots** — First 8 list entries → next 24 hours at 3-hour intervals.

**Daily summaries** — Filter entries whose `dt_txt` contains `"12:00:00"` (noon snapshot), take 5 days. For each day:

- `tempMin` / `tempMax` = min/max across all slots that share the same date prefix
- `precipitationChance` = `pop` (probability of precipitation) × 100, rounded

Times are formatted in UTC (`HH:mm` for hourly, `EEE` for day name).

### 7.2 Wind speed conversion

OpenWeather returns wind in **m/s**. The backend multiplies by **3.6** to store **km/h** consistently for the UI.

### 7.3 Optional field sentinels

| Field | Sentinel | Meaning |
|-------|----------|---------|
| `uvi` | `-1` | One Call API unavailable or no data |
| `dewPoint` | `-999` | Not in basic `/weather` response |
| `windGust` | `-1` | No gust reported |

`DetailsCard` checks these before displaying values.

### 7.4 Body palette (`useWeatherPalette`)

Rule-based classifier on condition string, icon suffix (`d`/`n`), and wind speed:

1. Thunder → `thunder`
2. Snow/ice → `snow`
3. Rain/drizzle → `rain`
4. Fog/mist/haze → `night`
5. Wind ≥ 40 km/h → `windy`
6. Clear night → `night`
7. Clear day → `sunny`
8. Default → `cloudy`

Result is written to `document.body.dataset.palette`. CSS in `tokens.css` / `App.css` swaps background gradients per palette.

### 7.5 Pokémon guardian selection (`PokemonMap.js`)

Separate from body palette — drives **main card gradient** and mascot image.

`classifyGuardian()` priority order:

1. Thunder/lightning → Pikachu
2. Snow/blizzard → Alolan Ninetales
3. Dust/haze/smoke → Tyranitar
4. Fog/mist → Suicune
5. Temp ≥ 42°C or "heat" → Primal Groudon
6. Heavy rain (keywords, wind ≥ 30, or rain chance ≥ 70%) → Rayquaza
7. Light rain → Tapu Fini
8. Wind ≥ 35 or squall → Lugia
9. Cloudy icon codes (`02`, `03`, `04`) → Altaria
10. Default → Ho-Oh

Artwork URLs point to the public PokeAPI sprite repository. `PokemonMascot` falls back from official artwork to a smaller sprite on load error.

### 7.6 AQI gauge (frontend)

OpenWeather AQI is **1–5** (Good → Very Poor).

**Semi-circle arc:**

- SVG circle with `pathLength="100"`, `stroke-dasharray: 75 100`, rotated 135° → visible arc is 270° (semicircle + small gap)
- Fill length = `(aqi / 5) × 75` dash units

**Hue gradient:**

The arc uses a multi-stop linear gradient from green → yellow → orange → red → purple (`AQI_HUE_STOPS`). Both the background track (30% opacity) and the active fill share this gradient so the filled portion naturally picks up warmer hues as AQI rises.

The label color is interpolated along the same stops via `getHueColorForAqi()`.

### 7.7 Hourly sparkline

`HourlyView` → `Sparkline`:

1. Map each slot's temperature to Y using min–max normalization
2. Build smooth cubic Bézier path through points
3. Fill area under the curve with a vertical gradient
4. Label every 4th point with temp and time ("Now" for index 0)

Uses cached `hourlySlots` from `ForecastStrip` when available; otherwise fetches forecast independently.

### 7.8 Temperature unit conversion

`useUnit` stores `isFahrenheit` in `localStorage`.

```
°C → °F: (c × 9/5) + 32, rounded
Display: "{value}°" with active unit suffix implied by toggle
```

### 7.9 Favorites token refresh

Access tokens expire (~15 min). `App.runWithFreshToken()`:

1. Try API call with current access token
2. On 401/403 → `auth.refreshAccessToken()` → retry once with new token
3. `loadFavorites()` uses this pattern so the Favorites tab works after page reload with a stale token

---

## Chapter 8 — Persistence & Local Storage

| Key | Contents |
|-----|----------|
| `skycast-weather-state` | Last `{ weather, searchedCity }` |
| `skycast-auth` | `{ user, accessToken, refreshToken }` |
| `skycast-active-tab` | `today` / `hourly` / `favorites` |
| `skycast-theme` | Dark/light preference |
| `skycast-unit` | Celsius/Fahrenheit |
| `skycast-recents` | Array of recent city names |

Server persistence: users, favorites, refresh tokens in PostgreSQL via JPA (`ddl-auto: update` in dev).

---

## Chapter 9 — API Reference (Quick)

### Public weather

```
GET /api/weather?city={city}
GET /api/weather/coords?lat={lat}&lon={lon}
GET /api/forecast?city={city}
GET /api/aqi?lat={lat}&lon={lon}
GET /api/suggestions?q={query}
GET /api/health
```

### Auth

```
POST /api/auth/register   { name, email, password }
POST /api/auth/login      { email, password }
POST /api/auth/refresh    { refreshToken }
POST /api/auth/logout     { refreshToken }
```

### Protected (Bearer token)

```
GET    /api/user/favorites
POST   /api/user/favorites   { city, country }
DELETE /api/user/favorites/{city}
```

---

## Chapter 10 — Configuration

### Backend (`application.properties` + `application-local.properties`)

| Property | Purpose |
|----------|---------|
| `spring.datasource.*` | PostgreSQL connection |
| `openweather.api.key` | OpenWeather API key |
| `openweather.base.url` | Default `.../data/2.5` |
| `openweather.onecall.url` | One Call 3.0 for UV/dew point |
| `app.jwt.secret` | HMAC key (≥ 32 chars) |
| `app.jwt.expiration-ms` | Access token TTL (default 15 min) |
| `app.jwt.refresh-expiration-ms` | Refresh token TTL (default 7 days) |

Activate local secrets with profile `local` (default in dev).

### Frontend

Optional `.env`:

```env
VITE_API_URL=http://localhost:8080/api
```

---

## Chapter 11 — Running the Project

**Prerequisites:** Java 21, Maven, Node.js, PostgreSQL, OpenWeather API key.

```bash
# Database
CREATE DATABASE weather_app;

# Backend (from backend/)
mvn spring-boot:run

# Frontend (from frontend/)
npm install
npm run dev
```

- Frontend: http://localhost:5173  
- Backend: http://localhost:8080  

Production build: `npm run build` in frontend; `mvn package` in backend.

---

## Chapter 12 — Extending SkyCast

**Add a new weather stat**

1. Add field to `WeatherDTO.java` and map it in `WeatherService.mapToWeatherDTO()`
2. Display it in `DetailsCard.jsx`

**Add a new tab**

1. Add tab name in `NavBar.jsx` `tabs` array
2. Render new section in `App.jsx` when `activeTab` matches

**Add a new cache**

1. Register cache name in `CacheConfig`
2. Add `@Cacheable` on service method
3. Include name in `@CacheEvict` on `evictAllCaches()`

**Production hardening**

- Move secrets to environment variables
- Set `JPA_DDL_AUTO=validate` and use migrations (Flyway/Liquibase)
- Add Redis for distributed cache
- Wire SMTP for password reset emails
- Add JUnit/Mockito tests for services and controllers

---

## Chapter 13 — Mental Model Summary

1. **React UI** collects input and renders DTOs — it never holds the OpenWeather key.
2. **Spring Boot** is the only place that talks to OpenWeather and PostgreSQL.
3. **JWT + refresh** keeps auth stateless while allowing token rotation.
4. **Caffeine** reduces API cost and latency for popular cities.
5. **Rule-based classifiers** (palette, guardian, AQI hue) turn raw strings and numbers into cohesive visual themes.
6. **localStorage** gives a "remember me" feel for weather, theme, and tab without extra server calls.

Read the code starting from `App.jsx` for UI flow, `WeatherService.java` for data shaping, and `api.js` for the contract between the two halves.
