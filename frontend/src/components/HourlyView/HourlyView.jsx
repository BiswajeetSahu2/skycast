import { useState, useEffect, useRef } from 'react';
import { fetchForecast } from '../../services/api.js';
import './HourlyView.css';

/* ── SVG Sparkline ────────────────────────────────────────────────── */
function Sparkline({ slots, convertTemp, isCelsius }) {
  const svgRef = useRef(null);
  const W = 1000, H = 120, PAD = 24;

  if (!slots || slots.length < 2) return null;

  const temps = slots.map(s => s.temperature);
  const min = Math.min(...temps);
  const max = Math.max(...temps);
  const range = max - min || 1;

  // Map each slot to an (x, y) point
  const pts = slots.map((s, i) => ({
    x: PAD + (i / (slots.length - 1)) * (W - PAD * 2),
    y: PAD + (1 - (s.temperature - min) / range) * (H - PAD * 2),
    temp: s.temperature,
    time: s.time,
  }));

  // Smooth polyline path
  const pathD = pts.reduce((d, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = pts[i - 1];
    const cpx = (prev.x + p.x) / 2;
    return `${d} C ${cpx} ${prev.y} ${cpx} ${p.y} ${p.x} ${p.y}`;
  }, '');

  // Area fill below the line
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
        {/* Area fill */}
        <path d={areaD} fill="url(#sparkGrad)" stroke="none" />
        {/* Line */}
        <path d={pathD} fill="none" stroke="var(--sky-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Dots + temp labels at key points (every 4th) */}
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
      {/* Time axis labels below */}
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

/* ── Icon ─────────────────────────────────────────────────────────── */
function SlotIcon({ icon }) {
  if (icon === '01d') return (
    <svg className="hv-icon hv-sun" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="9" fill="#fbbf24" />
      {[0, 60, 120, 180, 240, 300].map((deg, i) => {
        const r = deg * Math.PI / 180, x1 = 20 + 12 * Math.cos(r), y1 = 20 + 12 * Math.sin(r), x2 = 20 + 16 * Math.cos(r), y2 = 20 + 16 * Math.sin(r);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />;
      })}
    </svg>
  );
  if (icon === '01n') return (
    <svg className="hv-icon" viewBox="0 0 40 40" fill="none">
      <path d="M26 8a12 12 0 11-12 20A9 9 0 0026 8z" fill="#c7d2fe" />
    </svg>
  );
  return <img className="hv-icon" src={`https://openweathermap.org/img/wn/${icon}@2x.png`} alt="" />;
}

/* ── Main component ───────────────────────────────────────────────── */
export default function HourlyView({ city, convertTemp, isFahrenheit, weather }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!city) return;
    setLoading(true);
    fetchForecast(city)
      .then(data => setSlots(data.hourlySlots || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [city]);

  if (loading) return (
    <div className="hourly-view">
      <p className="hv-loading">Loading 24h forecast…</p>
    </div>
  );

  if (!slots.length) return null;

  return (
    <div className="hourly-view">

      {/* Header summary */}
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

      {/* Temperature sparkline */}
      <div className="hv-sparkline-card glass-card">
        <p className="hv-section-label">Temperature trend</p>
        <Sparkline slots={slots} convertTemp={convertTemp} isCelsius={!isFahrenheit} />
      </div>

      {/* Detailed slot cards */}
      <div className="hv-section-label" style={{ marginTop: 20 }}>Hourly breakdown</div>
      <div className="hv-grid">
        {slots.map((slot, i) => (
          <div key={i} className={`hv-slot glass-card ${i === 0 ? 'now' : ''}`}>

            {/* Time */}
            <div className="hv-slot-time">{i === 0 ? 'Now' : slot.time}</div>

            {/* Icon */}
            <SlotIcon icon={slot.icon} />

            {/* Temp — big */}
            <div className="hv-slot-temp">{convertTemp(slot.temperature)}</div>

            {/* Stats row */}
            {/* Feels like */}
            <div className="hv-slot-feels">
              Feels {convertTemp(slot.feelsLike)}
            </div>

            {/* Rain Chance */}
            <div className="hv-slot-rain">
              💧 {slot.precipitationChance ?? 0}%
            </div>

            {/* Wind Speed */}
            <div className="hv-slot-wind">
              {slot.windSpeed.toFixed(0)} km/h
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}