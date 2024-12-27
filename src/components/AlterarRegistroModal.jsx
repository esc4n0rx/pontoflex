import React, { useState } from 'react';

const AlterarRegistroModal = ({ registro, onClose, onSubmit }) => {
  const [dia, setDia] = useState(registro.dia);
  const [horaEntrada, setHoraEntrada] = useState(registro.hora_entrada);
  const [horaSaida, setHoraSaida] = useState(registro.hora_saida);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!dia || !horaEntrada || !horaSaida) {
      alert('Preencha todos os campos!');
      return;
    }

    if (horaEntrada >= horaSaida) {
      alert('A hora de entrada deve ser menor que a hora de saída!');
      return;
    }

    onSubmit({
      dia,
      hora_entrada: horaEntrada,
      hora_saida: horaSaida,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center px-4 sm:px-6">
      <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Alterar Registro</h2>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <label className="mb-2">Data:</label>
          <input
            type="date"
            value={dia}
            onChange={(e) => setDia(e.target.value)}
            className="border p-2 rounded mb-4 text-black"
            required
          />
          <label className="mb-2">Hora de Entrada:</label>
          <input
            type="time"
            value={horaEntrada}
            onChange={(e) => setHoraEntrada(e.target.value)}
            className="border p-2 rounded mb-4 text-black"
            required
          />
          <label className="mb-2">Hora de Saída:</label>
          <input
            type="time"
            value={horaSaida}
            onChange={(e) => setHoraSaida(e.target.value)}
            className="border p-2 rounded mb-4 text-black"
            required
          />
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AlterarRegistroModal;
