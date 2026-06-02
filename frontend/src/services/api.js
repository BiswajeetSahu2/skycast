const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

async function readJsonOrThrow(res, fallbackMessage) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const error = new Error(body.error || `${fallbackMessage} (${res.status})`);
    error.status = res.status;
    throw error;
  }
  return res.status === 204 ? null : res.json();
}

export async function fetchWeather(city) {
  const res = await fetch(`${BASE_URL}/weather?city=${encodeURIComponent(city)}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'City not found');
  }
  return res.json();
}

export async function fetchWeatherByCoords(lat, lon) {
  const res = await fetch(`${BASE_URL}/weather/coords?lat=${lat}&lon=${lon}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Location not found');
  }
  return res.json();
}

export async function fetchForecast(city) {
  const res = await fetch(`${BASE_URL}/forecast?city=${encodeURIComponent(city)}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Forecast not available');
  }
  return res.json();
}

export async function fetchForecastByCoords(lat, lon) {
  const res = await fetch(`${BASE_URL}/forecast/coords?lat=${lat}&lon=${lon}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Forecast not available');
  }
  return res.json();
}

export async function fetchAQI(lat, lon) {
  if (lat == null || lon == null || (lat === 0 && lon === 0)) return null;
  const res = await fetch(`${BASE_URL}/aqi?lat=${lat}&lon=${lon}`);
  if (!res.ok) return null;
  return res.json();
}

export async function fetchCitySuggestions(query) {
  if (!query || query.trim().length < 1) return [];
  try {
    const res = await fetch(`${BASE_URL}/suggestions?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function signup(payload) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return readJsonOrThrow(res, 'Signup failed');
}

export async function login(payload) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return readJsonOrThrow(res, 'Login failed');
}

export async function logout(refreshToken) {
  if (!refreshToken) return null;
  const res = await fetch(`${BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  return readJsonOrThrow(res, 'Logout failed');
}

export async function refreshAuth(refreshToken) {
  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  return readJsonOrThrow(res, 'Session refresh failed');
}

export async function fetchFavorites(accessToken) {
  const res = await fetch(`${BASE_URL}/user/favorites`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return readJsonOrThrow(res, 'Could not load favorites');
}

export async function addFavorite(accessToken, favorite) {
  const res = await fetch(`${BASE_URL}/user/favorites`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(favorite),
  });
  return readJsonOrThrow(res, 'Could not add favorite');
}

export async function removeFavorite(accessToken, city) {
  const res = await fetch(`${BASE_URL}/user/favorites/${encodeURIComponent(city)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return readJsonOrThrow(res, 'Could not remove favorite');
}
