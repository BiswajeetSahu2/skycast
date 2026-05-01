// components/WeatherCard/WeatherCard.jsx
//
// Props:
//   weather     - WeatherDTO from backend
//   convertTemp - function from useUnit hook, converts C to chosen unit
//   rainChance  - percentage (0-100), comes from forecast's first slot pop

import './WeatherCard.css';

function StatBox({ label, value }) {
  return (
    <div className="stat-box">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  );
}

export default function WeatherCard({ weather, convertTemp, rainChance }) {
  if (!weather) return null;

  return (
    <div className="weather-card">

      <div className="weather-header">
        <h2 className="weather-city">{weather.city}, {weather.country}</h2>
        <p className="weather-description">{weather.description}</p>
      </div>

      {/* convertTemp handles the C/F conversion */}
      <p className="weather-temp">{convertTemp(weather.temperature)}</p>

      <div className="weather-stats">
        <StatBox label="Feels Like"  value={convertTemp(weather.feelsLike)} />
        <StatBox label="Humidity"    value={`${weather.humidity}%`} />
        <StatBox label="Wind"        value={`${weather.windSpeed.toFixed(1)} km/h`} />
        {/* Rain Chance replaces Pressure */}
        <StatBox label="Rain Chance" value={rainChance != null ? `${rainChance}%` : '—'} />
        <StatBox label="Visibility"  value={`${weather.visibility} km`} />
        <StatBox label="Condition"   value={weather.condition} />
      </div>

    </div>
  );
}