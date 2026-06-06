import { useCallback, useEffect, useState } from 'react';
import { useWeather } from './hooks/useWeather.js';
import { useTheme } from './hooks/useTheme.js';
import { useUnit } from './hooks/useUnit.js';
import { useRecents } from './hooks/useRecents.js';
import { useAuth } from './hooks/useAuth.js';
import {
  addFavorite,
  fetchFavorites,
  fetchWeatherByCoords,
  removeFavorite
} from './services/api.js';

import NavBar from './components/NavBar/NavBar.jsx';
import SearchBar from './components/SearchBar/SearchBar.jsx';
import MainWeatherCard from './components/MainWeatherCard/MainWeatherCard.jsx';
import DetailsCard from './components/DetailsCard/DetailsCard.jsx';
import HourlyView from './components/HourlyView/HourlyView.jsx';
import ForecastStrip from './components/ForecastStrip/ForecastStrip.jsx';
import AQICard from './components/AQICard/AQICard.jsx';
import './App.css';
import AuthModal from './components/AuthModal/AuthModal.jsx';
import FavoritesPage from './components/FavoritesPage/FavoritesPage.jsx';

import { useWeatherPalette } from './hooks/useWeatherPalette.js';

export default function App() {
  const { weather, loading, error, searchedCity, searchWeather, clearWeather, clearError } = useWeather();
  const { isDark, toggleTheme } = useTheme();
  const { isFahrenheit, toggleUnit, convertTemp } = useUnit();
  const { recents, addRecent, removeRecent } = useRecents();
  const auth = useAuth();

  useWeatherPalette(weather?.condition, weather?.icon, weather?.windSpeed);

  const [rainChance, setRainChance] = useState(null);
  const [hourlyData, setHourlyData] = useState([]);
  const [geoLoading, setGeoLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('skycast-active-tab') || 'today');
  const [authMode, setAuthMode] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [favoriteError, setFavoriteError] = useState('');

  function handleSearch(city) {
    addRecent(city);
    // Clear forecast cache so HourlyView does not show the previous city.
    setRainChance(null);
    setHourlyData([]);
    searchWeather(city);
    setActiveTab('today');
  }

  function handleLogoClick() {
    setActiveTab('today');
    setFavoriteError('');
    setRainChance(null);
    setHourlyData([]);
    if (clearWeather) clearWeather();
  }

  function handleGeoSearch() {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          setRainChance(null);
          setHourlyData([]);
          const data = await fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
          addRecent(data.city);
          searchWeather(data.city);
        } catch (e) { console.error(e); }
        finally { setGeoLoading(false); }
      },
      () => setGeoLoading(false)
    );
  }

  const isLoading = loading || geoLoading;
  const hasResults = !!weather;
  const isFavoritesView = activeTab === 'favorites';

  useEffect(() => {
    localStorage.setItem('skycast-active-tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    (async () => {
      if (!hasResults && activeTab === 'hourly') {
        setActiveTab('today');
      }
    })();
  }, [activeTab, hasResults]);

  useEffect(() => {
    (async () => {
      if (!auth.user && activeTab === 'favorites') {
        setActiveTab('today');
      }
    })();
  }, [activeTab, auth.user]);

  // Retry with a refreshed token on 401/403 — stored access tokens expire between visits.
  const runWithFreshToken = useCallback(async (action) => {
    try {
      return await action(auth.accessToken);
    } catch (e) {
      if (e.status !== 401 && e.status !== 403) {
        throw e;
      }

      const freshToken = await auth.refreshAccessToken();
      return action(freshToken);
    }
  }, [auth]);

  const loadFavorites = useCallback(async () => {
    // Access tokens from localStorage expire; runWithFreshToken refreshes before giving up.
    if (!auth.accessToken) {
      setFavorites([]);
      return;
    }

    try {
      const list = await runWithFreshToken(token => fetchFavorites(token));
      setFavorites(Array.isArray(list) ? list : []);
    } catch {
      setFavorites([]);
    }
  }, [auth.accessToken, runWithFreshToken]);

  useEffect(() => {
    (async () => {
      await loadFavorites();
    })();
  }, [loadFavorites]);

  // Re-fetch when opening Favorites so the list is fresh even if the initial load failed.
  useEffect(() => {
    (async () => {
      if (activeTab === 'favorites' && auth.accessToken) {
        await loadFavorites();
      }
    })();
  }, [activeTab, auth.accessToken, loadFavorites]);

  const isCurrentFavorite = !!weather && favorites.some(
    favorite => favorite.city.toLowerCase() === weather.city.toLowerCase()
  );

  async function handleToggleFavorite() {
    if (!weather) return;
    if (!auth.accessToken) {
      setAuthMode('login');
      return;
    }

    setFavoriteError('');

    const cityKey = weather.city.toLowerCase();
    const optimisticFavorite = {
      id: `local-${cityKey}`,
      city: weather.city,
      country: weather.country,
    };

    try {
      if (isCurrentFavorite) {
        // Optimistic remove — revert via loadFavorites() in catch if the API fails.
        setFavorites(prev => prev.filter(favorite => favorite.city.toLowerCase() !== cityKey));
        await runWithFreshToken(token => removeFavorite(token, weather.city));
        setFavorites(prev => prev.filter(favorite => favorite.city.toLowerCase() !== cityKey));
      } else {
        setFavorites(prev => [
          optimisticFavorite,
          ...prev.filter(item => item.city.toLowerCase() !== cityKey),
        ]);
        const favorite = await runWithFreshToken(token => addFavorite(token, {
          city: weather.city,
          country: weather.country,
        }));
        setFavorites(prev => [
          favorite,
          ...prev.filter(item => item.city.toLowerCase() !== cityKey),
        ]);
      }
    } catch (e) {
      await loadFavorites();
      setFavoriteError(e.message || 'Could not update favorite');
      if (e.status === 401 || e.status === 403) {
        setAuthMode('login');
      }
    }
  }

  async function handleRemoveFavorite(city) {
    if (!auth.accessToken) {
      setAuthMode('login');
      return;
    }

    setFavoriteError('');

    try {
      await runWithFreshToken(token => removeFavorite(token, city));
      setFavorites(prev => prev.filter(favorite => favorite.city.toLowerCase() !== city.toLowerCase()));
    } catch (e) {
      setFavoriteError(e.message || 'Could not remove favorite');
      if (e.status === 401 || e.status === 403) {
        setAuthMode('login');
      }
    }
  }

  const searchBarProps = {
    onSearch: handleSearch,
    onGeoSearch: handleGeoSearch,
    loading: isLoading,
    recents,
    onRemoveRecent: removeRecent,
  };

  return (
    <div className="app-shell">
      <NavBar
        isDark={isDark} toggleTheme={toggleTheme}
        isFahrenheit={isFahrenheit} toggleUnit={toggleUnit}
        activeTab={activeTab} setActiveTab={setActiveTab}
        hasResults={hasResults}
        onLogoClick={handleLogoClick}
        searchSlot={<SearchBar {...searchBarProps} compact />}
        user={auth.user}
        onLoginClick={() => setAuthMode('login')}
        onSignupClick={() => setAuthMode('signup')}
        onLogout={async () => {
          await auth.logout();
          setActiveTab('today');
        }}
      />

      {error && <ErrorToast message={error} onClose={clearError} />}
      {favoriteError && <ErrorToast message={favoriteError} onClose={() => setFavoriteError('')} />}

      {!hasResults && !isFavoritesView ? (
        // Hero search is shown when there is no weather yet; Favorites still uses main layout below.
        <div className="hero-wrapper">
          <section className="hero-section">
            <h1 className="hero-title">Sky<span>Cast</span></h1>
            <p className="hero-sub">Real-time weather, air quality &amp; forecasts for any city.</p>
            <div className="hero-search">
              <SearchBar {...searchBarProps} />
            </div>
          </section>
        </div>
      ) : (
        <main className={`main-content ${activeTab === 'today' ? 'main-content-today' : ''} ${isFavoritesView ? 'main-content-favorites' : ''}`}>

          {activeTab === 'today' && (
            <div className="results-grid">
              {isLoading && <p className="loading-bar">Updating…</p>}

              <div className="today-column">
                <div className="grid-main">
                  <MainWeatherCard
                    weather={weather}
                    convertTemp={convertTemp}
                    rainChance={rainChance}
                    isFavorite={isCurrentFavorite}
                    onToggleFavorite={handleToggleFavorite}
                  />
                </div>

                <div className="grid-forecast">
                  <ForecastStrip
                    city={searchedCity}
                    convertTemp={convertTemp}
                    onRainChance={setRainChance}
                    onHourlyData={setHourlyData}
                  />
                </div>
              </div>

              <div className="today-column">
                <div className="grid-details">
                  <DetailsCard weather={weather} convertTemp={convertTemp} />
                </div>

                <div className="grid-aqi">
                  {weather?.lat != null && weather?.lon != null
                    ? <AQICard lat={weather.lat} lon={weather.lon} />
                    : <div className="glass-card" style={{ padding: '22px', textAlign: 'center', color: 'var(--sky-muted)', fontSize: '13px' }}>
                      AQI unavailable
                    </div>
                  }
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hourly' && (
            <HourlyView
              city={searchedCity}
              convertTemp={convertTemp}
              isFahrenheit={isFahrenheit}
              weather={weather}
              hourlySlots={hourlyData}
            />
          )}

          {isFavoritesView && (
            <FavoritesPage
              favorites={favorites}
              convertTemp={convertTemp}
              onSelectFavorite={handleSearch}
              onRemoveFavorite={handleRemoveFavorite}
            />
          )}

        </main>
      )}

      {authMode && (
        <AuthModal
          mode={authMode}
          onClose={() => setAuthMode(null)}
          onLogin={auth.login}
          onSignup={auth.signup}
        />
      )}
    </div>
  );
}

function ErrorToast({ message, onClose }) {
  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(onClose, 2000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  return (
    <div className="error-banner app-toast" role="status">
      <span>{message}</span>
      <button type="button" onClick={onClose} aria-label="Dismiss error">x</button>
    </div>
  );
}
