// src/contexts/DataContext.tsx

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { Activity, CartItem, Design } from "@prisma/client";

interface DataProviderProps {
  children: ReactNode;
}

interface DataContextProps {
  activities: Activity[];
  setActivities: React.Dispatch<React.SetStateAction<Activity[]>>;
  cartItems: ExtendedCartItem[];
  setCartItems: React.Dispatch<React.SetStateAction<ExtendedCartItem[]>>;
}

interface ActiveDesign {
  id: number;
  name: string;
  designId: number;
}

export interface ExtendedCartItem extends CartItem {
  design: Design;
}

const DataContext = createContext<DataContextProps | undefined>(undefined);

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [cartItems, setCartItems] = useState<ExtendedCartItem[]>([]);

  return (
    <DataContext.Provider
      value={{
        activities,
        setActivities,
        cartItems,
        setCartItems,
      }}
    >
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
