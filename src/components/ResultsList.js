import React, { useState, useEffect } from "react";

const SearchResults = ({ results }) => {
    const [selectedTag, setSelectedTag] = useState(null);
    const [filteredResults, setFilteredResults] = useState(results);

    // Function to count tag occurrences
    const countTagOccurrences = () => {
        const tagCounts = {};
        results.forEach(entry => {
            entry.tags.forEach(tag => {
                tagCounts[tag.tag] = (tagCounts[tag.tag] || 0) + 1;
            });
        });
        return tagCounts;
    };

    // Calculate tag counts on initial load and when results change
    const [tagCounts, setTagCounts] = useState(countTagOccurrences());
    useEffect(() => {
        setTagCounts(countTagOccurrences());
        setFilteredResults(results); // Reset filtered results when the main results change
        setSelectedTag(null); // Clear selected tag when main results change
    }, [results]);

    // Function to handle tag selection
    const handleTagSelect = (tag) => {
        setSelectedTag(tag);
        if (tag) {
            const newFilteredResults = results.filter(entry =>
                entry.tags.some(entryTag => entryTag.tag === tag)
            );
            setFilteredResults(newFilteredResults);
        } else {
            setFilteredResults(results); // Show all results if no tag is selected
        }
    };

    return (
        <div id="search-results">
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <p id="result-count">Found {results.length} result(s)</p>
        <select
            value={selectedTag || ""}
            onChange={(e) => handleTagSelect(e.target.value || null)}
        >
            <option value="">All Tags</option>
            {Object.entries(tagCounts).map(([tag, count]) => (
                <option key={tag} value={tag}>
                    {tag} ({count})
                </option>
            ))}
        </select>
    </div>

    {filteredResults.length > 0 ? (
        <>
            {filteredResults.map((entry, index) => (
                <div key={index} className="entry">
                    <span className="result-number">{index + 1}. </span>
                    <span className="term-with-furigana">
                        {entry.furigana ? (
                            entry.furigana.map((part, idx) =>
                                part.rt ? (
                                    <ruby key={idx}>
                                        {part.ruby}
                                        <rt>{part.rt}</rt>
                                    </ruby>
                                ) : (
                                    part.ruby
                                )
                            )
                        ) : (
                            <ruby>
                                {entry.term}
                                <rt>{entry.reading}</rt>
                            </ruby>
                        )}
                    </span>
                    <ul className="meanings">
                        {entry.meanings.map((meaning, idx) => (
                            <li key={idx}>{meaning}</li>
                        ))}
                    </ul>
                    {entry.tags && entry.tags.length > 0 && (
                        <div className="tags">
                            {entry.tags.map((tag, idx) => (
                                <span key={idx} className="tag" title={tag.description}>
                                    {tag.tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </>
    ) : (
        <p>No results found.</p>
    )}
</div>

    );
};

export default SearchResults;
