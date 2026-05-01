// hooks/useTheme.js
//
// Manages dark/light mode.
// Persists the user's choice in localStorage so it
// survives page refresh.
//
// Returns: { isDark, toggleTheme }

import { useState, useEffect } from 'react';

export function useTheme() {

  // Read saved preference on first load, default to dark
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') !== 'light';
  });

  // Whenever isDark changes, update <body> class + localStorage
  useEffect(() => {
    document.body.classList.toggle('dark', isDark);
    document.body.classList.toggle('light', !isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  function toggleTheme() {
    setIsDark(prev => !prev);
  }

  return { isDark, toggleTheme };
}