import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import GradientTitle from '../components/GradientTitle';
import Modal from '../components/Modal';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import { useUser } from '../UserContext';

const Home = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const { setUser } = useUser();
  const navigate = useNavigate();

  const openLoginModal = () => setIsLoginOpen(true);
  const closeLoginModal = () => setIsLoginOpen(false);

  const openRegisterModal = () => setIsRegisterOpen(true);
  const closeRegisterModal = () => setIsRegisterOpen(false);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    console.log(loggedInUser);
    closeLoginModal();
    navigate('/dashboard');
  };

  const handleRegister = (registeredUser) => {
    setUser(registeredUser);
    console.log(registeredUser);
    closeRegisterModal();
    navigate('/dashboard');
  };

  const features = [
    {
      title: 'Registro de Ponto',
      description: 'Registre suas horas de trabalho de forma simples e eficiente.',
      icon: '🕒',
    },
    {
      title: 'Gerenciamento de Registros',
      description: 'Visualize, edite e organize todos os seus registros em um só lugar.',
      icon: '📋',
    },
    {
      title: 'Indicadores Dinâmicos',
      description: 'Acompanhe suas horas extras, banco de horas e total a receber em tempo real.',
      icon: '📊',
    },
    {
      title: 'Escalas Flexíveis',
      description: 'Suporte para escalas 6x1, 5x2 e personalizadas.',
      icon: '🔄',
    },
  ];

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <Navbar onLoginClick={openLoginModal} onRegisterClick={openRegisterModal} />
      <main className="flex flex-col items-center justify-center min-h-screen px-4">
        <GradientTitle />
        <p className="mt-4 text-gray-400 text-center text-sm sm:text-base md:text-lg">
          Bem-vindo ao <span className="text-blue-400 font-bold">PontoFlex</span>! Gerencie seus horários com facilidade.
        </p>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-4xl">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-800 rounded-lg p-6 shadow-md transition transform hover:scale-105"
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-lg sm:text-xl font-bold text-blue-400 mb-2">{feature.title}</h3>
              <p className="text-gray-300 text-sm sm:text-base">{feature.description}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Login Modal */}
      {isLoginOpen && (
        <Modal onClose={closeLoginModal}>
          <LoginForm onLogin={handleLogin} />
        </Modal>
      )}

      {/* Register Modal */}
      {isRegisterOpen && (
        <Modal onClose={closeRegisterModal}>
          <RegisterForm onRegister={handleRegister} />
        </Modal>
      )}
    </div>
  );
};

export default Home;
