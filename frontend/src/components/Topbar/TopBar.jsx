// Contains:
//   - Dark/Light theme toggle button
//   - Celsius/Fahrenheit switch below it
//
// Props:
//   isDark       - boolean, current theme
//   toggleTheme  - function, flip the theme
//   isFahrenheit - boolean, current unit
//   toggleUnit   - function, flip the unit

import './TopBar.css';

export default function TopBar({ isDark, toggleTheme, isFahrenheit, toggleUnit }) {
  return (
    <div className="topbar">

      {/* Theme toggle */}
      <button
        className="topbar-btn"
        onClick={toggleTheme}
        title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
      >
        {isDark ? '☀️' : '🌙'}
      </button>

      {/* Unit toggle */}
      <button
        className="topbar-btn unit-btn"
        onClick={toggleUnit}
        title="Toggle temperature unit"
      >
        {isFahrenheit ? '°C' : '°F'}
      </button>

    </div>
  );
}