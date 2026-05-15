"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface Espacio {
  id: string;
  nombre: string;
  tipo: string;
}

interface EspacioContextType {
  espacioActivo: Espacio | null;
  setEspacioActivo: (espacio: Espacio | null) => void;
}

const EspacioContext = createContext<EspacioContextType | undefined>(undefined);

export function EspacioProvider({ children }: { children: ReactNode }) {
  const [espacioActivo, setEspacioActivo] = useState<Espacio | null>(null);

  return (
    <EspacioContext.Provider value={{ espacioActivo, setEspacioActivo }}>
      {children}
    </EspacioContext.Provider>
  );
}

export function useEspacio() {
  const context = useContext(EspacioContext);
  if (!context) {
    throw new Error("useEspacio must be used within an EspacioProvider");
  }
  return context;
}