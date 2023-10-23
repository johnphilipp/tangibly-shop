// src/contexts/DataContext.tsx

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { Activity } from "@prisma/client";

interface DataProviderProps {
  children: ReactNode;
}

interface DataContextProps {
  activities: Activity[];
  setActivities: React.Dispatch<React.SetStateAction<Activity[]>>;
}

const DataContext = createContext<DataContextProps | undefined>(undefined);

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [activities, setActivities] = useState<Activity[]>([]);

  return (
    <DataContext.Provider value={{ activities, setActivities }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextProps => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
