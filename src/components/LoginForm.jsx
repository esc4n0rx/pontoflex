import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { toast } from 'react-toastify';

const LoginForm = ({ onLogin }) => {
  const [matricula, setMatricula] = useState('');
  const [senha, setSenha] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('matricula', matricula)
        .eq('senha', senha);

      if (error || data.length === 0) {
        toast.error('Login inválido. Verifique seus dados.');
        return;
      }

      const usuarioLogado = data[0];
      onLogin(usuarioLogado); 
      toast.success(`Bem-vindo, ${usuarioLogado.nome_completo}!`);
    } catch (err) {
      console.error(err);
      toast.error('Erro inesperado ao logar.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <h2 className="text-lg font-bold mb-4">Login</h2>
      <label className="mb-2">Matrícula:</label>
      <input
        type="text"
        value={matricula}
        onChange={(e) => setMatricula(e.target.value)}
        className="border p-2 rounded mb-4 text-black"
        placeholder="Digite sua matrícula"
        required
      />
      <label className="mb-2">Senha:</label>
      <input
        type="password"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        className="border p-2 rounded mb-4 text-black"
        placeholder="Digite sua senha"
        required
      />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
        Entrar
      </button>
    </form>
  );
};

export default LoginForm;
