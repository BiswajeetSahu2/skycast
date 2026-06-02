import { useState, useEffect } from 'react';
import { fetchAQI } from '../../services/api.js';
import './AQICard.css';

const AQI_LEVELS = [
  { max: 1, label: 'Good',      color: 'var(--aqi-good)',          desc: 'Air quality is satisfactory.' },
  { max: 2, label: 'Fair',      color: 'var(--aqi-moderate)',      desc: 'Acceptable air quality.' },
  { max: 3, label: 'Moderate',  color: 'var(--aqi-unhealthy)',     desc: 'Sensitive groups may be affected.' },
  { max: 4, label: 'Poor',      color: 'var(--aqi-very-unhealthy)',desc: 'Everyone may feel effects.' },
  { max: 5, label: 'Very Poor', color: 'var(--aqi-hazardous)',     desc: 'Health alert — avoid outdoors.' },
];

function getLevel(aqi) { return AQI_LEVELS[Math.min((aqi ?? 1) - 1, 4)]; }

export default function AQICard({ lat, lon }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [err,     setErr]     = useState(null);

  useEffect(() => {
    if (lat == null || lon == null) { setErr('No coordinates'); return; }
    if (lat === 0 && lon === 0)     { setErr('Coordinates unavailable (0,0)'); return; }

    setLoading(true);
    setErr(null);
    setData(null);

    fetchAQI(lat, lon)
      .then(result => {
        if (!result) { setErr('AQI data unavailable'); return; }
        setData(result);
      })
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false));
  }, [lat, lon]);

  if (loading) return (
    <div className="aqi-card glass-card">
      <div className="aqi-title">Air Quality</div>
      <p className="aqi-loading">Loading…</p>
    </div>
  );

  if (err) return (
    <div className="aqi-card glass-card">
      <div className="aqi-title">Air Quality</div>
      <p className="aqi-loading" style={{fontSize:12}}>
        {err === 'Coordinates unavailable (0,0)'
          ? 'AQI unavailable — your backend WeatherDTO is returning lat:0, lon:0. Check that mapToWeatherDTO() populates coord fields from OWM.'
          : err}
      </p>
    </div>
  );

  if (!data) return null;

  const level = getLevel(data.aqi);
  const pct   = Math.max(((data.aqi - 1) / 4) * 100, 4);

  return (
    <div className="aqi-card glass-card">
      <div className="aqi-title">Air Quality</div>

      <div className="aqi-hero">
        <div className="aqi-index" style={{ color: level.color }}>{data.aqi}</div>
        <div className="aqi-label-wrap">
          <span className="aqi-badge" style={{ background: level.color }}>{level.label}</span>
          <p className="aqi-desc">{level.desc}</p>
        </div>
      </div>

      <div className="aqi-bar-track">
        <div className="aqi-bar-fill" style={{ width: `${pct}%`, background: level.color }}/>
      </div>
      <div className="aqi-bar-labels">
        <span>Good</span><span>Fair</span><span>Moderate</span><span>Poor</span><span>Very Poor</span>
      </div>

      <div className="aqi-pollutants">
        {[
          ['PM2.5', data.pm2_5],
          ['PM10',  data.pm10],
          ['NO₂',   data.no2],
          ['O₃',    data.o3],
          ['CO',    data.co],
          ['SO₂',   data.so2],
        ].map(([name, val]) => (
          <div key={name} className="aqi-pollutant">
            <span className="ap-name">{name}</span>
            <span className="ap-val">{val != null ? val.toFixed(1) : '—'}</span>
            <span className="ap-unit">µg/m³</span>
          </div>
        ))}
      </div>
    </div>
  );
}