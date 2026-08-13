'use client';

import { createContext, useContext } from 'react';

const DatumShellContext = createContext(false);

export function DatumShellProvider({ children }: { children: React.ReactNode }) {
  return <DatumShellContext.Provider value={true}>{children}</DatumShellContext.Provider>;
}

export function useDatumShell() {
  return useContext(DatumShellContext);
}
