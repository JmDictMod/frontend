import React, { useState, useEffect } from "react";
const SearchResults = ({ results }) => {
    const [selectedTag, setSelectedTag] = useState(null);
    const [filteredResults, setFilteredResults] = useState(results);
    const [tagColors, setTagColors] = useState({});
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
    const [tagCounts, setTagCounts] = useState(countTagOccurrences());
    useEffect(() => {
        setTagCounts(countTagOccurrences());
        setFilteredResults(results);
        setSelectedTag(null);
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
            setFilteredResults(results);
        }
    };
    // Function to generate a random color for each tag
    const generateColor = (tag) => {
        let hash = 0;
        for (let i = 0; i < tag.length; i++) {
            hash = tag.charCodeAt(i) + ((hash << 5) - hash);
        }
        const color = `hsl(${hash % 360}, 70%, 60%)`; // Generates a color in the HSL spectrum
        return color;
    };
    useEffect(() => {
        const colors = {};
        Object.keys(tagCounts).forEach(tag => {
            colors[tag] = generateColor(tag);
        });
        setTagColors(colors);
    }, [tagCounts]);
    return (
        <div id="search-results">
            <div className="results">
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
                                        <span 
                                            key={idx} 
                                            className="tag" 
                                            title={tag.description}
                                            style={{ backgroundColor: tagColors[tag.tag] || "#ccc", color: "#fff", padding: "3px 8px", borderRadius: "4px", marginRight: "5px" }}
                                        >
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