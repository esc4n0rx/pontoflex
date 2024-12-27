import React, { createContext, useState, useContext } from 'react';

// Criação do contexto
const UserContext = createContext();

// Provider para envolver a aplicação
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook para acessar o contexto facilmente
export const useUser = () => {
  return useContext(UserContext);
};
