import { useState, useEffect, useRef } from 'react';
import { fetchCitySuggestions } from '../../services/api.js';
import './SearchBar.css';

export default function SearchBar({
  onSearch,
  onGeoSearch,
  loading,
  recents,
  onRemoveRecent,
  compact = false
}) {

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showDrop, setShowDrop] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);

  const inputRef = useRef(null);
  const dropRef = useRef(null);
  const debounceRef = useRef(null);

  const showRecents =
    query.trim().length === 0 && recents.length > 0;

  const dropdownItems =
    showRecents ? recents : suggestions;

  const hasDropdown =
    showDrop && dropdownItems.length > 0;

  useEffect(() => {

  if (activeIdx < 0) return;

  const activeEl =
    document.querySelector('.dropdown-item.active');

  activeEl?.scrollIntoView({
    block: 'nearest',
    behavior: 'smooth'
  });

}, [activeIdx]);

  useEffect(() => {

    const q = query.trim();

    if (q.length < 1) {
      // Defer state updates to avoid cascading renders
      setTimeout(() => {
        setSuggestions([]);
        setActiveIdx(-1);
      }, 0);
      return;
    }

    clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {

      try {

        const results =
          await fetchCitySuggestions(q);

        setSuggestions(results);
        setActiveIdx(-1);

        if (results.length > 0) {
          setShowDrop(true);
        }

      } catch {
        setSuggestions([]);
        setActiveIdx(-1);
      }

    }, 250);

    return () => clearTimeout(debounceRef.current);

  }, [query]);

  useEffect(() => {

    const onOutside = e => {

      if (
        !inputRef.current?.contains(e.target) &&
        !dropRef.current?.contains(e.target)
      ) {
        setShowDrop(false);
      }

    };

    document.addEventListener('mousedown', onOutside);

    return () =>
      document.removeEventListener(
        'mousedown',
        onOutside
      );

  }, []);

  function handleKeyDown(e) {

    if (!hasDropdown) {

      if (e.key === 'Enter') {
        submitQuery();
      }

      return;
    }

    if (e.key === 'ArrowDown') {

      e.preventDefault();

      setActiveIdx(i =>
        i >= dropdownItems.length - 1 ? 0 : i + 1
      );

    } else if (e.key === 'ArrowUp') {

      e.preventDefault();

      setActiveIdx(i =>
        i <= 0 ? dropdownItems.length - 1 : i - 1
      );

    } else if (e.key === 'Enter') {

      e.preventDefault();

      activeIdx >= 0
        ? selectItem(dropdownItems[activeIdx])
        : submitQuery();

    } else if (e.key === 'Escape') {

      setShowDrop(false);
      setActiveIdx(-1);

    }
  }

  function selectItem(item) {

    const name =
      typeof item === 'string'
        ? item
        : item.name;

    setQuery(name);
    setShowDrop(false);
    setSuggestions([]);
    setActiveIdx(-1);

    onSearch(name);
  }

  function submitQuery() {

    const t = query.trim();

    if (!t) {
      return;
    }

    setShowDrop(false);

    onSearch(t);
  }

  return (
    <div
      className={`searchbar-wrapper ${compact ? 'compact' : ''
        }`}
    >

      <div className="searchbar">

        <input
          ref={inputRef}
          type="text"
          name="skycast-city-search"
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
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />

        {query && (

          <button
            className="searchbar-clear"
            tabIndex={-1}
            onMouseDown={e => {

              e.preventDefault();

              setQuery('');
              setSuggestions([]);
              setShowDrop(true);

              inputRef.current?.focus();

            }}
          >

            ✕

          </button>

        )}

        <button
          className="searchbar-btn geo-btn"
          onClick={onGeoSearch}
          disabled={loading}
          title="Use my location"
        >

          📍

        </button>

        <button
          className="searchbar-btn search-btn"
          onClick={submitQuery}
          disabled={loading}
        >

          {loading ? '…' : '🔍'}

        </button>

      </div>

      {hasDropdown && (

        <ul
          className="searchbar-dropdown"
          ref={dropRef}
          role="listbox"
        >

          <li className="dropdown-label">

            {showRecents
              ? 'Recent Searches'
              : 'Suggestions'}

          </li>

          {showRecents
            ? recents.map((city, i) => (

              <li
                key={city}
                role="option"
                className={`dropdown-item ${i === activeIdx
                  ? 'active'
                  : ''
                  }`}
                onMouseDown={e => {
                  e.preventDefault();
                  selectItem(city);
                }}
                onMouseEnter={() => setActiveIdx(i)}
              >

                <span className="dropdown-icon">
                  🕐
                </span>

                <span className="dropdown-text">
                  {city}
                </span>

                <button
                  className="dropdown-remove"
                  tabIndex={-1}
                  onMouseDown={e => {

                    e.preventDefault();
                    e.stopPropagation();

                    onRemoveRecent(city);

                  }}
                >

                  ✕

                </button>

              </li>

            ))

            : suggestions.map((s, i) => (

              <li
                key={`${s.lat}-${s.lon}`}
                role="option"
                className={`dropdown-item ${i === activeIdx
                  ? 'active'
                  : ''
                  }`}
                onMouseDown={e => {
                  e.preventDefault();
                  selectItem(s);
                }}
                onMouseEnter={() => setActiveIdx(i)}
              >

                <span className="dropdown-icon">
                  📍
                </span>

                <span className="dropdown-text">
                  {s.label}
                </span>

              </li>

            ))
          }

        </ul>

      )}

    </div>
  );
}