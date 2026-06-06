import { useState, useEffect } from 'react';
import { fetchForecast } from '../../services/api.js';
import { getWeatherIcon } from '../../utils/weatherIcons.js';
import './HourlyView.css';

function Sparkline({ slots, isCelsius }) {
  const W = 1000, H = 120, PAD = 24;

  if (!slots || slots.length < 2) return null;

  const temps = slots.map(s => s.temperature);
  const min = Math.min(...temps);
  const max = Math.max(...temps);
  const range = max - min || 1;

  const pts = slots.map((s, i) => ({
    x: PAD + (i / (slots.length - 1)) * (W - PAD * 2),
    y: PAD + (1 - (s.temperature - min) / range) * (H - PAD * 2),
    temp: s.temperature,
    time: s.time,
  }));

  const pathD = pts.reduce((d, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = pts[i - 1];
    const cpx = (prev.x + p.x) / 2;
    return `${d} C ${cpx} ${prev.y} ${cpx} ${p.y} ${p.x} ${p.y}`;
  }, '');

  const areaD = `${pathD} L ${pts[pts.length - 1].x} ${H} L ${pts[0].x} ${H} Z`;

  return (
    <div className="sparkline-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} className="sparkline-svg" preserveAspectRatio="none">
        <defs>
          <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--sky-accent)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--sky-accent)" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#sparkGrad)" stroke="none" />
        <path d={pathD} fill="none" stroke="var(--sky-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {pts.filter((_, i) => i % 4 === 0 || i === pts.length - 1).map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill="var(--sky-accent)" stroke="var(--sky-surface-solid)" strokeWidth="2" />
            <text
              x={p.x}
              y={p.y - 10}
              textAnchor="middle"
              fontSize="11"
              fill="var(--sky-text)"
              fontFamily="var(--font-display)"
              fontWeight="600"
            >
              {Math.round(isCelsius ? p.temp : p.temp * 9 / 5 + 32)}°
            </text>
          </g>
        ))}
      </svg>
      <div className="sparkline-axis">
        {pts.filter((_, i) => i % 4 === 0 || i === pts.length - 1).map((p, i) => (
          <span key={i} style={{ left: `${(p.x / W) * 100}%` }} className="sparkline-tick">
            {i === 0 ? 'Now' : p.time}
          </span>
        ))}
      </div>
    </div>
  );
}

function SlotIcon({ icon }) {
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
  const iconKey = icon?.slice(0, 2);
  const condition = conditionByIcon[iconKey] || 'clouds';
  return <img className="hv-icon" src={getWeatherIcon(condition, icon)} alt="" />;
}

export default function HourlyView({ city, convertTemp, isFahrenheit, weather, hourlySlots: cachedSlots }) {
  const [fetchedSlots, setFetchedSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  const slots = cachedSlots?.length ? cachedSlots : fetchedSlots;
  const needsFetch = !!city && !cachedSlots?.length;

  useEffect(() => {
    if (!needsFetch) return undefined;

    let alive = true;

    (async () => {
      setLoading(true);
      setFetchedSlots([]);

      try {
        const data = await fetchForecast(city);
        if (alive) setFetchedSlots(data.hourlySlots || []);
      } catch (e) {
        console.error(e);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [city, needsFetch]);

  if (loading) return (
    <div className="hourly-view">
      <p className="hv-loading">Loading 24h forecast…</p>
    </div>
  );

  if (!slots.length) return null;

  return (
    <div className="hourly-view">

      <div className="hv-header">
        <div className="hv-header-left">
          <h2 className="hv-title">24-Hour Forecast</h2>
          {weather && (
            <p className="hv-subtitle">{weather.city}, {weather.country} · {weather.description}</p>
          )}
        </div>
        <div className="hv-summary-stats">
          <div className="hv-stat">
            <span className="hv-stat-label">High</span>
            <span className="hv-stat-val">{convertTemp(Math.max(...slots.map(s => s.temperature)))}</span>
          </div>
          <div className="hv-stat">
            <span className="hv-stat-label">Low</span>
            <span className="hv-stat-val">{convertTemp(Math.min(...slots.map(s => s.temperature)))}</span>
          </div>
          <div className="hv-stat">
            <span className="hv-stat-label">Avg Humidity</span>
            <span className="hv-stat-val">
              {Math.round(slots.reduce((a, s) => a + s.humidity, 0) / slots.length)}%
            </span>
          </div>
        </div>
      </div>

      <div className="hv-sparkline-card glass-card">
        <p className="hv-section-label">Temperature trend</p>
        <Sparkline slots={slots} isCelsius={!isFahrenheit} />
      </div>

      <div className="hv-section-label" style={{ marginTop: 20 }}>Hourly breakdown</div>
      <div className="hv-grid">
        {slots.map((slot, i) => (
          <div key={i} className={`hv-slot glass-card ${i === 0 ? 'now' : ''}`}>

            <div className="hv-slot-time">{i === 0 ? 'Now' : slot.time}</div>

            <SlotIcon icon={slot.icon} />

            <div className="hv-slot-temp">{convertTemp(slot.temperature)}</div>

            <div className="hv-slot-feels">
              Feels {convertTemp(slot.feelsLike)}
            </div>

            <div className="hv-slot-rain">
              💧 {slot.precipitationChance ?? 0}%
            </div>

            <div className="hv-slot-wind">
              {slot.windSpeed.toFixed(0)} km/h
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
