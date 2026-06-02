import { useEffect } from 'react';

export function useWeatherPalette(condition, icon, windSpeed) {
  const palette = resolvePalette(condition, icon, windSpeed);

  useEffect(() => {
    document.body.setAttribute('data-palette', palette);

    return () => {
      document.body.setAttribute('data-palette', 'cloudy');
    };
  }, [palette]);

  return palette;
}

export function resolvePalette(condition, icon, windSpeed) {
  if (!condition) return 'cloudy';

  const c       = condition.toLowerCase();
  const isNight = icon?.endsWith('n') ?? false;

  if (c.includes('thunder') || c.includes('storm') || c.includes('squall')) {
    return 'thunder';
  }

  if (c.includes('snow') || c.includes('sleet') || c.includes('blizzard') || c.includes('ice')) {
    return 'snow';
  }

  if (c.includes('rain') || c.includes('drizzle') || c.includes('shower')) {
    return 'rain';
  }

  if (
    c.includes('fog')   || c.includes('mist')  || c.includes('haze') ||
    c.includes('smoke') || c.includes('sand')  || c.includes('dust') ||
    c.includes('ash')   || c.includes('tornado')
  ) {
    return 'night';
  }

  if (windSpeed != null && windSpeed >= 40) {
    return 'windy';
  }

  if (isNight && (c.includes('clear') || c.includes('sky'))) {
    return 'night';
  }

  if (c.includes('clear') || c.includes('sun')) {
    return 'sunny';
  }

  return 'cloudy';
}