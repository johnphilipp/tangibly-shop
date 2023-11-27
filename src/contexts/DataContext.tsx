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
  activeDesign: Design;
  setActiveDesign: React.Dispatch<React.SetStateAction<Design>>;
}

const initialDesign: Design = {
  id: 1,
  createdAt: new Date(),
  productType: "Coffee Cuo",
  name: "Dummy-1",
  userId: "dsasdsd",
  aspectRatioRow: 10,
  aspectRatioColumn: 20,
  activityTypes: "Running",
  stroke: 3,
  padding: 2,
  backgroundColor: "#ffffff",
  strokeColor: "#000000",
  previewSvg: "",
};

interface ExtendedCartItem extends CartItem {
  design: Design;
}

const DataContext = createContext<DataContextProps | undefined>(undefined);

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [cartItems, setCartItems] = useState<ExtendedCartItem[]>([]);
  const [activeDesign, setActiveDesign] = useState<Design>(initialDesign);

  return (
    <DataContext.Provider
      value={{
        activities,
        setActivities,
        cartItems,
        setCartItems,
        activeDesign,
        setActiveDesign,
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
