// src/context/ImportanceContext.js
import React, { createContext, useContext, useState } from "react";

const ImportanceContext = createContext();

export const ImportanceProvider = ({ children }) => {
  const [importantItems, setImportantItems] = useState([]);

  const addToImportant = (item) => {
    setImportantItems((prev) => [...prev, item]);
  };

  return (
    <ImportanceContext.Provider value={{ importantItems, addToImportant }}>
      {children}
    </ImportanceContext.Provider>
  );
};

export const useImportance = () => useContext(ImportanceContext);
