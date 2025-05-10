import React, { useState } from "react";
import { Analytics } from '@vercel/analytics/react';
import { BrowserRouter } from "react-router-dom";
import SearchBar from "./components/SearchBar";
import SearchResults from "./components/ResultsList";
import "./App.css";

const App = () => {
    const [results, setResults] = useState([]);

    return (
        <BrowserRouter>
            <div className="main-container">
                <h1>辞書</h1>
                <SearchBar setResults={setResults} />
                <SearchResults results={results} />
                <Analytics />
            </div>
        </BrowserRouter>
    );
};

export default App;
