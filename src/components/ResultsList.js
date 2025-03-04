import React, { useState, useEffect } from "react";

const SearchResults = ({ results }) => {
    const [selectedTag, setSelectedTag] = useState(null);
    const [filteredResults, setFilteredResults] = useState(results);
    const [tagColors, setTagColors] = useState({});
    const [itemsPerPage, setItemsPerPage] = useState(1000);
    const [currentPage, setCurrentPage] = useState(1);

    // NEW STATE FOR KANJI DROPDOWN
    const [selectedKanji, setSelectedKanji] = useState(null);
    const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });

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
        setCurrentPage(1);
    }, [results]);

    const handleTagSelect = (tag) => {
        setSelectedTag(tag);
        setCurrentPage(1);
        window.scrollTo(0, 0);
        setFilteredResults(tag ? results.filter(entry => entry.tags.some(entryTag => entryTag.tag === tag)) : results);
    };

    const generateColor = (tag) => {
        let hash = 0;
        for (let i = 0; i < tag.length; i++) {
            hash = tag.charCodeAt(i) + ((hash << 5) - hash);
        }
        return `hsl(${hash % 360}, 70%, 60%)`;
    };

    useEffect(() => {
        const colors = {};
        Object.keys(tagCounts).forEach(tag => {
            colors[tag] = generateColor(tag);
        });
        setTagColors(colors);
    }, [tagCounts]);

    // NEW FUNCTIONS FOR KANJI HANDLING
    const handleKanjiClick = (kanji, event) => {
        event.preventDefault();
        if (selectedKanji === kanji) {
            setSelectedKanji(null); // Close if clicking same kanji
        } else {
            const rect = event.target.getBoundingClientRect();
            setSelectedKanji(kanji);
            setDropdownPosition({
                x: rect.left,
                y: rect.bottom + window.scrollY
            });
        }
    };

    const handleOutsideClick = (event) => {
        if (selectedKanji && !event.target.closest('.kanji-dropdown') && !event.target.closest('.kanji-char')) {
            setSelectedKanji(null);
        }
    };

    useEffect(() => {
        document.addEventListener('click', handleOutsideClick);
        return () => document.removeEventListener('click', handleOutsideClick);
    }, [selectedKanji]);

    const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
    const paginatedResults = filteredResults.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo(0, 0);
    };

    return (
        <div id="search-results">
            <div className="results">
                <p id="result-count">Found {filteredResults.length} result(s)</p>
                <select value={selectedTag || ""} onChange={(e) => handleTagSelect(e.target.value || null)}>
                    <option value="">All Tags</option>
                    {Object.entries(tagCounts).map(([tag, count]) => (
                        <option key={tag} value={tag}>{tag} ({count})</option>
                    ))}
                </select>
                <input
                    type="number"
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Math.min(Math.max(1, Number(e.target.value)), filteredResults.length))}
                    min="1"
                    max={filteredResults.length}
                />
            </div>
            {paginatedResults.length > 0 ? (
                <>
                    {paginatedResults.map((entry, index) => (
                        <div key={index} className="entry">
                            <span className="result-number">{(currentPage - 1) * itemsPerPage + index + 1}. </span>
                            <span className="term-with-furigana">
                                {entry.furigana ? (
                                    entry.furigana.map((part, idx) => {
                                        if (part.rt) {
                                            const kanjiParts = part.ruby.split('').map((char, charIdx) => (
                                                <span 
                                                    key={`${idx}-${charIdx}`} 
                                                    className="kanji-char" 
                                                    onClick={(e) => handleKanjiClick(char, e)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    {char}
                                                </span>
                                            ));
                                            return (
                                                <ruby key={idx}>
                                                    {kanjiParts}
                                                    <rt>{part.rt}</rt>
                                                </ruby>
                                            );
                                        }
                                        return part.ruby;
                                    })
                                ) : (
                                    entry.term.split('').map((char, charIdx) => (
                                        <span 
                                            key={charIdx} 
                                            className="kanji-char" 
                                            onClick={(e) => handleKanjiClick(char, e)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {char}
                                        </span>
                                    ))
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
                    {/* MODIFIED KANJI DROPDOWN */}
                    {selectedKanji && (
                        <div 
                            className="kanji-dropdown"
                            style={{
                                position: 'absolute',
                                top: `${dropdownPosition.y}px`,
                                left: `${dropdownPosition.x}px`,
                                zIndex: 1000,
                                background: 'white',
                                border: '1px solid #ccc',
                                padding: '10px',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px',
                                maxWidth: '90vw',
                                overflowX: 'auto'
                            }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
                                <div style={{ flex: '0 0 auto' }}>
                                    <img 
                                        src={`https://raw.githubusercontent.com/quizgoi/Kakijun/main/animation/${selectedKanji}.gif`}
                                        alt={`Animation for ${selectedKanji}`}
                                        onError={(e) => e.target.style.display = 'none'}
                                        style={{ width: '300px', height: 'auto' }}
                                    />
                                </div>
                                <div style={{ flex: '0 0 auto' }}>
                                    <img 
                                        src={`https://raw.githubusercontent.com/quizgoi/Kakijun/main/kanji-kakijun/${selectedKanji}.png`}
                                        alt={`Kakijun for ${selectedKanji}`}
                                        onError={(e) => e.target.style.display = 'none'}
                                        style={{ width: '300px', height: 'auto' }}
                                    />
                                </div>
                            </div>
                            <div style={{ flex: '0 0 auto' }}>
                                <img 
                                    src={`https://raw.githubusercontent.com/quizgoi/Kakijun/main/kanjifont/${selectedKanji}.png`}
                                    alt={`Font for ${selectedKanji}`}
                                    onError={(e) => e.target.style.display = 'none'}
                                    style={{ width: '600px', height: 'auto' }}
                                />
                            </div>
                        </div>
                    )}
                    <div className="pagination">
                        <button onClick={() => handlePageChange(1)} disabled={currentPage === 1}>First</button>
                        <button onClick={() => handlePageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>Prev</button>
                        <span>Page {currentPage} of {totalPages}</span>
                        <button onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>Next</button>
                        <button onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages}>Last</button>
                    </div>
                </>
            ) : (
                <p>No results found.</p>
            )}
        </div>
    );
};

export default SearchResults;