import { useState, useEffect } from 'react';
import { fetchForecast } from '../../services/api.js';
import './ForecastStrip.css';

//   convertTemp   - from useUnit, converts C to chosen unit
//   onRainChance  - callback to send first slot's rain % up to App.jsx
//                   so WeatherCard can display it
export default function ForecastStrip({ city, convertTemp, onRainChance }) {

  const [forecast, setForecast] = useState(null);
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    if (!city) return;

    setLoading(true);
    setForecast(null);

    fetchForecast(city)
      .then(data => {
        setForecast(data);
        // Send the first hourly slot's rain chance up to App.jsx
        // so WeatherCard can show it in the Rain Chance stat box
        if (onRainChance && data.hourlySlots?.length) {
          onRainChance(data.hourlySlots[0].precipitationChance);
        }
      })
      .catch(err => console.error('Forecast error:', err))
      .finally(() => setLoading(false));

  }, [city]);

  if (loading) return <p className="forecast-loading">Loading forecast...</p>;
  if (!forecast || !forecast.dailySummaries?.length) return null;

  return (
    <div className="forecast-strip">
      <h3 className="forecast-title">5-Day Forecast</h3>
      <div className="forecast-grid">
        {forecast.dailySummaries.map((day, index) => (
          <div key={index} className="forecast-day">
            <p className="forecast-day-name">{day.dayName}</p>
            <img
              className="forecast-icon"
              src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
              alt={day.condition}
            />
            <p className="forecast-temp">{convertTemp(day.tempDay)}</p>
            <p className="forecast-rain">💧 {day.precipitationChance}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}