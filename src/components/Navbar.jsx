import React from 'react';
import { useUser } from '../UserContext';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onLoginClick, onRegisterClick }) => {
  const { user } = useUser(); 
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
    window.location.reload(); 
  };

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <h1 className="text-lg font-bold">PontoFlex</h1>
      <div>
        {user ? (
          <div className="flex items-center space-x-4">
            <span className="text-gray-300">Bem-vindo, {user.nome_completo}!</span>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition"
            >
              Sair
            </button>
          </div>
        ) : (
          <div className="flex space-x-4">
            <button onClick={onLoginClick}  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition">
              Login
            </button>
            <button onClick={onRegisterClick} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition">
              Registrar
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
