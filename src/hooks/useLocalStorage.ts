import { useState, useEffect, Dispatch, SetStateAction } from 'react';

/**
 * Custom React hook for synchronized localStorage state management.
 *
 * @param key - localStorage key
 * @param initialValue - Fallback value
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? (JSON.parse(stored) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn(`Error writing to localStorage key "${key}":`, err);
    }
  }, [key, value]);

  return [value, setValue];
}
