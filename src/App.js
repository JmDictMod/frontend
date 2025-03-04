import React, { useState, useEffect } from "react";
import SearchBar from "./components/SearchBar";
import SearchResults from "./components/ResultsList";
import "./App.css";

const App = () => {
    const [results, setResults] = useState([]);
    const [activeUsers, setActiveUsers] = useState(0);
    const [totalVisitors, setTotalVisitors] = useState(0);
    
    useEffect(() => {
        // Fetch total visitors
        fetch("/api/visitors")
            .then(res => res.json())
            .then(data => setTotalVisitors(data.totalVisitors));

        // Fetch active users every 10 seconds
        const fetchActiveUsers = () => {
            fetch("/api/active-users")
                .then(res => res.json())
                .then(data => setActiveUsers(data.activeUsers));
        };

        fetchActiveUsers();
        const interval = setInterval(fetchActiveUsers, 10000); // Update every 10 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            <h1>Japanese Dictionary</h1>
            <SearchBar setResults={setResults} />
            <SearchResults results={results} />
            <p>Active Users: {activeUsers}</p>
            <p>Total Visitors: {totalVisitors}</p>
        </div>
    );
};

export default App;
