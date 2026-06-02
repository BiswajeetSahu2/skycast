import PokemonMascot from '../PokemonMascot/PokemonMascot.jsx';
import './MainWeatherCard.css';
import { getWeatherIcon } from '../../utils/weatherIcons';
import heartRed from '../../assets/heart-red.svg';
import heartWhite from '../../assets/heart-white.svg';

export default function MainWeatherCard({
  weather,
  convertTemp,
  rainChance,
  isFavorite,
  onToggleFavorite
}) {

  if (!weather) {
    return null;
  }

  const weatherIcon = getWeatherIcon(
    weather.condition,
    weather.icon
  );

  return (
    <div className="main-weather-card glass-card">

      <div className="mwc-left">

        <div className="mwc-location">

          <div className="mwc-location-block">

            <h2 className="mwc-city-name">
              {weather.city}
            </h2>

            <p className="mwc-country-name">
              {weather.country}
            </p>

            {onToggleFavorite && (
              <button
                type="button"
                className={`mwc-favorite ${isFavorite ? 'active' : ''}`}
                onClick={onToggleFavorite}
                title={isFavorite ? 'Remove favorite' : 'Add favorite'}
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <img src={isFavorite ? heartRed : heartWhite} alt="" />
              </button>
            )}

          </div>

          <p className="mwc-desc">
            {weather.description}
          </p>

          <p className="mwc-updated">

            Updated{' '}

            {new Date(
              weather.timestamp * 1000
            ).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}

          </p>

        </div>

        <div className="mwc-temp-wrap">

          <p className="mwc-temp">
            {convertTemp(weather.temperature)}
          </p>

          <div className="mwc-range">

            <span>
              ↑ {convertTemp(weather.tempMax)}
            </span>

            <span className="mwc-range-sep">
              ·
            </span>

            <span>
              ↓ {convertTemp(weather.tempMin)}
            </span>

            {rainChance != null && (
              <>
                <span className="mwc-range-sep">
                  ·
                </span>

                <span className="mwc-rain">
                  💧 {rainChance}%
                </span>
              </>
            )}

          </div>

        </div>

      </div>

      <div className="mwc-right">

        <div className="mwc-cloud-box">

          <img
            className="mwc-icon"
            src={weatherIcon}
            alt={weather.description}
          />

        </div>

        <div className="mwc-pokemon-box">

          <PokemonMascot
            condition={weather.condition}
            icon={weather.icon}
            temperature={weather.temperature}
            country={weather.country}
          />

        </div>

      </div>

    </div>
  );
}
