import './DetailsCard.css';

const Icons = {
  thermometer: (
    <svg viewBox="0 0 20 20" fill="none">
      <rect
        x="8.5"
        y="2"
        width="3"
        height="11"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle
        cx="10"
        cy="14.5"
        r="3"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <line
        x1="10"
        y1="5"
        x2="10"
        y2="13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),

  drop: (
    <svg viewBox="0 0 20 20" fill="none">
      <path
        d="M10 3C10 3 5 9.5 5 13a5 5 0 0010 0c0-3.5-5-10-5-10z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  ),

  wind: (
    <svg viewBox="0 0 20 20" fill="none">
      <path
        d="M3 8h9a3 3 0 000-6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M3 12h12a3 3 0 010 6H13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),

  eye: (
    <svg viewBox="0 0 20 20" fill="none">
      <ellipse
        cx="10"
        cy="10"
        rx="7"
        ry="4.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle
        cx="10"
        cy="10"
        r="2.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  ),

  gauge: (
    <svg viewBox="0 0 20 20" fill="none">
      <path
        d="M3 13a7 7 0 1114 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="10"
        y1="13"
        x2="13"
        y2="8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="10" cy="13" r="1.5" fill="currentColor" />
    </svg>
  ),

  rain: (
    <svg viewBox="0 0 20 20" fill="none">
      <path
        d="M14 8A4 4 0 006.1 9H6a3 3 0 000 6h8a3 3 0 001-5.83"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="8"
        y1="17"
        x2="7"
        y2="19"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="12"
        y1="17"
        x2="11"
        y2="19"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),

  snow: (
    <svg viewBox="0 0 20 20" fill="none">
      <line
        x1="10"
        y1="3"
        x2="10"
        y2="17"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="3"
        y1="10"
        x2="17"
        y2="10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="5.4"
        y1="5.4"
        x2="14.6"
        y2="14.6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="14.6"
        y1="5.4"
        x2="5.4"
        y2="14.6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
};

function StatRow({ icon, label, value, accent }) {
  return (
    <div className="stat-row">
      <span className="stat-row-icon">{icon}</span>
      <span className="stat-row-label">{label}</span>
      <span className={`stat-row-value ${accent ? 'accent' : ''}`}>
        {value}
      </span>
    </div>
  );
}

function windDir(deg) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

  return dirs[Math.round((deg ?? 0) / 45) % 8];
}

function formatTime(unix) {
  if (!unix) {
    return '—';
  }

  return new Date(unix * 1000).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function DetailsCard({ weather, convertTemp}) {

  if (!weather) {
    return null;
  }

  return (
    <div className="details-card glass-card">

      <h3 className="details-title">
        Conditions
      </h3>

      <div className="details-list">

        <StatRow
          icon={Icons.thermometer}
          label="Feels Like"
          value={convertTemp(weather.feelsLike)}
        />

        <StatRow
          icon={Icons.drop}
          label="Humidity"
          value={`${weather.humidity}%`}
        />

        <StatRow
          icon={Icons.wind}
          label="Wind"
          value={`${weather.windSpeed.toFixed(1)} km/h ${windDir(weather.windDeg)}`}
        />

        <StatRow
          icon={Icons.eye}
          label="Visibility"
          value={`${weather.visibility} km`}
        />

        <StatRow
          icon={Icons.gauge}
          label="Pressure"
          value={`${weather.pressure} hPa`}
        />

        {weather.rainLastHour > 0 && (
          <StatRow
            icon={Icons.rain}
            label="Rain (1h)"
            value={`${weather.rainLastHour} mm`}
            accent
          />
        )}

        {weather.snowLastHour > 0 && (
          <StatRow
            icon={Icons.snow}
            label="Snow (1h)"
            value={`${weather.snowLastHour} mm`}
            accent
          />
        )}

      </div>
      
        <div className="sun-row">

          <div className="sun-item sunrise">

            <div className="sun-time-badge">

              <span className="sun-emoji">
                🌅
              </span>

              <div className="sun-text">

                <span className="sun-label">
                  Sunrise
                </span>

                <span className="sun-value">
                  {formatTime(weather.sunrise)}
                </span>

              </div>

            </div>

          </div>

          <div className="sun-divider" />

          <div className="sun-item sunset">

            <div className="sun-time-badge">

              <span className="sun-emoji">
                🌇
              </span>

              <div className="sun-text">

                <span className="sun-label">
                  Sunset
                </span>

                <span className="sun-value">
                  {formatTime(weather.sunset)}
                </span>

              </div>

            </div>

          </div>

        </div>

    </div>
  );
}