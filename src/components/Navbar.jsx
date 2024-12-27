import React, { useState } from 'react';
import { useUser } from '../UserContext';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onLoginClick, onRegisterClick }) => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    setUser(null); // Remove do estado e do localStorage
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <h1 className="text-lg font-bold cursor-pointer" onClick={() => navigate('/')}>
        PontoFlex
      </h1>
      <button
        className="sm:hidden bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded"
        onClick={toggleMobileMenu}
      >
        ☰
      </button>
      <div
        className={`${
          isMobileMenuOpen ? 'block' : 'hidden'
        } sm:flex items-center space-y-4 sm:space-y-0 sm:space-x-4 sm:items-center`}
      >
        {user ? (
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <span className="text-gray-300">Bem-vindo, {user.nome_completo}!</span>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition w-full sm:w-auto"
            >
              Sair
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              onClick={onLoginClick}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition w-full sm:w-auto"
            >
              Login
            </button>
            <button
              onClick={onRegisterClick}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition w-full sm:w-auto"
            >
              Registrar
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
