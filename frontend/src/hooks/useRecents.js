// hooks/useRecents.js
import { useState } from 'react';

const KEY      = 'weather_recents';
const MAX_ITEMS = 5;

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; }
  catch { return []; }
}

export function useRecents() {
  const [recents, setRecents] = useState(load);

  function addRecent(cityName) {
    if (!cityName) return;
    setRecents(prev => {
      const filtered = prev.filter(c => c.toLowerCase() !== cityName.toLowerCase());
      const next = [cityName, ...filtered].slice(0, MAX_ITEMS);
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }

  function removeRecent(cityName) {
    setRecents(prev => {
      const next = prev.filter(c => c !== cityName);
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }

  return { recents, addRecent, removeRecent };
}