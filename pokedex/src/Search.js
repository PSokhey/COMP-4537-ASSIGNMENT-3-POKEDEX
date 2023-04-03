// This component is responsible for filtering the pokemon by type

import React from 'react'
import axios from 'axios'
import { useEffect } from 'react'
import { useState } from 'react'

// searcg function takes in the selectedTypes state and the setSelectedTypes function as props, defines how it is used. 
function Search({ selectedTypes, setSelectedTypes }) {
  const [types, setTypes] = useState([])

  // called once when component is mounted to get all the english types. 
  useEffect(() => {
    async function fetchData() {
      const response = await axios.get('https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/types.json')
      setTypes(response.data.map(type => type.english))
    }
    fetchData()
  }, [])

  // called when the selectedTypes state changes
  const handleChange = (e) => {
    const { value, checked } = e.target
    // if the checkbox is checked, add the type to the selectedTypes state
    if (checked) {
      setSelectedTypes([...selectedTypes, value])
      // if the checkbox is unchecked, remove the type from the selectedTypes state
    } else {
      setSelectedTypes(selectedTypes.filter(type => type !== value))
    }
  }
  
  // returns a list of checkboxes for each type and how to display them. 
  return (
    <div>
      {
        types.map(type => <div key={type}>
          <input
            type="checkbox"
            value={type}
            id={type}
            onChange={handleChange}
          />
          <label htmlFor={type}>{type}</label>
        </div>)
      }
    </div>
  )
}

export default Search