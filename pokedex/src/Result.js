import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './style.css';

async function sendAnalyticsEvent(eventType, pokemonId) {
  try {
    const token = localStorage.getItem('accessToken');
    await axios.post(
      `https://prabh-sokhey-pokedex.onrender.com/analytics/${eventType}`,
      { pokemonId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (error) {
    console.error(`Failed to send analytics event: ${eventType}`);
  }
}

function PokemonDetails({ pokemon, onClose }) {
  const sentEvent = useRef(false);

  useEffect(() => {
    if (!sentEvent.current) {
      sendAnalyticsEvent('pokemon-clicked', pokemon.id);
      sentEvent.current = true;
    }
  }, [pokemon]);

  return (
    <>
    <div className="modal-background" onClick={onClose}></div>
    <div className="pokemon-card" id="pokemonCard">
      <div className="pokemon-card-image">
        <img
          src={`https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/images/${pokemon.id
            .toString()
            .padStart(3, '0')}.png`}
          alt={pokemon.name.english}
          id="pokemonImage"
        />
      </div>
      <div className="pokemon-card-info">
        <h2 id="pokemonName">{pokemon.name.english}</h2>
        <ul>
          {pokemon.type.map((type) => (
            <li key={type}>Type: {type}</li>
          ))}
          {Object.entries(pokemon.base).map(([stat, value]) => (
            <li key={stat}>
              {stat}: {value}
            </li>
          ))}
        </ul>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
    </>
  );
}

function Pokemon({ pokemon, onClick }) {
  const sentEvent = useRef(false);

  useEffect(() => {
    if (!sentEvent.current) {
      sendAnalyticsEvent('pokemon-image-generated', pokemon.id);
      sentEvent.current = true;
    }
  }, [pokemon]);

  return (
    <div className="pokemonObject" key={pokemon.id} onClick={onClick}>
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

// Result function takes in the selectedTypes state and the searchName state as props, defines how it is used.
function Result({ selectedTypes, searchName }) {
  const [pokemons, setPokemons] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [pokemonsPerPage, setPokemonsPerPage] = useState(15);
  

  useEffect(() => {
    async function fetchData() {
      const response = await axios.get(
        'https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/pokedex.json'
      );
      setPokemons(response.data);
    }
    fetchData();
  }, []);
  

  // filter the pokemons based on the selected types and the search name.
  const filteredPokemons = pokemons.filter((pokemon) => {
    const nameMatch = pokemon.name.english
      .toLowerCase()
      .includes(searchName.toLowerCase());

    if (selectedTypes.length === 0) {
      return nameMatch;
    }

    return selectedTypes.every((type) => pokemon.type.includes(type)) && nameMatch;
  });

  // pagination logic for the first, last, and current page.
  const indexOfLastPokemon = currentPage * pokemonsPerPage;
  const indexOfFirstPokemon = indexOfLastPokemon - pokemonsPerPage;
  const currentPokemons = filteredPokemons.slice(indexOfFirstPokemon, indexOfLastPokemon);

  // calculate the total number of pages needed.
  const totalPages = Math.ceil(filteredPokemons.length / pokemonsPerPage);

  // if the current page is greater than the total number of pages, set the current page to the last page.
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(1, totalPages));
    }
  }, [totalPages, currentPage]);

  // handle the next button.
  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  // handle the previous button.
  const handlePrevPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  // handle the page number buttons.
  const handlePageNumber = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // handle the pokemon object click.
  const handlePokemonClick = (pokemon) => {
    setSelectedPokemon(pokemon);
  };

  // handle the close button on the pokemon details.
  const handleCloseDetails = () => {
    setSelectedPokemon(null);
  };

  // handle the pokemons per page change.
  const handlePokemonsPerPageChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (value >= 1) {
      setPokemonsPerPage(value);
      setCurrentPage((prevPage) => Math.min(prevPage, Math.ceil(filteredPokemons.length / value)));
    }
  };

  // return the page title, the pokemon objects in a grid, and the pagination buttons.
  // previous button is only displayed if the current page is greater than 1.
  // next button is only displayed if the current page is less than the total number of pages.
  return (
    <div>
      {selectedPokemon && (
        <PokemonDetails pokemon={selectedPokemon} onClose={handleCloseDetails} />
      )}
      <h1 className="title">Page {currentPage}</h1>
      <div className="pagination">
        {currentPage > 1 && (
          <button onClick={handlePrevPage}>&laquo; Previous</button>
        )}
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .slice(Math.max(currentPage - 10, 0), Math.min(currentPage + 10, totalPages))
          .map((pageNumber) => (
            <button
              key={pageNumber}
              onClick={() => handlePageNumber(pageNumber)}
              className={pageNumber === currentPage ? 'btnActive' : ''}
            >
              {pageNumber}
            </button>
          ))}
        {currentPage < totalPages && (
          <button onClick={handleNextPage}>Next &raquo;</button>
        )}
      </div>
      <div>
        <label htmlFor="pokemonsPerPage">Pokémon per page:</label>
        <input
          type="number"
          id="pokemonsPerPage"
          value={pokemonsPerPage}
          onChange={handlePokemonsPerPageChange}
          min="1"
        />
      </div>
      <div className="grid">
        {currentPokemons.map((pokemon) => (
          <Pokemon key={pokemon.id} pokemon={pokemon} onClick={() => handlePokemonClick(pokemon)} />
        ))}
      </div>
    </div>
  );
}

export default Result;