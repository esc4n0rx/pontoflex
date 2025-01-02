import React, { useState } from 'react';
import { calcularTotalHoras, calcularHorasExtras, calcularAdicionalNoturno, isHoliday } from '../registroPontoUtils';
import { useUser } from '../UserContext';
import { toast } from 'react-toastify';

const RegistroPontoModal = ({ onClose, onSubmit }) => {
  const { user } = useUser();
  const [dia, setDia] = useState('');
  const [horaEntrada, setHoraEntrada] = useState('');
  const [horaSaida, setHoraSaida] = useState('');
  const [flagNoturno, setFlagNoturno] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!dia || !horaEntrada || !horaSaida) {
      alert('Todos os campos devem ser preenchidos.');
      return;
    }

    // Se não for noturno (flagNoturno === false) e a hora de entrada é >= hora de saída,
    // significa que não cruzou a meia-noite e a entrada deve ser menor que a saída.
    if (flagNoturno === false && horaEntrada >= horaSaida) {
      alert('A hora de entrada deve ser menor que a hora de saída.');
      return;
    }

    const totalHoras = calcularTotalHoras(horaEntrada, horaSaida);
    const feriado = await isHoliday(new Date(dia));
    const escala = user.escala;
    const diaSemana = new Date(dia).toLocaleString('pt-BR', { weekday: 'long' }).toLowerCase();
    const { horasExtras, horasPositivas, horasNegativas } = 
      calcularHorasExtras(totalHoras, escala, diaSemana, feriado);

    const adicionalNoturno = calcularAdicionalNoturno(horaEntrada, horaSaida, flagNoturno);

    onSubmit({
      dia,
      horaEntrada,
      horaSaida,
      flagNoturno,
      total_horas: totalHoras,
      horas_extras: horasExtras,
      horas_positivas: horasPositivas,
      horas_negativas: horasNegativas,
      adicional_noturno: adicionalNoturno,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Registrar Ponto</h2>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <label className="mb-2">Dia:</label>
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
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              checked={flagNoturno}
              onChange={(e) => setFlagNoturno(e.target.checked)}
              className="mr-2"
            />
            <label>Trabalho Noturno</label>
          </div>
          <button type="submit" className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded">
            Registrar
          </button>
          <button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white mt-4"
          >
            Fechar
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistroPontoModal;
