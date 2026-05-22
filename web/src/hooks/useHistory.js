import { useState, useCallback } from 'react';

let globalHistory = [];
let listeners = [];

const notify = () => listeners.forEach(fn => fn([...globalHistory]));

export function useHistory() {
  const [history, setHistory] = useState([...globalHistory]);

  useState(() => {
    const listener = (h) => setHistory(h);
    listeners.push(listener);
    return () => { listeners = listeners.filter(l => l !== listener); };
  });

  const addToHistory = useCallback((entry) => {
    const item = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      ...entry,
    };
    globalHistory = [item, ...globalHistory].slice(0, 200);
    notify();
    return item;
  }, []);

  const clearHistory = useCallback(() => {
    globalHistory = [];
    notify();
  }, []);

  const removeFromHistory = useCallback((id) => {
    globalHistory = globalHistory.filter(h => h.id !== id);
    notify();
  }, []);

  return { history, addToHistory, clearHistory, removeFromHistory };
}
