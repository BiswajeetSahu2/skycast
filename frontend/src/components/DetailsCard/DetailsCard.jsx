import './DetailsCard.css';

const Icons = {
  thermometer: (
    <svg viewBox="0 0 20 20" fill="none">
      <rect x="8.5" y="2" width="3" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="14.5" r="3" stroke="currentColor" strokeWidth="1.5" />
      <line x1="10" y1="5" x2="10" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),

  drop: (
    <svg viewBox="0 0 20 20" fill="none">
      <path d="M10 3C10 3 5 9.5 5 13a5 5 0 0010 0c0-3.5-5-10-5-10z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  ),

  wind: (
    <svg viewBox="0 0 20 20" fill="none">
      <path d="M3 8h9a3 3 0 000-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M3 12h12a3 3 0 010 6H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),

  eye: (
    <svg viewBox="0 0 20 20" fill="none">
      <ellipse cx="10" cy="10" rx="7" ry="4.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),

  gauge: (
    <svg viewBox="0 0 20 20" fill="none">
      <path d="M3 13a7 7 0 1114 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="10" y1="13" x2="13" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="13" r="1.5" fill="currentColor" />
    </svg>
  ),

  rain: (
    <svg viewBox="0 0 20 20" fill="none">
      <path d="M14 8A4 4 0 006.1 9H6a3 3 0 000 6h8a3 3 0 001-5.83" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="8" y1="17" x2="7" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="12" y1="17" x2="11" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),

  snow: (
    <svg viewBox="0 0 20 20" fill="none">
      <line x1="10" y1="3" x2="10" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="3" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="5.4" y1="5.4" x2="14.6" y2="14.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="14.6" y1="5.4" x2="5.4" y2="14.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),

  uv: (
    <svg viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <line x1="10" y1="1.5" x2="10" y2="3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="10" y1="16.5" x2="10" y2="18.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="1.5" y1="10" x2="3.5" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="16.5" y1="10" x2="18.5" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="4.1" y1="4.1" x2="5.5" y2="5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="14.5" y1="14.5" x2="15.9" y2="15.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="15.9" y1="4.1" x2="14.5" y2="5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="5.5" y1="14.5" x2="4.1" y2="15.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),

  cloud: (
    <svg viewBox="0 0 20 20" fill="none">
      <path d="M14 8A4 4 0 006.1 9H6a3 3 0 000 6h8a3 3 0 001-5.83" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),

  dewpoint: (
    <svg viewBox="0 0 20 20" fill="none">
      <path d="M10 2C10 2 6 8 6 11.5a4 4 0 008 0C14 8 10 2 10 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <line x1="7.5" y1="13" x2="12.5" y2="13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  ),

  windgust: (
    <svg viewBox="0 0 20 20" fill="none">
      <path d="M3 7h7a2.5 2.5 0 000-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M3 11h11a2.5 2.5 0 010 5H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M3 15h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M5 7l-2 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
};

function StatRowHalf({ icon, label, value, accent, noBorderRight }) {
  return (
    <div className={`stat-row-half ${noBorderRight ? 'no-border-right' : ''}`}>
      <span className="stat-row-icon">{icon}</span>
      <span className="stat-row-label">{label}</span>
      <span className={`stat-row-value ${accent ? 'accent' : ''}`}>{value}</span>
    </div>
  );
}

function windDir(deg) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round((deg ?? 0) / 45) % 8];
}

function formatTime(unix) {
  if (!unix) return '—';
  return new Date(unix * 1000).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function hasDewPoint(dewPoint) {
  return dewPoint != null && dewPoint > -900;
}

function hasWindGust(windGust) {
  return windGust != null && windGust >= 0;
}

function hasUvi(uvi) {
  return uvi != null && uvi >= 0;
}

function uvLabel(uvi) {
  if (!hasUvi(uvi)) return '—';
  if (uvi <= 2) return `${uvi} Low`;
  if (uvi <= 5) return `${uvi} Mod`;
  if (uvi <= 7) return `${uvi} High`;
  if (uvi <= 10) return `${uvi} V.High`;
  return `${uvi} Extreme`;
}

function uvAccent(uvi) {
  return hasUvi(uvi) && uvi >= 6;
}

export default function DetailsCard({ weather, convertTemp }) {
  if (!weather) return null;

  return (
    <div className="details-card glass-card">
      <h3 className="details-title">Conditions</h3>

      <div className="details-list">
        <div className="stat-pair-row">
          <StatRowHalf icon={Icons.thermometer} label="Feels Like" value={convertTemp(weather.feelsLike)} />
          <div className="stat-pair-divider" />
          <StatRowHalf icon={Icons.drop} label="Humidity" value={`${weather.humidity}%`} noBorderRight />
        </div>

        <div className="stat-pair-row">
          <StatRowHalf icon={Icons.wind} label="Wind" value={`${weather.windSpeed.toFixed(1)} km/h ${windDir(weather.windDeg)}`} />
          <div className="stat-pair-divider" />
          <StatRowHalf icon={Icons.gauge} label="Pressure" value={`${weather.pressure} hPa`} noBorderRight />
        </div>

        <div className="stat-pair-row">
          <StatRowHalf icon={Icons.eye} label="Visibility" value={`${weather.visibility} km`} />
          <div className="stat-pair-divider" />
          <StatRowHalf icon={Icons.dewpoint} label="Dew Point" value={hasDewPoint(weather.dewPoint) ? convertTemp(weather.dewPoint) : '—'} noBorderRight />
        </div>

        <div className="stat-pair-row">
          <StatRowHalf icon={Icons.uv} label="UV Index" value={uvLabel(weather.uvi)} accent={uvAccent(weather.uvi)} />
          <div className="stat-pair-divider" />
          <StatRowHalf icon={Icons.cloud} label="Cloud Cover" value={weather.clouds != null ? `${weather.clouds}%` : '—'} noBorderRight />
        </div>

        <div className="stat-pair-row last">
          <StatRowHalf
            icon={Icons.windgust}
            label="Wind Gust"
            value={hasWindGust(weather.windGust) ? `${weather.windGust.toFixed(1)} km/h` : '—'}
          />
          <div className="stat-pair-divider" />
          {weather.rainLastHour > 0 ? (
            <StatRowHalf icon={Icons.rain} label="Rain (1h)" value={`${weather.rainLastHour} mm`} accent noBorderRight />
          ) : weather.snowLastHour > 0 ? (
            <StatRowHalf icon={Icons.snow} label="Snow (1h)" value={`${weather.snowLastHour} mm`} accent noBorderRight />
          ) : (
            <StatRowHalf icon={Icons.rain} label="Rain (1h)" value="0 mm" noBorderRight />
          )}
        </div>
      </div>

      <div className="sun-row">
        <div className="sun-item sunrise">
          <div className="sun-time-badge">
            <span className="sun-emoji">🌅</span>
            <div className="sun-text">
              <span className="sun-label">Sunrise</span>
              <span className="sun-value">{formatTime(weather.sunrise)}</span>
            </div>
          </div>
        </div>
        <div className="sun-divider" />
        <div className="sun-item sunset">
          <div className="sun-time-badge">
            <span className="sun-emoji">🌇</span>
            <div className="sun-text">
              <span className="sun-label">Sunset</span>
              <span className="sun-value">{formatTime(weather.sunset)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
