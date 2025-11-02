import React, { useState, useEffect, useMemo } from "react";
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
    const [expandedGroups, setExpandedGroups] = useState(new Set());
    // Fetch data
    useEffect(() => {
        fetch('/kanji.json')
            .then(r => r.json())
            .then(setKanjiData)
            .catch(console.error);
        fetch('/tagbank.json')
            .then(r => r.json())
            .then(setTagBank)
            .catch(console.error);
    }, []);
    const countTagOccurrences = () => {
        const counts = {};
        results.forEach(entry => {
            entry.l?.split(',').map(t => t.trim()).filter(Boolean).forEach(id => {
                const tag = tagBank.find(t => t.id === parseInt(id));
                if (tag) counts[tag.tag] = (counts[tag.tag] || 0) + 1;
            });
        });
        return counts;
    };
    const [tagCounts, setTagCounts] = useState(countTagOccurrences());
    useEffect(() => {
        setTagCounts(countTagOccurrences());
        if (selectedTag) {
            setFilteredResults(results.filter(entry =>
                entry.l?.split(',').map(t => t.trim()).some(id =>
                    tagBank.find(t => t.id === parseInt(id) && t.tag === selectedTag)
                )
            ));
        } else {
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
        const str = String(input);
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return `hsl(${hash % 360}, 70%, 60%)`;
    };
    useEffect(() => {
        const colors = {};
        Object.keys(tagCounts).forEach(tag => colors[tag] = generateColor(tag));
        results.forEach(entry => {
            if (entry.o) colors[`freq-${entry.o}`] = generateColor(entry.o);
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
            setDropdownPosition({ x: rect.left, y: rect.bottom + window.scrollY });
        }
    };
    const handleOutsideClick = (e) => {
        if (selectedKanji && !e.target.closest('.kanji-dropdown') && !e.target.closest('.kanji-char')) {
            setSelectedKanji(null);
        }
    };
    useEffect(() => {
        document.addEventListener('click', handleOutsideClick);
        return () => document.removeEventListener('click', handleOutsideClick);
    }, [selectedKanji]);
    const selectedKanjiDetails = selectedKanji ? kanjiData.find(item => item.kanji === selectedKanji) : null;
    const getTagObjects = (tagString) => {
        return tagString?.split(',').map(id => {
            const tid = id.trim();
            return tagBank.find(t => t.id === parseInt(tid));
        }).filter(Boolean) || [];
    };
    // === GROUPING LOGIC: highest o first ===
    const groupedResults = useMemo(() => {
        const groups = new Map();
        const noGroup = [];
        filteredResults.forEach(entry => {
            const groupId = entry.g;
            if (groupId != null) {
                if (!groups.has(groupId)) groups.set(groupId, []);
                groups.get(groupId).push(entry);
            } else {
                noGroup.push(entry);
            }
        });
        const result = [];
        groups.forEach((items, groupId) => {
            const sorted = items.sort((a, b) => b.o - a.o); // highest o = most common
            const main = sorted[0];
            const others = sorted.slice(1);
            result.push({ type: 'group', main, others, groupId });
        });
        noGroup.forEach(entry => result.push({ type: 'single', entry }));
        return result.sort((a, b) => {
            const rankA = a.type === 'group' ? a.main.o : a.entry.o;
            const rankB = b.type === 'group' ? b.main.o : b.entry.o;
            return rankB - rankA; // highest first
        });
    }, [filteredResults]);
    const totalPages = Math.ceil(groupedResults.length / itemsPerPage);
    const paginatedGroups = groupedResults.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo(0, 0);
    };
    const toggleGroup = (groupId) => {
        setExpandedGroups(prev => {
            const next = new Set(prev);
            if (next.has(groupId)) next.delete(groupId);
            else next.add(groupId);
            return next;
        });
    };
    // === getFilteredReadings ===
    const getFilteredReadings = (raw) => {
        if (!raw) return [];
        return raw
            .split(",")
            .map(it => it.trim())
            .filter(reading => {
                const isNanori = reading.startsWith("*");
                const isCommon = reading.endsWith("!");
                const isOther = !isNanori && !isCommon;
                return isNanori || isCommon || isOther;
            })
            .map(it => ({
                text: it.replace(/^[*!]/, "").replace(/[!]$/, ""),
                type: it.startsWith("*") ? "nanori" : it.endsWith("!") ? "common" : "other"
            }))
            .filter(r => r.text);
    };
    return (
        <div id="search-results">
            <div className="results">
                <p id="result-count">Found {filteredResults.length} result(s)</p>
                <select
                    value={selectedTag || ""}
                    onChange={(e) => handleTagSelect(e.target.value || null)}
                    style={{ backgroundColor: "#fff", color: "#000", padding: "3px 8px", borderRadius: "4px", marginRight: "5px" }}
                >
                    <option value="">All Tags</option>
                    {Object.entries(tagCounts).map(([tag, count]) => (
                        <option key={tag} value={tag}>
                            {`${tag} (${count}) - ${tagBank.find(t => t.tag === tag)?.description || "No description"}`}
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
            {paginatedGroups.length > 0 ? (
                <>
                    {paginatedGroups.map((groupItem, index) => {
                        const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                        if (groupItem.type === 'single') {
                            return (
                                <EntryRow
                                    key={groupItem.entry.o}
                                    entry={groupItem.entry}
                                    index={globalIndex}
                                    handleKanjiClick={handleKanjiClick}
                                    tagColors={tagColors}
                                    getTagObjects={getTagObjects}
                                    getFilteredReadings={getFilteredReadings}
                                    selectedKanjiDetails={selectedKanjiDetails}
                                    selectedKanji={selectedKanji}
                                    dropdownPosition={dropdownPosition}
                                />
                            );
                        }
                        const { main, others, groupId } = groupItem;
                        const isExpanded = expandedGroups.has(groupId);
                        return (
                            <div key={`group-${groupId}`} className="entry-group" style={{ marginBottom: '16px' }}>
                                {/* Main Card with "More (X) plus/minus" inside */}
                                <div style={{
                                    backgroundColor: '#2a2a2a',
                                    border: '1px solid #444',
                                    borderRadius: '8px',
                                    padding: '12px',
                                    position: 'relative'
                                }}>
                                    <EntryRow
                                        entry={main}
                                        index={globalIndex}
                                        handleKanjiClick={handleKanjiClick}
                                        tagColors={tagColors}
                                        getTagObjects={getTagObjects}
                                        getFilteredReadings={getFilteredReadings}
                                        selectedKanjiDetails={selectedKanjiDetails}
                                        selectedKanji={selectedKanji}
                                        dropdownPosition={dropdownPosition}
                                        isMainInGroup
                                    />
                                    {/* "More (X) plus/minus" toggle */}
                                    {others.length > 0 && (
                                        <div
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleGroup(groupId);
                                            }}
                                            style={{
                                                position: 'absolute',
                                                top: '12px',
                                                right: '12px',
                                                backgroundColor: '#80CBC4',
                                                color: '#000',
                                                padding: '4px 8px',
                                                borderRadius: '16px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                fontSize: '13px',
                                                fontWeight: 'bold',
                                                cursor: 'pointer',
                                                userSelect: 'none',
                                                boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                                            }}
                                            title={`Show ${others.length} more meaning(s)`}
                                        >
                                            <span>More ({others.length})</span>
                                            <span style={{ fontSize: '16px', lineHeight: '1' }}>
                                                {isExpanded ? '➖' : '➕'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                {/* Expanded sub-items with auto numbering */}
                                {isExpanded && others.map((entry, idx) => (
                                    <div key={entry.o} style={{ marginLeft: '32px', marginTop: '8px' }}>
                                        <EntryRow
                                            entry={entry}
                                            index={`${idx + 2}`} // +2 because main is 1
                                            handleKanjiClick={handleKanjiClick}
                                            tagColors={tagColors}
                                            getTagObjects={getTagObjects}
                                            getFilteredReadings={getFilteredReadings}
                                            selectedKanjiDetails={selectedKanjiDetails}
                                            selectedKanji={selectedKanji}
                                            dropdownPosition={dropdownPosition}
                                            isSubItem
                                        />
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                    {/* Kanji Dropdown */}
                    {selectedKanji && (
                        <div className="kanji-dropdown" style={{
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
                        }}>
                            {selectedKanjiDetails ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'row', gap: '15px', flexWrap: 'wrap' }}>
                                        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <p style={{ margin: '0', fontSize: '24px', color: '#1e5761' }}><strong>Meaning:</strong> {selectedKanjiDetails.meaning}</p>
                                            <p style={{ margin: '0', fontSize: '28px', color: '#1e5761' }}>
                                                <strong>Kun Reading:</strong>{" "}
                                                {getFilteredReadings(selectedKanjiDetails.kun_reading).length > 0 ? (
                                                    <span style={{ display: 'inline-flex', gap: '6px', flexWrap: 'wrap' }}>
                                                        {getFilteredReadings(selectedKanjiDetails.kun_reading).map((r, i) => (
                                                            <span key={i} style={{
                                                                color: r.type === "nanori" ? "#00ffff" : r.type === "common" ? "#00ff00" : "#888888",
                                                                fontWeight: r.type === "common" ? "bold" : "normal"
                                                            }}>
                                                                {r.text}
                                                            </span>
                                                        ))}
                                                    </span>
                                                ) : "—"}
                                            </p>
                                            <p style={{ margin: '0', fontSize: '28px', color: '#1e5761' }}>
                                                <strong>On Reading:</strong>{" "}
                                                {getFilteredReadings(selectedKanjiDetails.on_reading).length > 0 ? (
                                                    <span style={{ display: 'inline-flex', gap: '6px', flexWrap: 'wrap' }}>
                                                        {getFilteredReadings(selectedKanjiDetails.on_reading).map((r, i) => (
                                                            <span key={i} style={{
                                                                color: r.type === "nanori" ? "#00ffff" : r.type === "common" ? "#00ff00" : "#888888",
                                                                fontWeight: r.type === "common" ? "bold" : "normal"
                                                            }}>
                                                                {r.text}
                                                            </span>
                                                        ))}
                                                    </span>
                                                ) : "—"}
                                            </p>
                                            <p style={{ margin: '0', fontSize: '18px', color: '#1e5761' }}><strong>Stroke Count:</strong> {selectedKanjiDetails.stroke_count}</p>
                                            <p style={{ margin: '0', fontSize: '18px', color: '#1e5761' }}><strong>Level:</strong> {selectedKanjiDetails.level}</p>
                                            <p style={{ margin: '0', fontSize: '18px', color: '#1e5761' }}><strong>Subject:</strong> {selectedKanjiDetails.subject}</p>
                                            <p style={{ margin: '0', fontSize: '28px', color: '#1e5761' }}><strong>Key Reading:</strong> {selectedKanjiDetails.keyread}</p>
                                            <p style={{ margin: '0', fontSize: '28px', color: '#1e5761' }}><strong>Decomposition:</strong> {selectedKanjiDetails.decomposition}</p>
                                            <p style={{ margin: '0', fontSize: '18px', color: '#1e5761' }}><strong>Sequence:</strong> {selectedKanjiDetails.sequence}</p>
                                        </div>
                                        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                                            <img src={`https://raw.githubusercontent.com/quizgoi/Kakijun/main/animation/${selectedKanji}.gif`} alt="" onError={e => e.target.style.display = 'none'} style={{ maxWidth: '200px', height: 'auto', border: '1px solid #ddd', borderRadius: '4px' }} />
                                            <img src={`https://raw.githubusercontent.com/quizgoi/Kakijun/main/kanji-kakijun/${selectedKanji}.png`} alt="" onError={e => e.target.style.display = 'none'} style={{ maxWidth: '200px', height: 'auto', border: '1px solid #ddd', borderRadius: '4px' }} />
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                        <img src={`https://raw.githubusercontent.com/quizgoi/Kakijun/main/kanjifont/${selectedKanji}.png`} alt="" onError={e => e.target.style.display = 'none'} style={{ maxWidth: '400px', height: 'auto', border: '1px solid #ddd', borderRadius: '4px' }} />
                                    </div>
                                </div>
                            ) : (
                                <p style={{ margin: 0, fontSize: '16px', color: '#888' }}>No details available.</p>
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
// === EntryRow Component ===
const EntryRow = ({ 
    entry, index, handleKanjiClick, tagColors, getTagObjects, getFilteredReadings, 
    selectedKanjiDetails, selectedKanji, dropdownPosition, 
    isMainInGroup = false, isSubItem = false
}) => {
    return (
        <div className="entry" style={{
            backgroundColor: isSubItem ? '#1e1e1e' : (isMainInGroup ? 'transparent' : 'inherit'),
            padding: isSubItem ? '8px' : '0',
            borderRadius: '8px',
            marginBottom: isSubItem ? '4px' : '0',
            position: 'relative'
        }}>
            {/* Show index only if provided */}
            {index !== null && <span className="result-number">{index} </span>}
            <span className="term-with-furigana">
                {entry.f ? (
                    entry.f.map((part, idx) => part.a ? (
                        <ruby key={idx}>
                            {part.b.split('').map((char, i) => (
                                <span key={i} className="kanji-char" onClick={(e) => handleKanjiClick(char, e)} style={{ cursor: 'pointer' }}>
                                    {char}
                                </span>
                            ))}
                            <rt>{part.a}</rt>
                        </ruby>
                    ) : part.b)
                ) : (
                    <ruby>
                        {entry.t.split('').map((char, i) => (
                            <span key={i} className="kanji-char" onClick={(e) => handleKanjiClick(char, e)} style={{ cursor: 'pointer' }}>
                                {char}
                            </span>
                        ))}
                        <rt>{entry.r}</rt>
                    </ruby>
                )}
            </span>
            <p className="meanings" style={{ margin: '4px 0', fontSize: isSubItem ? '14px' : '16px' }}>
                {entry.m.join(", ")}
            </p>
            {(entry.l || entry.o) && (
                <div className="tags" style={{ marginTop: '4px' }}>
                    {getTagObjects(entry.l).map((tag, i) => (
                        <span key={i} className="tag" title={tag.description}
                            style={{ backgroundColor: tagColors[tag.tag] || "#ccc", color: "#fff", padding: '2px 6px', borderRadius: '4px', marginRight: '4px', fontSize: '12px' }}>
                            {tag.tag}
                        </span>
                    ))}
                    {entry.o && (
                        <span className="tag frequency" title="Frequency rank"
                            style={{ backgroundColor: tagColors[`freq-${entry.o}`] || "#ccc", color: "#fff", padding: '2px 6px', borderRadius: '4px', marginRight: '4px', fontSize: '12px' }}>
                            FR: {entry.o}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};
export default SearchResults;