import React, { createContext, useContext } from 'react';
import type { DatabaseAdapter } from '../lib/db/DatabaseAdapter';

const DatabaseContext = createContext<DatabaseAdapter | null>(null);

export function DatabaseProvider({ db, children }: { db: DatabaseAdapter, children: React.ReactNode }) {
  return (
    <DatabaseContext.Provider value={db}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase(): DatabaseAdapter {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase deve ser usado dentro de um DatabaseProvider');
  }
  return context;
}
