import React, { useState, useEffect } from "react";
import axios from "axios";
const api = "https://apijmdictmod.vercel.app/api/search"; // Online server
//const api = "http://localhost:5000/api/search" // Local server
const SearchBar = ({ setResults }) => {
    const [query, setQuery] = useState("");
    const [kanjiQuery, setKanjiQuery] = useState("");
    const [readingQuery, setReadingQuery] = useState("");
    const [mode, setMode] = useState("any");
    const handleSearch = async () => {
        let searchQuery = query;
        if (mode === "both") {
            searchQuery = `${kanjiQuery},${readingQuery}`;
        }
        try {
            const response = await axios.get(api, {
                params: { query: searchQuery, mode },
            });
            setResults(response.data.results);
            console.log("Search results:", response.data);
        } catch (error) {
            console.error("Search error:", error);
            setResults([]);
        }
    };
    useEffect(() => {
        handleSearch();
    }, [mode]); // Auto search when mode changes
    // Handle Enter key press
    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };
    return (
        <div className="search-container">
            {mode === "both" ? (
                <div className="dual-inputs">
                    <input
                        type="text"
                        placeholder="Enter Kanji (optional)..."
                        value={kanjiQuery}
                        onChange={(e) => setKanjiQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <input
                        type="text"
                        placeholder="Enter Reading (optional)..."
                        value={readingQuery}
                        onChange={(e) => setReadingQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                </div>
            ) : (
                <input
                    type="text"
                    placeholder="Enter search term..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
            )}
            <select value={mode} onChange={(e) => setMode(e.target.value)}>
                <option value="exact">Exact Match</option>
                <option value="any">Contains</option>
                <option value="both">Kanji & Reading</option>
                <option value="en_exact">Exact English Meaning</option>
                <option value="en_any">Contains in English Meaning</option>
            </select>
            <button onClick={handleSearch}>Search</button>
        </div>
    );
};
export default SearchBar;