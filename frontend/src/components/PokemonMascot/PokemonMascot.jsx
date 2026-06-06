import { useState } from 'react';
import { getPokemon } from './PokemonMap.js';
import './PokemonMascot.css';

function PokemonImage({ pokemon }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [imgSrc, setImgSrc] = useState(pokemon.artworkUrl);

  return (
    <div className={`pokemon-img-wrap ${imgLoaded || imgError ? 'loaded' : ''}`}>
      {imgError ? (
        <div className="pokemon-placeholder" aria-label={pokemon.name}>
          {pokemon.name.slice(0, 1)}
        </div>
      ) : (
        <img
          src={imgSrc}
          alt={pokemon.name}
          className="pokemon-img"
          onLoad={() => setImgLoaded(true)}
          onError={() => {
            if (imgSrc !== pokemon.spriteUrl) {
              setImgLoaded(false);
              setImgSrc(pokemon.spriteUrl);
            } else {
              setImgError(true);
            }
          }}
          draggable="false"
        />
      )}
    </div>
  );
}

export default function PokemonMascot({
  condition,
  icon,
  temperature,
  country,
  windSpeed,
  rainChance,
}) {
  const pokemon = getPokemon(condition, icon, temperature, country, windSpeed, rainChance);

  return (
    <div className="pokemon-mascot">
      <PokemonImage key={pokemon.id} pokemon={pokemon} />
      <div className="pokemon-badge">
        <span className="pokemon-name">{pokemon.name}</span>
      </div>
    </div>
  );
}
