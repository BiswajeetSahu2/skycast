import { useState, useEffect } from 'react';

export function useTheme() {

  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') !== 'light';
  });

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