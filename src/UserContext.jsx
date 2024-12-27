import React, { createContext, useContext, useState, useEffect } from 'react';

// Criação do contexto
const UserContext = createContext();

// Provider para envolver a aplicação
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Recupera o usuário do localStorage ao carregar a aplicação
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    console.log(storedUser);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Atualiza o localStorage sempre que o usuário mudar
  const handleSetUser = (userData) => {
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
      console.log(userData);
    } else {
      localStorage.removeItem('user');
    }
    setUser(userData);
  };

  return (
    <UserContext.Provider value={{ user, setUser: handleSetUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook para acessar o contexto facilmente
export const useUser = () => {
  return useContext(UserContext);
};
