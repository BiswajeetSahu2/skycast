import { useState } from 'react';
import { useWeather } from './hooks/useWeather.js';
import { useTheme } from './hooks/useTheme.js';
import { useUnit } from './hooks/useUnit.js';
import { useRecents } from './hooks/useRecents.js';
import { fetchWeatherByCoords } from './services/api.js';
import TopBar from './components/TopBar/TopBar.jsx';
import SearchBar from './components/SearchBar/SearchBar.jsx';
import WeatherCard from './components/WeatherCard/WeatherCard.jsx';
import ForecastStrip from './components/ForecastStrip/ForecastStrip.jsx';
import './App.css';

export default function App() {
  const { weather, loading, error, searchedCity, searchWeather } = useWeather();
  const { isDark, toggleTheme } = useTheme();
  const { isFahrenheit, toggleUnit, convertTemp } = useUnit();
  const { recents, addRecent, removeRecent } = useRecents();
  const [rainChance, setRainChance] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);

  function handleSearch(city) {
    addRecent(city);
    searchWeather(city);
  }

  function handleGeoSearch() {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const data = await fetchWeatherByCoords(
            pos.coords.latitude, pos.coords.longitude
          );
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

  return (
    <div className={`app ${hasResults ? 'has-results' : ''}`}>
      <TopBar isDark={isDark} toggleTheme={toggleTheme}
              isFahrenheit={isFahrenheit} toggleUnit={toggleUnit} />
      {!hasResults && <h1 className="app-title">SkyCast</h1>}
      <div className={`search-container ${hasResults ? 'search-fixed' : ''}`}>
        <SearchBar onSearch={handleSearch} onGeoSearch={handleGeoSearch}
                   loading={isLoading} recents={recents} onRemoveRecent={removeRecent} />
      </div>
      <div className="results-area">
        {error && <div className="error-box">Error: {error}</div>}
        {isLoading && <p className="loading-text">Fetching weather...</p>}
        {weather && <WeatherCard weather={weather} convertTemp={convertTemp} rainChance={rainChance} />}
        {searchedCity && <ForecastStrip city={searchedCity} convertTemp={convertTemp} onRainChance={setRainChance} />}
      </div>
    </div>
  );
}