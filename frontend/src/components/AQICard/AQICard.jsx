import { useEffect, useId, useState } from 'react';
import { fetchAQI } from '../../services/api.js';
import './AQICard.css';

const AQI_LEVELS = [
  { max: 1, label: 'Good', color: '#22c55e', desc: 'Air quality is satisfactory.' },
  { max: 2, label: 'Fair', color: '#84cc16', desc: 'Acceptable air quality.' },
  { max: 3, label: 'Moderate', color: '#facc15', desc: 'Sensitive groups may be affected.' },
  { max: 4, label: 'Poor', color: '#f97316', desc: 'Everyone may feel effects.' },
  { max: 5, label: 'Very Poor', color: '#ef4444', desc: 'Health alert - avoid outdoors.' },
];

// Full hue spectrum painted along the gauge arc (good -> hazardous, left to right).
const AQI_HUE_STOPS = [
  { offset: '0%', color: '#22c55e' },
  { offset: '18%', color: '#84cc16' },
  { offset: '36%', color: '#facc15' },
  { offset: '54%', color: '#f97316' },
  { offset: '72%', color: '#ef4444' },
  { offset: '100%', color: '#a855f7' },
];

function getLevel(aqi) {
  return AQI_LEVELS[Math.min((aqi ?? 1) - 1, 4)];
}

function getHueColorForAqi(aqi) {
  const value = Math.min(Math.max(aqi ?? 1, 1), 5);
  const t = (value - 1) / 4;
  const position = t * (AQI_HUE_STOPS.length - 1);
  const index = Math.floor(position);
  const frac = position - index;
  const next = Math.min(index + 1, AQI_HUE_STOPS.length - 1);

  const parse = hex => {
    const valueHex = hex.slice(1);
    return [
      parseInt(valueHex.slice(0, 2), 16),
      parseInt(valueHex.slice(2, 4), 16),
      parseInt(valueHex.slice(4, 6), 16),
    ];
  };

  const [r1, g1, b1] = parse(AQI_HUE_STOPS[index].color);
  const [r2, g2, b2] = parse(AQI_HUE_STOPS[next].color);
  const r = Math.round(r1 + (r2 - r1) * frac);
  const g = Math.round(g1 + (g2 - g1) * frac);
  const b = Math.round(b1 + (b2 - b1) * frac);
  return `rgb(${r}, ${g}, ${b})`;
}

export default function AQICard({ lat, lon }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const hueGradientId = useId().replace(/:/g, '');

  useEffect(() => {
    (async () => {
      if (lat == null || lon == null) {
        setErr('No coordinates');
        return;
      }
      if (lat === 0 && lon === 0) {
        setErr('Coordinates unavailable (0,0)');
        return;
      }

      setLoading(true);
      setErr(null);
      setData(null);

      try {
        const result = await fetchAQI(lat, lon);
        if (!result) {
          setErr('AQI data unavailable');
          return;
        }
        setData(result);
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [lat, lon]);

  if (loading) {
    return (
      <div className="aqi-card glass-card">
        <div className="aqi-title">Air Quality</div>
        <p className="aqi-loading">Loading...</p>
      </div>
    );
  }

  if (err) {
    return (
      <div className="aqi-card glass-card">
        <div className="aqi-title">Air Quality</div>
        <p className="aqi-loading" style={{ fontSize: 12 }}>
          {err === 'Coordinates unavailable (0,0)'
            ? 'AQI unavailable for this location.'
            : err}
        </p>
      </div>
    );
  }

  if (!data) return null;

  const level = getLevel(data.aqi);
  const hueColor = getHueColorForAqi(data.aqi);
  const pct = Math.min(Math.max((data.aqi / 5) * 100, 8), 100);
  const pollutants = [
    ['PM2.5', data.pm2_5],
    ['PM10', data.pm10],
    ['NO2', data.no2],
    ['O3', data.o3],
    ['CO', data.co],
    ['SO2', data.so2],
  ];

  return (
    <div
      className="aqi-card glass-card"
      style={{ '--aqi-color': hueColor }}
    >
      <div className="aqi-title">
        Air Quality
      </div>

      <div className="aqi-content">
        <div className="aqi-gauge-panel">
          <div className="aqi-gauge">
            <svg viewBox="0 0 160 160" role="img" aria-label={`${level.label} air quality`}>
              <defs>
                <linearGradient id={hueGradientId} x1="18%" y1="92%" x2="92%" y2="18%" gradientUnits="userSpaceOnUse">
                  {AQI_HUE_STOPS.map(stop => (
                    <stop key={stop.offset} offset={stop.offset} stopColor={stop.color} />
                  ))}
                </linearGradient>
              </defs>
              <circle
                className="aqi-gauge-track"
                cx="80"
                cy="80"
                r="58"
                pathLength="100"
                style={{ stroke: `url(#${hueGradientId})` }}
              />
              <circle
                className="aqi-gauge-fill"
                cx="80"
                cy="80"
                r="58"
                pathLength="100"
                style={{
                  stroke: `url(#${hueGradientId})`,
                  strokeDasharray: `${pct * 0.75} 100`,
                }}
              />
            </svg>
            <div className="aqi-gauge-value">
              <span>{data.aqi}</span>
              <strong>{level.label}</strong>
            </div>
          </div>

          <p className="aqi-desc">{level.desc}</p>
        </div>

        <div className="aqi-pollutants">
          {pollutants.map(([name, val]) => (
            <div key={name} className="aqi-pollutant">
              <span className="ap-name">{name}</span>
              <span className="ap-val">{val != null ? val.toFixed(1) : '--'}</span>
              <span className="ap-unit">ug/m3</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
