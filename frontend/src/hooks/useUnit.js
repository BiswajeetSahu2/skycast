// hooks/useUnit.js
//
// Manages the Celsius/Fahrenheit preference.
// Provides a conversion function so any component
// can display the correct unit.
//
// Returns: { isFahrenheit, toggleUnit, convertTemp, unitLabel }

import { useState } from 'react';

export function useUnit() {

  const [isFahrenheit, setIsFahrenheit] = useState(false);

  function toggleUnit() {
    setIsFahrenheit(prev => !prev);
  }

  // Pass any Celsius value — get back the right number + symbol
  function convertTemp(celsius) {
    if (celsius == null) return '';
    if (isFahrenheit) {
      return `${Math.round(celsius * 9 / 5 + 32)}°F`;
    }
    return `${Math.round(celsius)}°C`;
  }

  const unitLabel = isFahrenheit ? '°F' : '°C';

  return { isFahrenheit, toggleUnit, convertTemp, unitLabel };
}