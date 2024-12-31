import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Clock, BarChart3, Calendar, Users } from 'lucide-react';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import { useUser } from '../UserContext';


function FeatureCard({ title, description, icon: Icon }) {
  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 hover:bg-white/10 transition-all duration-300 border border-white/10">
      <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-blue-400" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}

export default function Home() {
  // ---------------------------
  // LÓGICA DE LOGIN / REGISTRO
  // ---------------------------
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
    closeLoginModal();
    navigate('/dashboard');
  };

  const handleRegister = (registeredUser) => {
    setUser(registeredUser);
    closeRegisterModal();
    navigate('/dashboard');
  };

  // --------------
  // CONTEÚDO NOVO
  // --------------
  const features = [
    {
      icon: Clock,
      title: "Registro de Ponto",
      description: "Registre suas horas de trabalho de forma simples e eficiente."
    },
    {
      icon: BarChart3,
      title: "Indicadores Dinâmicos",
      description: "Acompanhe suas horas extras, banco de horas e total a receber em tempo real."
    },
    {
      icon: Calendar,
      title: "Gerenciamento de Registros",
      description: "Visualize, edite e organize todos os seus registros em um só lugar."
    },
    {
      icon: Users,
      title: "Escalas Flexíveis",
      description: "Suporte para escalas 6x1, 5x2 e personalizadas."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900">
      <Navbar onLoginClick={openLoginModal} onRegisterClick={openRegisterModal} />

      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2850&q=80')] bg-cover bg-center opacity-10" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pb-32">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-6 animate-fade-in">
              Transforme Seu Gerenciamento  de Horas
            </h1>
            <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-8">
              Facilite seu trabalho de forma simples e eficiente com nossa plataforma de gerenciamento de horas.
            </p>
            <button
              onClick={openLoginModal}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-medium inline-flex items-center gap-2 transition-all duration-300 transform hover:scale-105"
            >
              Começar Agora
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Principais Funcionalidades
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Tudo que você precisa para gerenciar seu trabalho de forma simples e eficaz.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Pronto para Começar?
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de profissionais que já usam nossa plataforma para melhorar o gerenciamento de suas horas.
          </p>
          <button
            onClick={openRegisterModal}
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors duration-300"
          >
            Iniciar Teste Gratuito
          </button>
        </div>
      </div>

      {/* Modais de Login e Registro */}
      {isLoginOpen && (
        <Modal onClose={closeLoginModal}>
          <LoginForm onLogin={handleLogin} />
        </Modal>
      )}

      {isRegisterOpen && (
        <Modal onClose={closeRegisterModal}>
          <RegisterForm onRegister={handleRegister} />
        </Modal>
      )}
    </div>
  );
}
