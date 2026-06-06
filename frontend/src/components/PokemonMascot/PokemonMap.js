const GUARDIANS = {
  sunny: {
    id: 250,
    name: 'Ho-Oh',
    type: 'Fire/Flying',
    weather: 'Sunny',
    palette: {
      lightBg: 'linear-gradient(135deg, #fff4bb 0%, #ffd36b 48%, #f59e0b 100%)',
      darkBg: 'linear-gradient(135deg, #3a2105 0%, #8a4b08 52%, #f59e0b 100%)',
      accent: '#f59e0b',
      accent2: '#ffd166',
      textLight: '#241204',
      textDark: '#fff7d6',
      mutedLight: '#7a4305',
      mutedDark: '#ffd98a',
      glow: 'rgba(245, 158, 11, 0.32)',
    },
  },
  partlyCloudy: {
    id: 334,
    name: 'Altaria',
    type: 'Dragon/Flying',
    weather: 'Partly Cloudy',
    palette: {
      lightBg: 'linear-gradient(135deg, #fafdff 0%, #dff3ff 50%, #8fd0f4 100%)',
      darkBg: 'linear-gradient(135deg, #0b2236 0%, #1f5d7d 52%, #bfe9ff 100%)',
      accent: '#38bdf8',
      accent2: '#f8fbff',
      textLight: '#082033',
      textDark: '#eefaff',
      mutedLight: '#2f6f8d',
      mutedDark: '#b9e7ff',
      glow: 'rgba(56, 189, 248, 0.28)',
    },
  },
  rain: {
    id: 788,
    name: 'Tapu Fini',
    type: 'Water/Fairy',
    weather: 'Rain',
    palette: {
      lightBg: 'linear-gradient(135deg, #e7fbff 0%, #9be8f1 48%, #06b6d4 100%)',
      darkBg: 'linear-gradient(135deg, #052c36 0%, #075f72 50%, #22d3ee 100%)',
      accent: '#06b6d4',
      accent2: '#67e8f9',
      textLight: '#04242c',
      textDark: '#ecfeff',
      mutedLight: '#0e7490',
      mutedDark: '#a5f3fc',
      glow: 'rgba(6, 182, 212, 0.30)',
    },
  },
  heavyRain: {
    id: 384,
    name: 'Rayquaza',
    type: 'Dragon/Flying',
    weather: 'Heavy Rain',
    palette: {
      lightBg: 'linear-gradient(135deg, #dffcf0 0%, #52d1a1 48%, #047857 100%)',
      darkBg: 'linear-gradient(135deg, #04251d 0%, #065f46 50%, #14b887 100%)',
      accent: '#10b981',
      accent2: '#2dd4bf',
      textLight: '#041d16',
      textDark: '#ecfdf5',
      mutedLight: '#065f46',
      mutedDark: '#99f6e4',
      glow: 'rgba(16, 185, 129, 0.30)',
    },
  },
  thunderstorm: {
    id: 25,
    name: 'Pikachu',
    type: 'Electric',
    weather: 'Thunderstorm',
    palette: {
      lightBg: 'linear-gradient(135deg, #fff7ad 0%, #fde047 45%, #38bdf8 100%)',
      darkBg: 'linear-gradient(135deg, #302701 0%, #856e08 48%, #0369a1 100%)',
      accent: '#facc15',
      accent2: '#38bdf8',
      textLight: '#1f1a02',
      textDark: '#fffbd1',
      mutedLight: '#7c6503',
      mutedDark: '#e0f2fe',
      glow: 'rgba(250, 204, 21, 0.34)',
    },
  },
  snow: {
    id: 10104,
    name: 'Alolan Ninetales',
    type: 'Ice/Fairy',
    weather: 'Snow',
    palette: {
      lightBg: 'linear-gradient(135deg, #f8fdff 0%, #dbeafe 50%, #94a3b8 100%)',
      darkBg: 'linear-gradient(135deg, #071827 0%, #256b8f 52%, #d7ecff 100%)',
      accent: '#7dd3fc',
      accent2: '#cbd5e1',
      textLight: '#0f2638',
      textDark: '#f8fbff',
      mutedLight: '#45647a',
      mutedDark: '#dbeafe',
      glow: 'rgba(125, 211, 252, 0.30)',
    },
  },
  fog: {
    id: 245,
    name: 'Suicune',
    type: 'Water',
    weather: 'Fog',
    palette: {
      lightBg: 'linear-gradient(135deg, #eef6ff 0%, #c7d2fe 50%, #a78bfa 100%)',
      darkBg: 'linear-gradient(135deg, #101a33 0%, #31518f 52%, #a78bfa 100%)',
      accent: '#60a5fa',
      accent2: '#c4b5fd',
      textLight: '#111b35',
      textDark: '#eef4ff',
      mutedLight: '#4f46a3',
      mutedDark: '#d8b4fe',
      glow: 'rgba(96, 165, 250, 0.28)',
    },
  },
  windy: {
    id: 249,
    name: 'Lugia',
    type: 'Psychic/Flying',
    weather: 'Windy',
    palette: {
      lightBg: 'linear-gradient(135deg, #ffffff 0%, #dbeafe 50%, #1e3a8a 100%)',
      darkBg: 'linear-gradient(135deg, #071226 0%, #1d4f8f 54%, #f8fbff 100%)',
      accent: '#1d4ed8',
      accent2: '#ffffff',
      textLight: '#071226',
      textDark: '#f8fbff',
      mutedLight: '#1e3a8a',
      mutedDark: '#dbeafe',
      glow: 'rgba(29, 78, 216, 0.28)',
    },
  },
  extremeHeat: {
    id: 10078,
    name: 'Primal Groudon',
    type: 'Ground/Fire',
    weather: 'Extreme Heat',
    palette: {
      lightBg: 'linear-gradient(135deg, #fff1dd 0%, #fb6f22 48%, #7f0f0f 100%)',
      darkBg: 'linear-gradient(135deg, #2b0505 0%, #8f1d12 50%, #fb6f22 100%)',
      accent: '#ef4444',
      accent2: '#fb923c',
      textLight: '#230606',
      textDark: '#fff1e7',
      mutedLight: '#8a2b10',
      mutedDark: '#fed7aa',
      glow: 'rgba(239, 68, 68, 0.34)',
    },
  },
  dust: {
    id: 248,
    name: 'Tyranitar',
    type: 'Rock/Dark',
    weather: 'Dust/Haze',
    palette: {
      lightBg: 'linear-gradient(135deg, #fff3d8 0%, #c9b477 50%, #6b7b35 100%)',
      darkBg: 'linear-gradient(135deg, #1d2111 0%, #5d6530 52%, #d5bd7a 100%)',
      accent: '#7c8a35',
      accent2: '#d6b56d',
      textLight: '#1d1a0b',
      textDark: '#fff6d8',
      mutedLight: '#656022',
      mutedDark: '#e7d49a',
      glow: 'rgba(124, 138, 53, 0.30)',
    },
  },
};

function classifyGuardian(condition, icon, tempCelsius, windSpeed, rainChance) {
  const c = (condition || '').toLowerCase();
  const isNight = icon?.endsWith('n');
  const wind = Number(windSpeed) || 0;
  const pop = Number(rainChance) || 0;
  const isCloudy = c.includes('cloud') || c.includes('overcast');
  const isRain = c.includes('rain') || c.includes('drizzle') || c.includes('shower');
  const isHeavyRain = isRain && (
    c.includes('heavy') ||
    c.includes('intense') ||
    c.includes('extreme') ||
    c.includes('storm rain') ||
    wind >= 30 ||
    pop >= 70
  );

  if (c.includes('thunder') || c.includes('lightning')) return 'thunderstorm';
  if (c.includes('snow') || c.includes('blizzard') || c.includes('sleet')) return 'snow';
  if (c.includes('dust') || c.includes('sand') || c.includes('haze') || c.includes('smoke') || c.includes('ash')) return 'dust';
  if (c.includes('fog') || c.includes('mist')) return 'fog';
  if (tempCelsius >= 42 || c.includes('heat')) return 'extremeHeat';
  if (isHeavyRain) return 'heavyRain';
  if (isRain) return 'rain';
  if (wind >= 35 || c.includes('squall') || c.includes('tornado') || c.includes('wind')) return 'windy';
  if (isCloudy || icon?.startsWith('02') || icon?.startsWith('03') || icon?.startsWith('04')) return 'partlyCloudy';
  if (c.includes('clear') || c.includes('sun') || isNight) return 'sunny';
  return 'sunny';
}

function getGuardian(condition, icon, tempCelsius, windSpeed, rainChance) {
  const key = classifyGuardian(condition, icon, tempCelsius, windSpeed, rainChance);
  return { key, ...GUARDIANS[key] };
}

export function getGuardianCardTheme(condition, icon, tempCelsius, windSpeed, rainChance) {
  const guardian = getGuardian(condition, icon, tempCelsius, windSpeed, rainChance);
  const palette = guardian.palette;

  return {
    guardian,
    style: {
      '--guardian-bg-light': palette.lightBg,
      '--guardian-bg-dark': palette.darkBg,
      '--guardian-accent': palette.accent,
      '--guardian-accent-2': palette.accent2,
      '--guardian-text-light': palette.textLight,
      '--guardian-text-dark': palette.textDark,
      '--guardian-muted-light': palette.mutedLight,
      '--guardian-muted-dark': palette.mutedDark,
      '--guardian-glow': palette.glow,
    },
  };
}

export function getPokemon(condition, icon, tempCelsius, country, windSpeed, rainChance) {
  const guardian = getGuardian(condition, icon, tempCelsius, windSpeed, rainChance);

  return {
    id: guardian.id,
    name: guardian.name,
    type: guardian.type,
    weather: guardian.weather,
    artworkUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${guardian.id}.png`,
    spriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${guardian.id}.png`,
  };
}
