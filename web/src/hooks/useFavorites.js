import { useState, useCallback } from 'react';

let globalFavorites = [];
let listeners = [];

const notify = () => listeners.forEach(fn => fn([...globalFavorites]));

export function useFavorites() {
  const [favorites, setFavorites] = useState([...globalFavorites]);

  useState(() => {
    const listener = (f) => setFavorites(f);
    listeners.push(listener);
    return () => { listeners = listeners.filter(l => l !== listener); };
  });

  const addFavorite = useCallback((entry) => {
    const item = {
      id: Date.now() + Math.random(),
      savedAt: new Date().toISOString(),
      ...entry,
    };
    globalFavorites = [item, ...globalFavorites];
    notify();
    return item;
  }, []);

  const removeFavorite = useCallback((id) => {
    globalFavorites = globalFavorites.filter(f => f.id !== id);
    notify();
  }, []);

  const isFavorite = useCallback((text) => {
    return globalFavorites.some(f => f.text === text);
  }, []);

  const clearFavorites = useCallback(() => {
    globalFavorites = [];
    notify();
  }, []);

  return { favorites, addFavorite, removeFavorite, isFavorite, clearFavorites };
}
