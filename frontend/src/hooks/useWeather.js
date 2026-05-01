// hooks/useWeather.js
import { useState, useEffect } from 'react';
import { fetchWeather, fetchWeatherByCoords } from '../services/api.js';

export function useWeather() {

  const [weather,      setWeather]      = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);
  const [searchedCity, setSearchedCity] = useState(null);

  // Auto-detect location on first load
  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setLoading(true);
        setError(null);
        try {
          const data = await fetchWeatherByCoords(
            pos.coords.latitude,
            pos.coords.longitude
          );
          setWeather(data);
          setSearchedCity(data.city);
        } catch {
          // Silently fail — user can search manually
        } finally {
          setLoading(false);
        }
      },
      () => { /* Permission denied — do nothing */ }
    );
  }, []); // Empty array = run once on mount

  async function searchWeather(city) {
    setError(null);
    setWeather(null);
    setSearchedCity(null);
    setLoading(true);
    try {
      const data = await fetchWeather(city);
      setWeather(data);
      setSearchedCity(data.city);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { weather, loading, error, searchedCity, searchWeather };
}