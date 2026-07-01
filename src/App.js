import React, { useState } from "react";
import { Analytics } from '@vercel/analytics/react';
import { BrowserRouter } from "react-router-dom";
import SearchBar from "./components/SearchBar";
import SearchResults from "./components/ResultsList";
import { AppPromoHeader, AppPromoSideBanner } from "./components/AppPromo";
import "./App.css";

const App = () => {
    const [results, setResults] = useState([]);

    return (
        <BrowserRouter>
            <AppPromoHeader />
            <div className="app-shell">
                <aside className="ad-rail ad-rail-left">
                    <AppPromoSideBanner side="left" />
                </aside>
                <div className="main-container">
                    <h1>Japanese Dictionary</h1>
                    <SearchBar setResults={setResults} />
                    <SearchResults results={results} />
                    <Analytics />
                </div>
                <aside className="ad-rail ad-rail-right">
                    <AppPromoSideBanner side="right" />
                </aside>
            </div>
        </BrowserRouter>
    );
};

export default App;
