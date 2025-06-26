import { useContext } from "react";
import { DataContext } from "../contexts/DataContext";

export const useData = () => {
  const context = useContext(DataContext);
  
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
};