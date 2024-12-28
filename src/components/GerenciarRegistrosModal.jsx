import React, { useState } from 'react';

const GerenciarRegistrosModal = ({ registros, onClose, onAlterarRegistro }) => {
  const [filtroInicio, setFiltroInicio] = useState('');
  const [filtroFim, setFiltroFim] = useState('');

  // Filtra somente pela data
  const registrosFiltrados = registros.filter((registro) => {
    // Aqui vamos criar objeto Date só para comparar com filtroInicio/filtroFim
    const dataJs = new Date(registro.dia); 
    const inicio = filtroInicio ? new Date(filtroInicio) : null;
    const fim = filtroFim ? new Date(filtroFim) : null;

    return (!inicio || dataJs >= inicio) && (!fim || dataJs <= fim);
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
        <h2 className="text-lg font-bold mb-4">Gerenciar Registros</h2>

        <div className="flex gap-4 mb-4">
          <div>
            <label className="block mb-2">Data Início:</label>
            <input
              type="date"
              value={filtroInicio}
              onChange={(e) => setFiltroInicio(e.target.value)}
              className="border p-2 rounded text-black"
            />
          </div>
          <div>
            <label className="block mb-2">Data Fim:</label>
            <input
              type="date"
              value={filtroFim}
              onChange={(e) => setFiltroFim(e.target.value)}
              className="border p-2 rounded text-black"
            />
          </div>
        </div>

        <table className="w-full text-sm text-left text-gray-400">
          <thead className="text-xs text-gray-300 uppercase bg-gray-700">
            <tr>
              <th className="px-4 py-2">Data</th>
              <th className="px-4 py-2">Hora Entrada</th>
              <th className="px-4 py-2">Hora Saída</th>
              <th className="px-4 py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {registrosFiltrados.map((registro) => {
              return (
                <tr key={registro.id} className="bg-gray-800 hover:bg-gray-700">
                  <td>{registro.dia}</td> {/* Já está em DD/MM/YYYY */}
                  <td className="px-4 py-2">{registro.hora_entrada}</td>
                  <td className="px-4 py-2">{registro.hora_saida}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => onAlterarRegistro(registro)}
                      className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white"
                    >
                      Alterar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <button
          onClick={onClose}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white mt-4"
        >
          Fechar
        </button>
      </div>
    </div>
  );
};

export default GerenciarRegistrosModal;
