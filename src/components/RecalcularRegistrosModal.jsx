import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { toast } from 'react-toastify';
import { calcularTotalHoras, calcularHorasExtras, calcularAdicionalNoturno, isHoliday } from '../registroPontoUtils';

const RecalcularRegistrosModal = ({ onClose }) => {
  const [adminPassword, setAdminPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRecalcularRegistros = async () => {
    if (adminPassword !== process.env.REACT_APP_ADMIN_PASSWORD) {
      toast.error('Senha inválida.');
      return;
    }

    setIsProcessing(true);
    try {
      const { data: registros, error } = await supabase.from('registro_pontos').select('*');
      if (error) throw error;

      if (registros.length === 0) {
        toast.info('Nenhum registro encontrado.');
        return;
      }

      for (const registro of registros) {
        const { hora_entrada, hora_saida, dia, escala_usuario } = registro;

        const totalHoras = calcularTotalHoras(hora_entrada, hora_saida);
        const feriado = await isHoliday(new Date(dia));
        const diaSemana = new Date(dia).toLocaleString('pt-BR', { weekday: 'long' }).toLowerCase();
        const { horasExtras, horasPositivas, horasNegativas } = calcularHorasExtras(
          hora_entrada,
          hora_saida,
          escala_usuario,
          diaSemana,
          feriado
        );
        const adicionalNoturno = calcularAdicionalNoturno(hora_entrada, hora_saida, registro.flagNoturno);

        const { error: updateError } = await supabase
          .from('registro_pontos')
          .update({
            total_horas: totalHoras,
            horas_extras: horasExtras,
            horas_positivas: horasPositivas,
            horas_negativas: horasNegativas,
            adicional_noturno: adicionalNoturno,
          })
          .eq('id', registro.id);

        if (updateError) {
          console.error(`Erro ao atualizar registro ID ${registro.id}:`, updateError);
        } else {
          console.log(`Registro ID ${registro.id} atualizado com sucesso.`);
        }
      }
      toast.success('Recalculo concluído.');
    } catch (err) {
      console.error('Erro durante o recalculo:', err);
      toast.error('Erro ao recalcular registros.');
    } finally {
      setIsProcessing(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Confirmação</h2>
        <p className="mb-4">Digite a senha de administrador para recalcular todos os registros.</p>
        <input
          type="password"
          value={adminPassword}
          onChange={(e) => setAdminPassword(e.target.value)}
          className="w-full p-2 rounded mb-4 text-black"
          placeholder="Senha"
        />
        <div className="flex justify-end">
          <button
            onClick={handleRecalcularRegistros}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white mr-2"
            disabled={isProcessing}
          >
            {isProcessing ? 'Processando...' : 'Confirmar'}
          </button>
          <button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecalcularRegistrosModal;
