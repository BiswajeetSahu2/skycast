// official high-res artwork from PokéAPI:
// https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/{id}.png

const CONTINENT = {
  // Asia
  IN:'asia', CN:'asia', JP:'asia', KR:'asia', TH:'asia', VN:'asia',
  ID:'asia', MY:'asia', PH:'asia', SG:'asia', BD:'asia', PK:'asia',
  NP:'asia', LK:'asia', MM:'asia', KH:'asia', LA:'asia', AF:'asia',
  // Europe
  GB:'europe', FR:'europe', DE:'europe', IT:'europe', ES:'europe',
  PT:'europe', NL:'europe', BE:'europe', CH:'europe', AT:'europe',
  PL:'europe', SE:'europe', NO:'europe', DK:'europe', FI:'europe',
  RU:'europe', UA:'europe', CZ:'europe', HU:'europe', RO:'europe',
  // Americas
  US:'americas', CA:'americas', MX:'americas', BR:'americas',
  AR:'americas', CO:'americas', CL:'americas', PE:'americas',
  VE:'americas', EC:'americas', BO:'americas', PY:'americas',
  // Africa
  ZA:'africa', NG:'africa', KE:'africa', GH:'africa', ET:'africa',
  TZ:'africa', EG:'africa', MA:'africa', CI:'africa', SN:'africa',
  // Oceania
  AU:'oceania', NZ:'oceania', PG:'oceania', FJ:'oceania',
};

const COUNTRY_NAME_TO_CODE = {
  afghanistan: 'AF',
  argentina: 'AR',
  australia: 'AU',
  bangladesh: 'BD',
  brazil: 'BR',
  canada: 'CA',
  china: 'CN',
  egypt: 'EG',
  france: 'FR',
  germany: 'DE',
  ghana: 'GH',
  india: 'IN',
  indonesia: 'ID',
  italy: 'IT',
  japan: 'JP',
  kenya: 'KE',
  malaysia: 'MY',
  mexico: 'MX',
  nepal: 'NP',
  'new zealand': 'NZ',
  nigeria: 'NG',
  pakistan: 'PK',
  philippines: 'PH',
  russia: 'RU',
  singapore: 'SG',
  'south africa': 'ZA',
  'south korea': 'KR',
  spain: 'ES',
  'sri lanka': 'LK',
  thailand: 'TH',
  'united kingdom': 'GB',
  'united states': 'US',
  usa: 'US',
  vietnam: 'VN',
};

function getContinent(country) {
  const normalized = country?.trim();
  if (!normalized) return 'asia';

  const code = normalized.length === 2
    ? normalized.toUpperCase()
    : COUNTRY_NAME_TO_CODE[normalized.toLowerCase()];

  return CONTINENT[code] || 'asia';
}

function getConditionKey(condition, icon) {
  const c = (condition || '').toLowerCase();
  const isNight = icon?.endsWith('n');
  if (c.includes('thunder') || c.includes('storm')) return 'thunder';
  if (c.includes('snow') || c.includes('blizzard'))  return 'snow';
  if (c.includes('rain') || c.includes('drizzle'))   return 'rain';
  if (c.includes('fog') || c.includes('mist') || c.includes('haze')) return 'fog';
  if (c.includes('cloud') || c.includes('overcast')) return 'cloud';
  if (c.includes('clear') || c.includes('sun'))      return isNight ? 'night' : 'clear';
  return 'clear';
}

function getTempBand(celsius) {
  if (celsius <= 0)  return 'freezing';
  if (celsius <= 10) return 'cold';
  if (celsius <= 20) return 'mild';
  if (celsius <= 30) return 'warm';
  return 'hot';
}

// Format: [id, name, type-hint]
// id = national dex number for PokéAPI official artwork URL

const POKEMON_TABLE = {
  // THUNDER
  thunder: {
    asia:     { freezing:[871,'Arctozolt','Electric/Ice'], cold:[694,'Helioptile','Electric'], mild:[135,'Jolteon','Electric'], warm:[25,'Pikachu','Electric'], hot:[145,'Zapdos','Electric/Flying'] },
    europe:   { freezing:[871,'Arctozolt','Electric/Ice'], cold:[125,'Electabuzz','Electric'], mild:[135,'Jolteon','Electric'], warm:[777,'Togedemaru','Electric'], hot:[145,'Zapdos','Electric/Flying'] },
    americas: { freezing:[871,'Arctozolt','Electric/Ice'], cold:[125,'Electabuzz','Electric'], mild:[309,'Electrike','Electric'], warm:[587,'Emolga','Electric/Flying'], hot:[145,'Zapdos','Electric/Flying'] },
    africa:   { freezing:[694,'Helioptile','Electric'], cold:[309,'Electrike','Electric'], mild:[25,'Pikachu','Electric'], warm:[595,'Joltik','Bug/Electric'], hot:[145,'Zapdos','Electric/Flying'] },
    oceania:  { freezing:[871,'Arctozolt','Electric/Ice'], cold:[694,'Helioptile','Electric'], mild:[135,'Jolteon','Electric'], warm:[25,'Pikachu','Electric'], hot:[145,'Zapdos','Electric/Flying'] },
  },

  // SNOW
  snow: {
    asia:     { freezing:[473,'Mamoswine','Ice/Ground'], cold:[361,'Snorunt','Ice'], mild:[872,'Snom','Ice/Bug'], warm:[872,'Snom','Ice/Bug'], hot:[872,'Snom','Ice/Bug'] },
    europe:   { freezing:[131,'Lapras','Water/Ice'], cold:[220,'Swinub','Ice/Ground'], mild:[361,'Snorunt','Ice'], warm:[361,'Snorunt','Ice'], hot:[361,'Snorunt','Ice'] },
    americas: { freezing:[473,'Mamoswine','Ice/Ground'], cold:[124,'Jynx','Ice/Psychic'], mild:[220,'Swinub','Ice/Ground'], warm:[220,'Swinub','Ice/Ground'], hot:[220,'Swinub','Ice/Ground'] },
    africa:   { freezing:[473,'Mamoswine','Ice/Ground'], cold:[361,'Snorunt','Ice'], mild:[361,'Snorunt','Ice'], warm:[872,'Snom','Ice/Bug'], hot:[872,'Snom','Ice/Bug'] },
    oceania:  { freezing:[131,'Lapras','Water/Ice'], cold:[220,'Swinub','Ice/Ground'], mild:[361,'Snorunt','Ice'], warm:[361,'Snorunt','Ice'], hot:[361,'Snorunt','Ice'] },
  },

  // RAIN
  rain: {
    asia:     { freezing:[131,'Lapras','Water/Ice'], cold:[54,'Psyduck','Water'], mild:[349,'Feebas','Water'], warm:[816,'Sobble','Water'], hot:[422,'Shellos','Water'] },
    europe:   { freezing:[131,'Lapras','Water/Ice'], cold:[54,'Psyduck','Water'], mild:[194,'Wooper','Water/Ground'], warm:[816,'Sobble','Water'], hot:[271,'Lombre','Water/Grass'] },
    americas: { freezing:[131,'Lapras','Water/Ice'], cold:[194,'Wooper','Water/Ground'], mild:[349,'Feebas','Water'], warm:[816,'Sobble','Water'], hot:[422,'Shellos','Water'] },
    africa:   { freezing:[131,'Lapras','Water/Ice'], cold:[54,'Psyduck','Water'], mild:[349,'Feebas','Water'], warm:[422,'Shellos','Water'], hot:[138,'Omanyte','Rock/Water'] },
    oceania:  { freezing:[131,'Lapras','Water/Ice'], cold:[54,'Psyduck','Water'], mild:[350,'Milotic','Water'], warm:[816,'Sobble','Water'], hot:[422,'Shellos','Water'] },
  },

  // FOG / MIST
  fog: {
    asia:     { freezing:[358,'Chimecho','Psychic'], cold:[353,'Shuppet','Ghost'], mild:[355,'Duskull','Ghost'], warm:[200,'Misdreavus','Ghost'], hot:[200,'Misdreavus','Ghost'] },
    europe:   { freezing:[358,'Chimecho','Psychic'], cold:[353,'Shuppet','Ghost'], mild:[292,'Shedinja','Bug/Ghost'], warm:[200,'Misdreavus','Ghost'], hot:[200,'Misdreavus','Ghost'] },
    americas: { freezing:[353,'Shuppet','Ghost'], cold:[355,'Duskull','Ghost'], mild:[292,'Shedinja','Bug/Ghost'], warm:[200,'Misdreavus','Ghost'], hot:[200,'Misdreavus','Ghost'] },
    africa:   { freezing:[353,'Shuppet','Ghost'], cold:[355,'Duskull','Ghost'], mild:[200,'Misdreavus','Ghost'], warm:[200,'Misdreavus','Ghost'], hot:[200,'Misdreavus','Ghost'] },
    oceania:  { freezing:[358,'Chimecho','Psychic'], cold:[353,'Shuppet','Ghost'], mild:[355,'Duskull','Ghost'], warm:[200,'Misdreavus','Ghost'], hot:[200,'Misdreavus','Ghost'] },
  },

  // CLOUDY / OVERCAST
  cloud: {
    asia:     { freezing:[361,'Snorunt','Ice'], cold:[333,'Swablu','Normal/Flying'], mild:[396,'Starly','Normal/Flying'], warm:[16,'Pidgey','Normal/Flying'], hot:[636,'Larvesta','Bug/Fire'] },
    europe:   { freezing:[361,'Snorunt','Ice'], cold:[333,'Swablu','Normal/Flying'], mild:[396,'Starly','Normal/Flying'], warm:[821,'Rookidee','Flying'], hot:[821,'Rookidee','Flying'] },
    americas: { freezing:[333,'Swablu','Normal/Flying'], cold:[396,'Starly','Normal/Flying'], mild:[661,'Fletchling','Normal/Flying'], warm:[16,'Pidgey','Normal/Flying'], hot:[636,'Larvesta','Bug/Fire'] },
    africa:   { freezing:[333,'Swablu','Normal/Flying'], cold:[333,'Swablu','Normal/Flying'], mild:[16,'Pidgey','Normal/Flying'], warm:[16,'Pidgey','Normal/Flying'], hot:[636,'Larvesta','Bug/Fire'] },
    oceania:  { freezing:[333,'Swablu','Normal/Flying'], cold:[333,'Swablu','Normal/Flying'], mild:[396,'Starly','Normal/Flying'], warm:[821,'Rookidee','Flying'], hot:[821,'Rookidee','Flying'] },
  },

  // CLEAR DAY
  clear: {
    asia:     { freezing:[471,'Glaceon','Ice'], cold:[470,'Leafeon','Grass'], mild:[133,'Eevee','Normal'], warm:[6,'Charizard','Fire/Flying'], hot:[78,'Rapidash','Fire'] },
    europe:   { freezing:[471,'Glaceon','Ice'], cold:[470,'Leafeon','Grass'], mild:[133,'Eevee','Normal'], warm:[6,'Charizard','Fire/Flying'], hot:[38,'Ninetales','Fire'] },
    americas: { freezing:[471,'Glaceon','Ice'], cold:[470,'Leafeon','Grass'], mild:[133,'Eevee','Normal'], warm:[6,'Charizard','Fire/Flying'], hot:[244,'Entei','Fire'] },
    africa:   { freezing:[471,'Glaceon','Ice'], cold:[470,'Leafeon','Grass'], mild:[470,'Leafeon','Grass'], warm:[244,'Entei','Fire'], hot:[78,'Rapidash','Fire'] },
    oceania:  { freezing:[471,'Glaceon','Ice'], cold:[333,'Swablu','Normal/Flying'], mild:[133,'Eevee','Normal'], warm:[6,'Charizard','Fire/Flying'], hot:[78,'Rapidash','Fire'] },
  },

  // CLEAR NIGHT
  night: {
    asia:     { freezing:[471,'Glaceon','Ice'], cold:[197,'Umbreon','Dark'], mild:[196,'Espeon','Psychic'], warm:[197,'Umbreon','Dark'], hot:[197,'Umbreon','Dark'] },
    europe:   { freezing:[471,'Glaceon','Ice'], cold:[197,'Umbreon','Dark'], mild:[196,'Espeon','Psychic'], warm:[197,'Umbreon','Dark'], hot:[197,'Umbreon','Dark'] },
    americas: { freezing:[471,'Glaceon','Ice'], cold:[197,'Umbreon','Dark'], mild:[197,'Umbreon','Dark'], warm:[197,'Umbreon','Dark'], hot:[197,'Umbreon','Dark'] },
    africa:   { freezing:[197,'Umbreon','Dark'], cold:[197,'Umbreon','Dark'], mild:[197,'Umbreon','Dark'], warm:[197,'Umbreon','Dark'], hot:[197,'Umbreon','Dark'] },
    oceania:  { freezing:[471,'Glaceon','Ice'], cold:[197,'Umbreon','Dark'], mild:[196,'Espeon','Psychic'], warm:[197,'Umbreon','Dark'], hot:[197,'Umbreon','Dark'] },
  },
};

export function getPokemon(condition, icon, tempCelsius, country) {
  const condKey  = getConditionKey(condition, icon);
  const continent = getContinent(country);
  const tempBand = getTempBand(tempCelsius);

  const byContinent = POKEMON_TABLE[condKey]?.[continent]
                   || POKEMON_TABLE[condKey]?.['asia'];
  const entry = byContinent?.[tempBand] || [133, 'Eevee', 'Normal'];

  const [id, name, type] = entry;
  return {
    id,
    name,
    type,
    artworkUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
    spriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
  };
}
