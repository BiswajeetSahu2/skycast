import sun from '../assets/weather/sun.svg';
import cloud from '../assets/weather/cloud.svg';
import partlyCloudy from '../assets/weather/partly-cloudy.svg';
import rain from '../assets/weather/rain.svg';
import drizzle from '../assets/weather/drizzle.svg';
import storm from '../assets/weather/storm.svg';
import snow from '../assets/weather/snow.svg';
import mist from '../assets/weather/mist.svg';
import wind from '../assets/weather/wind.svg';
import night from '../assets/weather/night.svg';
import nightCloudy from '../assets/weather/night-cloudy.svg';

export function getWeatherIcon(condition, icon) {

  const c = condition?.toLowerCase();

  if (icon?.includes('n')) {

    if (
      c?.includes('cloud')
    ) {
      return nightCloudy;
    }

    return night;
  }

  switch (c) {

    case 'clear':
      return sun;

    case 'clouds':
    case 'overcast clouds':
    case 'broken clouds':
    case 'scattered clouds':
      return cloud;

    case 'few clouds':
      return partlyCloudy;

    case 'rain':
      return rain;

    case 'drizzle':
      return drizzle;

    case 'thunderstorm':
      return storm;

    case 'snow':
      return snow;

    case 'mist':
    case 'fog':
    case 'haze':
    case 'smoke':
      return mist;

    case 'wind':
      return wind;

    default:
      return partlyCloudy;
  }
}