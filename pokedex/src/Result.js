// The Result component is responsible for displaying the results of the search.

import React from 'react'
import axios from 'axios'
import { useEffect } from 'react'
import { useState } from 'react'

// Result function takes in the selectedTypes state as a prop, defines how it is used.
function Result({ selectedTypes }) {

  const [pokemons, setPokemons] = useState([])

  // called once when component is mounted to get all the pokemon.
  useEffect(() => {
    async function fetchData() {
      const response = await axios.get('https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/pokedex.json')
      setPokemons(response.data)
    }
    fetchData()
  }, [])

  // returns a list of pokemon names that match the selected types and how to dislay them. 
  return (
    <div>
      {
        pokemons.map(pokemon => {

          // if no types are selected, display all pokemon
          if (selectedTypes.length === 0) {
            return (
              <div key={pokemon.id}>
                {pokemon.name.english}
                <br />
              </div>
            )

            // if a type is selected, display only pokemon that match the type
          } else
            if (selectedTypes.every(type => pokemon.type.includes(type))) {
              return (
                <div key={pokemon.id}>
                  {pokemon.name.english}
                  <br />
                </div>
              )
            }
        })
      }
    </div>
  )
}

export default Result