import { useState, useEffect } from 'react';
import { fetchForecast } from '../../services/api.js';
import './ForecastStrip.css';

function ForecastIcon({ icon, condition }) {
  if (icon === '01d') return (
    <svg className="forecast-icon forecast-sun" viewBox="0 0 44 44" fill="none">
      <circle cx="22" cy="22" r="10" fill="#fbbf24"/>
      {[0,60,120,180,240,300].map((deg,i)=>{const r=deg*Math.PI/180,x1=22+13*Math.cos(r),y1=22+13*Math.sin(r),x2=22+18*Math.cos(r),y2=22+18*Math.sin(r);return<line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round"/>;})}
    </svg>
  );
  if (icon === '01n') return (
    <svg className="forecast-icon" viewBox="0 0 44 44" fill="none">
      <path d="M28 10a14 14 0 11-14 24A10 10 0 0028 10z" fill="#c7d2fe"/>
    </svg>
  );
  return <img className="forecast-icon" src={`https://openweathermap.org/img/wn/${icon}@2x.png`} alt={condition}/>;
}

export default function ForecastStrip({ city, convertTemp, onRainChance, onHourlyData }) {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    if (!city) return;
    setLoading(true);
    setForecast(null);
    fetchForecast(city)
      .then(data => {
        setForecast(data);
        if (onRainChance && data.hourlySlots?.length)
          onRainChance(data.hourlySlots[0].precipitationChance);
        if (onHourlyData && data.hourlySlots?.length)
          onHourlyData(data.hourlySlots);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [city]);

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
