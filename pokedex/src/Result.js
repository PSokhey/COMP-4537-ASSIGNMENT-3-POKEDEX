import React from 'react';
import axios from 'axios';
import { useEffect, useState } from 'react';

// import custom styling.
import './style.css';

function Pokemon({ pokemon }) {
  return (
    <div className='pokemonObject' key={pokemon.id}>
      <h1>{pokemon.name.english}</h1>
      <img
        src={`https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/images/${pokemon.id
          .toString()
          .padStart(3, '0')}.png`}
        alt={pokemon.name.english}
      />
    </div>
  );
}

function Result({ selectedTypes }) {
  const [pokemons, setPokemons] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const response = await axios.get(
        'https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/pokedex.json'
      );
      setPokemons(response.data);
    }
    fetchData();
  }, []);

  return (
    <div className='grid'>
      {pokemons.map((pokemon) => {
        // if no types are selected, display all pokemon
        if (selectedTypes.length === 0) {
          return <Pokemon pokemon={pokemon} />;
        }
        // if a type is selected, display only pokemon that match the type
        if (selectedTypes.every((type) => pokemon.type.includes(type))) {
          return <Pokemon pokemon={pokemon} />;
        }
        return null;
      })}
    </div>
  );
}

export default Result;
