import { useState, useEffect } from 'react';
import { fetchForecast } from '../../services/api.js';
import { getWeatherIcon } from '../../utils/weatherIcons.js';
import './ForecastStrip.css';

// OpenWeather icon prefix -> condition label (shared with HourlyView).
const conditionByIcon = {
  '01': 'clear',
  '02': 'few clouds',
  '03': 'clouds',
  '04': 'clouds',
  '09': 'drizzle',
  '10': 'rain',
  '11': 'thunderstorm',
  '13': 'snow',
  '50': 'mist',
};

function ForecastIcon({ icon, condition }) {
  const iconKey = icon?.slice(0, 2);
  const resolvedCondition = conditionByIcon[iconKey] || condition?.toLowerCase() || 'clouds';
  const src = getWeatherIcon(resolvedCondition, icon);

  return (
    <img
      className="forecast-icon"
      src={src}
      alt={condition}
    />
  );
}

export default function ForecastStrip({ city, convertTemp, onRainChance, onHourlyData }) {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    (async () => {
      if (!city) return;
      setLoading(true);
      setForecast(null);
      
      try {
        const data = await fetchForecast(city);
        setForecast(data);
        if (onRainChance && data.hourlySlots?.length) {
          onRainChance(data.hourlySlots[0].precipitationChance);
        }
        if (onHourlyData && data.hourlySlots?.length) {
          onHourlyData(data.hourlySlots);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [city, onRainChance, onHourlyData]);

  if (loading) return (
    <div className="forecast-card glass-card">
      <p className="forecast-loading">Loading forecast…</p>
    </div>
  );
  if (!forecast || !forecast.dailySummaries?.length) return null;

  return (
    <div className="forecast-card glass-card">
      <h3 className="forecast-title">5-Day Forecast</h3>
      <div className="forecast-grid">
        {forecast.dailySummaries.map((day, i) => (
          <div key={i} className={`forecast-day ${i === 0 ? 'today' : ''}`}>
            <p className="forecast-day-name">{i === 0 ? 'Today' : day.dayName}</p>
            <ForecastIcon icon={day.icon} condition={day.condition} />
            <p className="forecast-condition">{day.condition}</p>
            <div className="forecast-temps">
              <span className="temp-high">{convertTemp(day.tempMax)}</span>
              <span className="temp-sep">/</span>
              <span className="temp-low">{convertTemp(day.tempMin)}</span>
            </div>
            <p className="forecast-pop">💧 {day.precipitationChance ?? 0}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}
