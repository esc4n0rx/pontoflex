import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import RegistroPontoModal from '../components/RegistroPontoModal';
import { supabase } from '../supabaseClient';
import { getPeriodoFolha, calcularIndicadores } from '../folhaUtils';
import { toast } from 'react-toastify';
import { useUser } from '../UserContext';
import GerenciarRegistrosModal from '../components/GerenciarRegistrosModal';
import AlterarRegistroModal from '../components/AlterarRegistroModal';
import { calcularTotalHoras, calcularHorasExtras, calcularAdicionalNoturno, isHoliday } from '../registroPontoUtils';

const Dashboard = () => {
  const { user } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGerenciarModalOpen, setIsGerenciarModalOpen] = useState(false);
  const [isAlterarModalOpen, setIsAlterarModalOpen] = useState(false);
  const [registros, setRegistros] = useState([]);
  const [registroSelecionado, setRegistroSelecionado] = useState(null);
  const [indicadores, setIndicadores] = useState({
    totalBancoHoras: '00:00',
    totalHorasExtras: '00:00',
    totalHorasNegativas: '00:00',
    totalHorasPositivas: '00:00',
    totalReceber: 'R$ 0,00',
  });
  const [periodo, setPeriodo] = useState(getPeriodoFolha());

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const openGerenciarModal = () => {
    fetchRegistros();
    setIsGerenciarModalOpen(true);
  };

  const closeGerenciarModal = () => setIsGerenciarModalOpen(false);

  const openAlterarModal = (registro) => {
    setRegistroSelecionado(registro);
    setIsAlterarModalOpen(true);
  };

  const closeAlterarModal = () => {
    setRegistroSelecionado(null);
    setIsAlterarModalOpen(false);
  };

  const fetchRegistros = async () => {
    try {
      const { data, error } = await supabase
        .from('registro_pontos')
        .select('*')
        .eq('usuario_id', user.id)
        .gte('dia', periodo.inicio.toISOString())
        .lte('dia', periodo.fim.toISOString());

      if (error) throw error;

      setRegistros(data);
    } catch (err) {
      console.error('Erro ao buscar registros:', err);
      toast.error('Erro ao buscar registros.');
    }
  };

  const atualizarIndicadores = async () => {
    try {
      const dadosIndicadores = await calcularIndicadores(user.id, periodo);
      setIndicadores({
        totalBancoHoras: `${dadosIndicadores.totalBancoHoras.toFixed(2)}h`,
        totalHorasExtras: `${dadosIndicadores.totalHorasExtras.toFixed(2)}h`,
        totalHorasNegativas: `${dadosIndicadores.totalHorasNegativas.toFixed(2)}h`,
        totalHorasPositivas: `${dadosIndicadores.totalHorasPositivas.toFixed(2)}h`,
        totalReceber: `R$ ${dadosIndicadores.totalReceber.toFixed(2)}`,
      });
    } catch (error) {
      console.error('Erro ao atualizar indicadores:', error);
      toast.error('Erro ao atualizar indicadores.');
    }
  };

  useEffect(() => {
    atualizarIndicadores();
  }, [periodo]);

  const handleRegistroPonto = async (registro) => {
    try {
      const totalHoras = calcularTotalHoras(registro.horaEntrada, registro.horaSaida);
      const feriado = await isHoliday(new Date(registro.dia));
      const escala = user.escala;
      const id = user.id;
      const diaSemana = new Date(registro.dia).toLocaleString('pt-BR', { weekday: 'long' }).toLowerCase();

      const { horasExtras, horasPositivas, horasNegativas } = calcularHorasExtras(totalHoras, escala, diaSemana, feriado);
      const adicionalNoturno = calcularAdicionalNoturno(registro.horaEntrada, registro.horaSaida, registro.flagNoturno);

      const dadosRegistro = {
        usuario_id: id,
        dia: registro.dia,
        hora_entrada: registro.horaEntrada,
        hora_saida: registro.horaSaida,
        total_horas: totalHoras,
        horas_extras: horasExtras,
        horas_positivas: horasPositivas,
        horas_negativas: horasNegativas,
        adicional_noturno: adicionalNoturno,
        is_feriado: feriado,
        escala_usuario: escala,
      };

      const { data, error } = await supabase.from('registro_pontos').insert([dadosRegistro]);
      if (error) throw error;

      toast.success('Ponto registrado com sucesso!');
      atualizarIndicadores();
    } catch (err) {
      console.error('Erro ao registrar ponto:', err);
      toast.error('Erro ao registrar ponto.');
    } finally {
      closeModal();
    }
  };

  const handleAlterarRegistro = async (alteracoes) => {
    try {
      const { data, error } = await supabase
        .from('registro_pontos')
        .update(alteracoes)
        .eq('id', registroSelecionado.id);

      if (error) throw error;

      toast.success('Registro alterado com sucesso!');
      atualizarIndicadores();
      fetchRegistros();
    } catch (err) {
      console.error('Erro ao alterar registro:', err);
      toast.error('Erro ao alterar registro.');
    } finally {
      closeAlterarModal();
    }
  };

  const cards = [
    { title: 'Total de Banco de Horas', value: indicadores.totalBancoHoras },
    { title: 'Horas Extras', value: indicadores.totalHorasExtras },
    { title: 'Horas Negativas', value: indicadores.totalHorasNegativas },
    { title: 'Horas Positivas', value: indicadores.totalHorasPositivas },
    { title: 'Total a Receber', value: indicadores.totalReceber },
  ];

  const options = [
    { label: 'Registrar Pontos', action: openModal },
    { label: 'Gerenciar Registros', action: openGerenciarModal },
    { label: 'Alterar Registro', action: () => toast.info('Selecione um registro na aba Gerenciar.') },
    { label: 'Trocar Período da Folha', action: () => setPeriodo(getPeriodoFolha()) },
  ];

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <Navbar />
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {cards.map((card, index) => (
            <div
              key={index}
              className="bg-gray-800 rounded-lg shadow-md p-6 text-center transition transform hover:scale-105"
            >
              <h3 className="text-lg font-bold text-gray-300 mb-2">{card.title}</h3>
              <p className="text-2xl font-bold text-blue-400">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={option.action}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg shadow-md text-white text-lg font-semibold transition transform hover:scale-105"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <RegistroPontoModal
          onClose={closeModal}
          onSubmit={handleRegistroPonto}
        />
      )}

      {isGerenciarModalOpen && (
        <GerenciarRegistrosModal
          registros={registros}
          onClose={closeGerenciarModal}
          onAlterarRegistro={openAlterarModal}
        />
      )}

      {isAlterarModalOpen && (
        <AlterarRegistroModal
          registro={registroSelecionado}
          onClose={closeAlterarModal}
          onSubmit={handleAlterarRegistro}
        />
      )}
    </div>
  );
};

export default Dashboard;
