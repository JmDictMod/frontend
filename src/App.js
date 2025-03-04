import './index.css';
import React, { useState } from "react";
import SearchBar from "./components/SearchBar";
import SearchResults from "./components/ResultsList";
import "./App.css";

const App = () => {
    const [results, setResults] = useState([]);

    return (
        <div>
            <h1>Japanese Dictionary</h1>
            <SearchBar setResults={setResults} />
            <SearchResults results={results} />
        </div>
    );
};

export default App;
