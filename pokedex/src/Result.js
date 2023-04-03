import React from 'react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import './style.css';

// show more details of the pokemon when clicked.
function PokemonDetails({ pokemon, onClose }) {
  return (
    <div className="modal">
      <div className="modal-content">
        <h1>{pokemon.name.english}</h1>
        <img
          src={`https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/images/${pokemon.id
            .toString()
            .padStart(3, '0')}.png`}
          alt={pokemon.name.english}
        />
        <ul>
          {Object.entries(pokemon.base).map(([stat, value]) => (
            <li key={stat}>
              {stat}: {value}
            </li>
          ))}
        </ul>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

// Pokemon function takes in the pokemon object and the onClick function as props, defines how it is used.
function Pokemon({ pokemon, onClick }) {
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
  const pokemonsPerPage = 15;

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

  // return the page title, the pokemon objects in a grid, and the pagination buttons.
  // previous button is only displayed if the current page is greater than 1.
  // next button is only displayed if the current page is less than the total number of pages.
  return (
    <div>
      {selectedPokemon && (
        <PokemonDetails pokemon={selectedPokemon} onClose={handleCloseDetails} />
      )}
      <h1 className="title">Page {currentPage}</h1>
      <div className="grid">
        {currentPokemons.map((pokemon) => (
          <Pokemon key={pokemon.id} pokemon={pokemon} onClick={() => handlePokemonClick(pokemon)} />
        ))}
      </div>
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
    </div>
  );
}

export default Result;
