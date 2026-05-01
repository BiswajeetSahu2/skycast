// Features:
//   1. City autocomplete suggestions (OWM Geo API, debounced 300ms)
//   2. Recent searches shown when input is focused + empty
//   3. Delete button (x) on each recent item
//   4. Arrow key + Enter navigation through dropdown
//   5. Click outside to close dropdown
//   6. Geolocation button (pin icon)
//
// Props:
//   onSearch       - called with city name string when user picks/searches
//   onGeoSearch    - called with no args to trigger geolocation
//   loading        - disables buttons while fetching
//   recents        - string[] from useRecents
//   onRemoveRecent - called with city name to delete from recents

import { useState, useEffect, useRef } from 'react';
import { fetchCitySuggestions } from '../../services/api.js';
import './SearchBar.css';

export default function SearchBar({
  onSearch, onGeoSearch, loading, recents, onRemoveRecent
}) {

  const [query,       setQuery]       = useState('');
  const [suggestions, setSuggestions] = useState([]);  // OWM geo results
  const [showDrop,    setShowDrop]    = useState(false);
  const [activeIdx,   setActiveIdx]   = useState(-1);  // keyboard nav index

  const inputRef    = useRef(null);
  const dropRef     = useRef(null);
  const debounceRef = useRef(null);

  // Combined dropdown items: recents (when empty) OR suggestions (when typing)
  const showRecents     = query.trim().length === 0 && recents.length > 0;
  const dropdownItems   = showRecents ? recents : suggestions;
  const hasDropdown     = showDrop && dropdownItems.length > 0;

  // ── Debounced suggestion fetch ──────────────────────────────────────
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setActiveIdx(-1);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const results = await fetchCitySuggestions(query);
      setSuggestions(results);
      setActiveIdx(-1);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (
        !inputRef.current?.contains(e.target) &&
        !dropRef.current?.contains(e.target)
      ) {
        setShowDrop(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Keyboard navigation
  function handleKeyDown(e) {
    if (!hasDropdown) {
      if (e.key === 'Enter') submitQuery();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, dropdownItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIdx >= 0) {
        selectItem(dropdownItems[activeIdx]);
      } else {
        submitQuery();
      }
    } else if (e.key === 'Escape') {
      setShowDrop(false);
      setActiveIdx(-1);
    }
  }

  // Select an item from dropdown
  function selectItem(item) {
    // item is either a string (recent) or an object (suggestion)
    const name = typeof item === 'string' ? item : item.name;
    setQuery(name);
    setShowDrop(false);
    setSuggestions([]);
    setActiveIdx(-1);
    onSearch(name);
  }

  // Submit whatever is in the input
  function submitQuery() {
    const trimmed = query.trim();
    if (!trimmed) return;
    setShowDrop(false);
    onSearch(trimmed);
  }

  return (
    <div className="searchbar-wrapper">
      <div className="searchbar">

        {/* Text input */}
        <input
          ref={inputRef}
          type="text"
          className="searchbar-input"
          placeholder="Enter city name..."
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setShowDrop(true);
          }}
          onFocus={() => setShowDrop(true)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          autoComplete="off"
          spellCheck="false"
        />

        {/* Clear button — only when there's text */}
        {query && (
          <button
            className="searchbar-clear"
            onClick={() => { setQuery(''); setSuggestions([]); setShowDrop(true); inputRef.current?.focus(); }}
            tabIndex={-1}
          >
            ✕
          </button>
        )}

        {/* Geolocation button */}
        <button
          className="searchbar-btn geo-btn"
          onClick={onGeoSearch}
          disabled={loading}
          title="Use my location"
        >
          📍
        </button>

        {/* Search button */}
        <button
          className="searchbar-btn search-btn"
          onClick={submitQuery}
          disabled={loading}
        >
          {loading ? '...' : '🔍'}
        </button>

      </div>

      {/* Dropdown */}
      {hasDropdown && (
        <ul className="searchbar-dropdown" ref={dropRef}>

          {/* Section label */}
          <li className="dropdown-label">
            {showRecents ? 'Recent Searches' : 'Suggestions'}
          </li>

          {showRecents
            ? recents.map((city, i) => (
                <li
                  key={city}
                  className={`dropdown-item ${i === activeIdx ? 'active' : ''}`}
                  onMouseDown={() => selectItem(city)}
                  onMouseEnter={() => setActiveIdx(i)}
                >
                  <span className="dropdown-icon">🕐</span>
                  <span className="dropdown-text">{city}</span>
                  {/* Delete recent — stopPropagation so it doesn't trigger select */}
                  <button
                    className="dropdown-remove"
                    onMouseDown={e => {
                      e.stopPropagation();
                      onRemoveRecent(city);
                    }}
                    tabIndex={-1}
                  >
                    ✕
                  </button>
                </li>
              ))
            : suggestions.map((s, i) => (
                <li
                  key={`${s.lat}-${s.lon}`}
                  className={`dropdown-item ${i === activeIdx ? 'active' : ''}`}
                  onMouseDown={() => selectItem(s)}
                  onMouseEnter={() => setActiveIdx(i)}
                >
                  <span className="dropdown-icon">📍</span>
                  <span className="dropdown-text">{s.label}</span>
                </li>
              ))
          }
        </ul>
      )}
    </div>
  );
}