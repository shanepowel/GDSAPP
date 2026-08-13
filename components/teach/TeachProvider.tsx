'use client';

import { createContext, useCallback, useContext, useEffect, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'datum-explain';

let current = true;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return current;
}

function getServerSnapshot() {
  return true;
}

if (typeof window !== 'undefined') {
  current = window.localStorage.getItem(STORAGE_KEY) !== '0';
}

type TeachState = {
  explain: boolean;
  setExplain: (value: boolean) => void;
};

const TeachContext = createContext<TeachState>({
  explain: true,
  setExplain: () => undefined,
});

export function TeachProvider({ children }: { children: React.ReactNode }) {
  const explain = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setExplain = useCallback((value: boolean) => {
    current = value;
    window.localStorage.setItem(STORAGE_KEY, value ? '1' : '0');
    emit();
  }, []);

  useEffect(() => {
    document.body.classList.toggle('learn', explain);
  }, [explain]);

  return <TeachContext.Provider value={{ explain, setExplain }}>{children}</TeachContext.Provider>;
}

export function useTeach() {
  return useContext(TeachContext);
}
