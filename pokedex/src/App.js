import Search from "./Search";
import Result from "./Result";
import { useState } from "react";

function App() {
  // this is the state that will be shared between the Search and Result components for the selected types.
  const [selectedTypes, setSelectedTypes] = useState([]);

  // the Search and Result components are rendered as siblings, and they will share the state.
  // Props are passed to the component, within the components the props are destructured and used.
  return (
    <>
      <Search
        selectedTypes={selectedTypes}
        setSelectedTypes={setSelectedTypes}
      />
      <Result
        selectedTypes={selectedTypes}
      />
    </>
  );
}

export default App;