import PokemonMascot from '../PokemonMascot/PokemonMascot';

export default function PokemonCard({ weather }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: '20px'
    }}>
      <PokemonMascot weather={weather} />
    </div>
  );
}