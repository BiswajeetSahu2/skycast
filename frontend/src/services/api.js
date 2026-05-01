// services/api.js

const BASE_URL = 'http://localhost:8080/api';
// OWM geo API called directly from frontend (only for suggestions — no sensitive data)
const GEO_URL  = 'https://api.openweathermap.org/geo/1.0';
const OWM_KEY  = '080ad6a80a7585356ea43862e3d2ccb4';

// ── Current weather by city name ──────────────────────────────────────
export async function fetchWeather(city) {
  const res = await fetch(`${BASE_URL}/weather?city=${encodeURIComponent(city)}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'City not found');
  }
  return res.json();
}

// ── Current weather by coordinates (for geolocation) ─────────────────
export async function fetchWeatherByCoords(lat, lon) {
  const res = await fetch(`${BASE_URL}/weather/coords?lat=${lat}&lon=${lon}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Location not found');
  }
  return res.json();
}

// ── 5-day forecast by city name ───────────────────────────────────────
export async function fetchForecast(city) {
  const res = await fetch(`${BASE_URL}/forecast?city=${encodeURIComponent(city)}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Forecast not available');
  }
  return res.json();
}

// ── 5-day forecast by coordinates ────────────────────────────────────
export async function fetchForecastByCoords(lat, lon) {
  const res = await fetch(`${BASE_URL}/forecast/coords?lat=${lat}&lon=${lon}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Forecast not available');
  }
  return res.json();
}

// ── City autocomplete suggestions (OWM Geo API) ───────────────────────
// This is safe to call from frontend — returns only city names, no secrets.
export async function fetchCitySuggestions(query) {
  if (!query || query.trim().length < 2) return [];
  const res = await fetch(
    `${GEO_URL}/direct?q=${encodeURIComponent(query)}&limit=5&appid=${OWM_KEY}`
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.map(c => ({
    name:    c.name,
    country: c.country,
    state:   c.state || '',
    lat:     c.lat,
    lon:     c.lon,
    // Display label shown in the dropdown
    label:   c.state
      ? `${c.name}, ${c.state}, ${c.country}`
      : `${c.name}, ${c.country}`
  }));
}