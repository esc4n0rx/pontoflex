import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { toast } from 'react-toastify';

const RegisterForm = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    matricula: '',
    nome_completo: '',
    salario_base: '',
    carga_horaria_mensal: 220,
    escala: '6x1',
    senha: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.from('users').insert([formData]).select();
      if (error) {
        toast.error(`Erro ao registrar: ${error.message}`);
        return;
      }

      const usuarioRegistrado = data[0]; // Supabase retorna o usuário recém-criado
      onRegister(usuarioRegistrado); // Salva no contexto e localStorage
      toast.success(`Registro realizado com sucesso! Bem-vindo, ${usuarioRegistrado.nome_completo}!`);
    } catch (err) {
      console.error(err);
      toast.error('Erro inesperado ao registrar.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <h2 className="text-lg font-bold mb-4">Registrar</h2>
      <label className="mb-2">Matrícula:</label>
      <input
        type="text"
        name="matricula"
        value={formData.matricula}
        onChange={handleChange}
        className="border p-2 rounded mb-4 text-black"
        placeholder="Digite sua matrícula"
        required
      />
      <label className="mb-2">Nome Completo:</label>
      <input
        type="text"
        name="nome_completo"
        value={formData.nome_completo}
        onChange={handleChange}
        className="border p-2 rounded mb-4 text-black"
        placeholder="Digite seu nome completo"
        required
      />
      <label className="mb-2">Salário Base:</label>
      <input
        type="number"
        name="salario_base"
        value={formData.salario_base}
        onChange={handleChange}
        className="border p-2 rounded mb-4 text-black"
        placeholder="Digite o salário base"
        required
      />
      <label className="mb-2">Carga Horária Mensal:</label>
      <input
        type="number"
        name="carga_horaria_mensal"
        value={formData.carga_horaria_mensal}
        onChange={handleChange}
        className="border p-2 rounded mb-4 text-black"
        placeholder="220"
        required
      />
      <label className="mb-2">Escala:</label>
      <select
        name="escala"
        value={formData.escala}
        onChange={handleChange}
        className="border p-2 rounded mb-4 text-black"
        required
      >
        <option value="6x1">6x1</option>
        <option value="5x2">5x2</option>
      </select>
      <label className="mb-2">Senha:</label>
      <input
        type="password"
        name="senha"
        value={formData.senha}
        onChange={handleChange}
        className="border p-2 rounded mb-4 text-black"
        placeholder="Digite sua senha"
        required
      />
      <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
        Registrar
      </button>
    </form>
  );
};

export default RegisterForm;
