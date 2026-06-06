import { useEffect, useMemo, useState } from 'react';
import { fetchWeather } from '../../services/api.js';
import heartWhite from '../../assets/heart-white.svg';
import './FavoritesPage.css';

const COUNTRY_CODES = {
  afghanistan: 'AF',
  argentina: 'AR',
  australia: 'AU',
  bangladesh: 'BD',
  brazil: 'BR',
  canada: 'CA',
  china: 'CN',
  france: 'FR',
  germany: 'DE',
  india: 'IN',
  indonesia: 'ID',
  italy: 'IT',
  japan: 'JP',
  malaysia: 'MY',
  mexico: 'MX',
  nepal: 'NP',
  pakistan: 'PK',
  philippines: 'PH',
  russia: 'RU',
  singapore: 'SG',
  'south korea': 'KR',
  spain: 'ES',
  'sri lanka': 'LK',
  thailand: 'TH',
  'united kingdom': 'GB',
  'united states': 'US',
  usa: 'US',
  vietnam: 'VN',
};

function flagFromCode(code) {
  return [...code.toUpperCase()]
    .map(char => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join('');
}

function countryToFlag(country) {
  if (!country) return String.fromCodePoint(0x1F310);

  const trimmed = country.trim();
  if (/^[a-z]{2}$/i.test(trimmed)) return flagFromCode(trimmed);

  const directCode = COUNTRY_CODES[trimmed.toLowerCase()];
  if (directCode) return flagFromCode(directCode);

  try {
    const names = new Intl.DisplayNames(['en'], { type: 'region' });
    const regions = typeof Intl.supportedValuesOf === 'function'
      ? Intl.supportedValuesOf('region')
      : [];
    const code = regions.find(region => names.of(region)?.toLowerCase() === trimmed.toLowerCase());
    return code && code.length === 2 ? flagFromCode(code) : String.fromCodePoint(0x1F310);
  } catch {
    return String.fromCodePoint(0x1F310);
  }
}

export default function FavoritesPage({
  favorites,
  convertTemp,
  onSelectFavorite,
  onRemoveFavorite,
  error,
}) {
  const [weatherByCity, setWeatherByCity] = useState({});

  const favoriteKey = useMemo(
    () => favorites.map(favorite => favorite.city).join('|'),
    [favorites]
  );

  useEffect(() => {
    let alive = true;

    (async () => {
      async function loadFavoriteWeather() {
        const entries = await Promise.all(
          favorites.map(async favorite => {
            try {
              const weather = await fetchWeather(favorite.city);
              return [favorite.city.toLowerCase(), weather];
            } catch {
              return [favorite.city.toLowerCase(), null];
            }
          })
        );

        if (alive) {
          setWeatherByCity(Object.fromEntries(entries));
        }
      }

      if (favorites.length) {
        await loadFavoriteWeather();
      } else if (alive) {
        setWeatherByCity({});
      }
    })();

    return () => {
      alive = false;
    };
  }, [favoriteKey, favorites]);

  return (
    <section className="favorites-page">
      <div className="favorites-header">
        <h2>Favorites</h2>
        <p>{favorites.length} saved {favorites.length === 1 ? 'location' : 'locations'}</p>
      </div>

      {error && <div className="error-banner favorites-error">{error}</div>}

      {favorites.length === 0 ? (
        <div className="favorites-empty glass-card">
          <span className="favorites-empty-heart">
            <img src={heartWhite} alt="" />
          </span>
          <p>Save a city from the weather card to keep it here.</p>
        </div>
      ) : (
        <div className="favorites-grid">
          {favorites.map(favorite => {
            const current = weatherByCity[favorite.city.toLowerCase()];
            const country = current?.country || favorite.country;

            return (
              <article key={favorite.id ?? favorite.city} className="favorite-card glass-card">
                <button
                  type="button"
                  className="favorite-remove"
                  onClick={() => onRemoveFavorite(favorite.city)}
                  title="Remove favorite"
                  aria-label={`Remove ${favorite.city}`}
                >
                  x
                </button>

                <button
                  type="button"
                  className="favorite-open"
                  onClick={() => onSelectFavorite(favorite.city)}
                >
                  <span className="favorite-flag">{countryToFlag(country)}</span>
                  <span className="favorite-city">{favorite.city}</span>
                  <span className="favorite-country">{country || 'Unknown country'}</span>
                  <span className="favorite-temp">
                    {current ? convertTemp(current.temperature) : '--'}
                  </span>
                </button>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
