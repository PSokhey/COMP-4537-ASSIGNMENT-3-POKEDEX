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

function Result({ selectedTypes, searchName }) {
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
        const nameMatch = pokemon.name.english
          .toLowerCase()
          .includes(searchName.toLowerCase());

        // If no types are selected and the name matches, display the Pokémon
        if (selectedTypes.length === 0 && nameMatch) {
          return <Pokemon pokemon={pokemon} />;
        }

        // If a type is selected and the name matches, display the Pokémon
        if (
          selectedTypes.every((type) => pokemon.type.includes(type)) &&
          nameMatch
        ) {
          return <Pokemon pokemon={pokemon} />;
        }

        return null;
      })}
    </div>
  );
}

export default Result;
