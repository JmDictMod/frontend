import React, { useState, useEffect } from "react";

const SearchResults = ({ results }) => {
    const [selectedTag, setSelectedTag] = useState(null);
    const [filteredResults, setFilteredResults] = useState(results);
    const [tagColors, setTagColors] = useState({});
    const [itemsPerPage, setItemsPerPage] = useState(100);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedKanji, setSelectedKanji] = useState(null);
    const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
    const [kanjiData, setKanjiData] = useState([]);
    const [tagBank, setTagBank] = useState([]);

    // Fetch kanji.json and tagbank.json data
    useEffect(() => {
        fetch('/kanji.json')
            .then(response => response.json())
            .then(data => setKanjiData(data))
            .catch(error => console.error('Error fetching kanji data:', error));

        fetch('/tagbank.json')
            .then(response => response.json())
            .then(data => setTagBank(data))
            .catch(error => console.error('Error fetching tagbank data:', error));
    }, []);

    const countTagOccurrences = () => {
        const tagCounts = {};
        results.forEach(entry => {
            const tagIds = entry.l.split(',').map(tag => tag.trim()).filter(tag => tag); // Updated to use 'l' for tags
            tagIds.forEach(tagId => {
                const tag = tagBank.find(t => t.id === parseInt(tagId));
                if (tag) {
                    tagCounts[tag.tag] = (tagCounts[tag.tag] || 0) + 1;
                }
            });
        });
        return tagCounts;
    };

    const [tagCounts, setTagCounts] = useState(countTagOccurrences());

    useEffect(() => {
        setTagCounts(countTagOccurrences());
        if (selectedTag) {
            // Filter by selected tag name
            setFilteredResults(results.filter(entry => 
                entry.l.split(',').map(tag => tag.trim()).some(tagId => // Updated to use 'l' for tags
                    tagBank.find(t => t.id === parseInt(tagId) && t.tag === selectedTag)
                )
            ));
        } else {
            // Use original results when "All Tags" is selected
            setFilteredResults(results);
        }
        setCurrentPage(1);
    }, [results, selectedTag, tagBank]);

    const handleTagSelect = (tag) => {
        setSelectedTag(tag);
        setCurrentPage(1);
        window.scrollTo(0, 0);
    };

    const generateColor = (input) => {
        let hash = 0;
        const str = String(input); // Ensure input is a string
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return `hsl(${hash % 360}, 70%, 60%)`;
    };

    useEffect(() => {
        const colors = {};
        Object.keys(tagCounts).forEach(tag => {
            colors[tag] = generateColor(tag);
        });
        // Generate colors for frequency values
        results.forEach(entry => {
            if (entry.o) { // Updated to use 'o' for frequency
                colors[`freq-${entry.o}`] = generateColor(entry.o); // Updated to use 'o'
            }
        });
        setTagColors(colors);
    }, [tagCounts, results]);

    const handleKanjiClick = (kanji, event) => {
        event.preventDefault();
        if (selectedKanji === kanji) {
            setSelectedKanji(null);
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

    // Find the kanji details from kanjiData
    const selectedKanjiDetails = selectedKanji ? kanjiData.find(item => item.kanji === selectedKanji) : null;

    // Convert tag IDs to tag objects for display
    const getTagObjects = (tagString) => {
        return tagString.split(',').map(tagId => {
            const trimmedId = tagId.trim();
            return tagBank.find(t => t.id === parseInt(trimmedId));
        }).filter(tag => tag);
    };

    return (
        <div id="search-results">
            <div className="results">
                <p id="result-count">Found {filteredResults.length} result(s)</p>
                <select 
                    value={selectedTag || ""} 
                    onChange={(e) => handleTagSelect(e.target.value || null)} 
                    style={{ 
                        backgroundColor: "#fff", 
                        color: "#000", 
                        padding: "3px 8px", 
                        borderRadius: "4px", 
                        marginRight: "5px" 
                    }}
                >
                    <option value="">All Tags</option>
                    {Object.entries(tagCounts).map(([tag, count]) => (
                        <option key={tag} value={tag}>
                            {`${tag} (${count}) - ${tagBank.find(t => t.tag === tag)?.description || "No description available"}`}
                        </option>
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
                                {entry.f ? ( // Updated to use 'f' for furigana
                                    entry.f.map((part, idx) =>
                                        part.a ? ( // Updated to use 'a' for rt
                                            <ruby key={idx}>
                                                {part.b.split('').map((char, charIdx) => ( // Updated to use 'b' for ruby
                                                    <span 
                                                        key={`${idx}-${charIdx}`} 
                                                        className="kanji-char" 
                                                        onClick={(e) => handleKanjiClick(char, e)}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        {char}
                                                    </span>
                                                ))}
                                                <rt>{part.a}</rt> // Updated to use 'a' for rt
                                            </ruby>
                                        ) : (
                                            part.b // Updated to use 'b' for ruby
                                        )
                                    )
                                ) : (
                                    <ruby>
                                        {entry.t.split('').map((char, charIdx) => ( // Updated to use 't' for term
                                            <span 
                                                key={charIdx} 
                                                className="kanji-char" 
                                                onClick={(e) => handleKanjiClick(char, e)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                {char}
                                            </span>
                                        ))}
                                        <rt>{entry.r}</rt> // Updated to use 'r' for reading
                                    </ruby>
                                )}
                            </span>
                            <p className="meanings">
                                {entry.m.join(", ")} // Updated to use 'm' for meanings
                            </p>
                            {(entry.l || entry.o) && ( // Updated to use 'l' for tags and 'o' for frequency
                                <div className="tags">
                                    {getTagObjects(entry.l).map((tag, idx) => ( // Updated to use 'l' for tags
                                        <span 
                                            key={idx} 
                                            className="tag" 
                                            title={tag.description}
                                            style={{ backgroundColor: tagColors[tag.tag] || "#ccc", color: "#fff", padding: '3px 8px', borderRadius: '4px', marginRight: '5px' }}
                                        >
                                            {tag.tag}
                                        </span>
                                    ))}
                                    {entry.o && ( // Updated to use 'o' for frequency
                                        <span 
                                            className="tag frequency" 
                                            title="Frequency rank"
                                            style={{ backgroundColor: tagColors[`freq-${entry.o}`] || "#ccc", color: "#fff", padding: '3px 8px', borderRadius: '4px', marginRight: '5px' }}
                                        >
                                            FR: {entry.o} // Updated to use 'o' for frequency
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                    {selectedKanji && (
                        <div 
                            className="kanji-dropdown"
                            style={{
                                position: 'absolute',
                                top: `${dropdownPosition.y}px`,
                                left: `${dropdownPosition.x}px`,
                                zIndex: 1000,
                                background: '#000000',
                                border: '1px solid #ccc',
                                padding: '15px',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '15px',
                                maxWidth: '90vw',
                                overflowX: 'auto',
                                borderRadius: '8px'
                            }}
                        >
                            {selectedKanjiDetails ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'row', gap: '15px', flexWrap: 'wrap' }}>
                                        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <p style={{ margin: '0', fontSize: '24px', color: '#1e5761'}}><strong>Meaning:</strong> {selectedKanjiDetails.meaning}</p>
                                            <p style={{ margin: '0', fontSize: '28px', color: '#1e5761' }}><strong>Kun Reading:</strong> {selectedKanjiDetails.kun_reading}</p>
                                            <p style={{ margin: '0', fontSize: '28px', color: '#1e5761' }}><strong>On Reading:</strong> {selectedKanjiDetails.on_reading}</p>
                                            <p style={{ margin: '0', fontSize: '18px', color: '#1e5761' }}><strong>Stroke Count:</strong> {selectedKanjiDetails.stroke_count}</p>
                                            <p style={{ margin: '0', fontSize: '18px', color: '#1e5761' }}><strong>Level:</strong> {selectedKanjiDetails.level}</p>
                                            <p style={{ margin: '0', fontSize: '18px', color: '#1e5761' }}><strong>Subject:</strong> {selectedKanjiDetails.subject}</p>
                                            <p style={{ margin: '0', fontSize: '28px', color: '#1e5761' }}><strong>Key Reading:</strong> {selectedKanjiDetails.keyread}</p>
                                            <p style={{ margin: '0', fontSize: '28px', color: '#1e5761' }}><strong>Decomposition:</strong> {selectedKanjiDetails.decomposition}</p>
                                            <p style={{ margin: '0', fontSize: '18px', color: '#1e5761' }}><strong>Sequence:</strong> {selectedKanjiDetails.sequence}</p>
                                        </div>
                                        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                                            <img 
                                                src={`https://raw.githubusercontent.com/quizgoi/Kakijun/main/animation/${selectedKanji}.gif`}
                                                alt={`Animation for ${selectedKanji}`}
                                                onError={(e) => e.target.style.display = 'none'}
                                                style={{ maxWidth: '200px', height: 'auto', border: '1px solid #ddd', borderRadius: '4px' }}
                                            />
                                            <img 
                                                src={`https://raw.githubusercontent.com/quizgoi/Kakijun/main/kanji-kakijun/${selectedKanji}.png`}
                                                alt={`Kakijun for ${selectedKanji}`}
                                                onError={(e) => e.target.style.display = 'none'}
                                                style={{ maxWidth: '200px', height: 'auto', border: '1px solid #ddd', borderRadius: '4px' }}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                        <img 
                                            src={`https://raw.githubusercontent.com/quizgoi/Kakijun/main/kanjifont/${selectedKanji}.png`}
                                            alt={`Font for ${selectedKanji}`}
                                            onError={(e) => e.target.style.display = 'none'}
                                            style={{ maxWidth: '400px', height: 'auto', border: '1px solid #ddd', borderRadius: '4px' }}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <p style={{ margin: '0', fontSize: '16px', color: '#888' }}>No details available for this kanji.</p>
                            )}
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