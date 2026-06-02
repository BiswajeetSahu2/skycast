import { useState, useEffect } from 'react';
import { getPokemon } from './pokemonMap.js';
import './PokemonMascot.css';

export default function PokemonMascot({ condition, icon, temperature, country }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError,  setImgError]  = useState(false);

  const pokemon = getPokemon(condition, icon, temperature, country);
  const [imgSrc, setImgSrc] = useState(pokemon.artworkUrl);

  useEffect(() => {
    setImgLoaded(false);
    setImgError(false);
    setImgSrc(pokemon.artworkUrl);
  }, [pokemon.id]);

  return (
    <div className="pokemon-mascot">
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
      <div className="pokemon-badge">
        <span className="pokemon-name">{pokemon.name}</span>
        <span className="pokemon-type">{pokemon.type}</span>
      </div>
    </div>
  );
}
