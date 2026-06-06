import { useState, useEffect } from 'react';
import {
  fetchWeather,
  fetchWeatherByCoords
} from '../services/api.js';

const WEATHER_KEY = 'skycast-weather-state';

function readStoredWeather() {
  try {
    return JSON.parse(localStorage.getItem(WEATHER_KEY)) || {};
  } catch {
    return {};
  }
}

export function useWeather() {
  const storedWeather = readStoredWeather();

  const [weather, setWeather] =
    useState(storedWeather.weather || null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState(null);

  const [searchedCity, setSearchedCity] =
    useState(storedWeather.searchedCity || null);

  useEffect(() => {
    if (weather && searchedCity) {
      localStorage.setItem(WEATHER_KEY, JSON.stringify({ weather, searchedCity }));
    }
  }, [weather, searchedCity]);

  useEffect(() => {
    if (storedWeather.weather) {
      return;
    }

    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(

      async pos => {

        setLoading(true);
        setError(null);

        try {

          const data =
            await fetchWeatherByCoords(
              pos.coords.latitude,
              pos.coords.longitude
            );

          setWeather(data);
          setSearchedCity(data.city);

        } catch (err) {
          console.error('Geolocation weather lookup failed:', err);
        } finally {

          setLoading(false);

        }
      },

      () => {}

    );

  }, [storedWeather.weather]);

  async function searchWeather(city) {

    setError(null);
    setWeather(null);
    setSearchedCity(null);
    setLoading(true);

    try {

      const data =
        await fetchWeather(city);

      setWeather(data);
      setSearchedCity(data.city);

    } catch (err) {

      setError(err.message);

    } finally {

      setLoading(false);

    }
  }

  function clearWeather() {

    setWeather(null);
    setSearchedCity(null);
    setError(null);
    localStorage.removeItem(WEATHER_KEY);

  }

  function clearError() {
    setError(null);
  }

  return {
    weather,
    loading,
    error,
    searchedCity,
    searchWeather,
    clearWeather,
    clearError
  };
}
