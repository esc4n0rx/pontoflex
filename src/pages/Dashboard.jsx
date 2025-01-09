import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import RegistroPontoModal from '../components/RegistroPontoModal';
import { supabase } from '../supabaseClient';
import { getPeriodoFolha, calcularIndicadores, gerarFolhasDisponiveis } from '../folhaUtils';
import { toast } from 'react-toastify';
import { useUser } from '../UserContext';
import GerenciarRegistrosModal from '../components/GerenciarRegistrosModal';
import CalculoRescisaoModal from '../components/CalculoRescisaoModal';
import AlterarRegistroModal from '../components/AlterarRegistroModal';
import RecalcularDadosModal from '../components/RecalcularRegistrosModal';
import { calcularTotalHoras, calcularHorasExtras, calcularAdicionalNoturno, isHoliday ,corrigirDataRegistro} from '../registroPontoUtils';

const Dashboard = () => {
  const { user } = useUser();
  const [isCalculoRescisaoModalOpen, setIsCalculoRescisaoModalOpen] = useState(false);

  const openCalculoRescisaoModal = () => setIsCalculoRescisaoModalOpen(true);
  const closeCalculoRescisaoModal = () => setIsCalculoRescisaoModalOpen(false);

  const [isRecalcularModalOpen, setIsRecalcularModalOpen] = useState(false);

  const openRecalcularModal = () => setIsRecalcularModalOpen(true);
  const closeRecalcularModal = () => setIsRecalcularModalOpen(false);

  const [isTrocarFolhaModalOpen, setIsTrocarFolhaModalOpen] = useState(false);
  const [folhas, setFolhas] = useState([]);
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


  const openTrocarFolhaModal = () => {
    const folhasDisponiveis = gerarFolhasDisponiveis(); 
    setFolhas(folhasDisponiveis);
    setIsTrocarFolhaModalOpen(true);
  };
  
  const closeTrocarFolhaModal = () => setIsTrocarFolhaModalOpen(false);
  
  const handleTrocarFolha = (novaFolha) => {
    setPeriodo(novaFolha); 
    closeTrocarFolhaModal(); 
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
  
        const registrosCorrigidos = data.map((registro) => {
        console.log('Registro original:', registro);
        const [year, month, day] = registro.dia.split('-');
        const diaFormatado = `${day}/${month}/${year}`;
        console.log('Dia formatado:', diaFormatado);
  
        return {
          ...registro,
          dia: diaFormatado,
        };
      });
  
      setRegistros(registrosCorrigidos);
      console.log('Registros buscados:', registrosCorrigidos);
    } catch (err) {
      console.error('Erro ao buscar registros:', err);
      toast.error('Erro ao buscar registros.');
    }
  };
  
  const atualizarIndicadores = async () => {
    if (!user || !user.id) {
      console.warn('Usuário não definido ao tentar atualizar indicadores.');
      return;
    }

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
    if (user && user.id) {
      atualizarIndicadores();
    }
  }, [periodo, user]);
  

  const handleRegistroPonto = async (registro) => {
    try {
      const totalHoras = calcularTotalHoras(registro.horaEntrada, registro.horaSaida);
      const feriado = await isHoliday(new Date(registro.dia));
      const escala = user.escala;
      const [year, month, day] = registro.dia.split('-').map(Number);
      const date = new Date(Date.UTC(year, month - 1, day)); // Cria a data em UTC
      const diaSemana = date.toLocaleString('pt-BR', { weekday: 'long', timeZone: 'UTC' }).toLowerCase();

  
      // Log do dia da semana em texto
      console.log(`Registrando ponto no dia: ${diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)}`);
  
      const { horasExtras, horasPositivas, horasNegativas } = calcularHorasExtras(
        registro.horaEntrada,
        registro.horaSaida,
        escala,
        diaSemana,
        feriado
      );
      console.log('Horas extras:', horasExtras);
  
      const adicionalNoturno = calcularAdicionalNoturno(registro.horaEntrada, registro.horaSaida, registro.flagNoturno);
      
      const dadosRegistro = {
        usuario_id: user.id,
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
  
      console.log('Dados do registro:', dadosRegistro);
  
      const { data, error } = await supabase.from('registro_pontos').insert([dadosRegistro]);
      if (error) throw error;
  
      toast.success('Ponto registrado com sucesso!');
      closeModal();
      atualizarIndicadores();
    } catch (err) {
      console.error('Erro ao registrar ponto:', err);
      toast.error('Erro ao registrar ponto.');
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
    { title: 'Total de Horas Trabalhadas', value: indicadores.totalBancoHoras },
    { title: 'Horas Extras', value: indicadores.totalHorasExtras },
    { title: 'Total de Horas Negativas', value: indicadores.totalHorasNegativas },
    { title: 'Total de Banco de Horas', value: indicadores.totalHorasPositivas },
    { title: 'Total a Receber', value: indicadores.totalReceber },
  ];

  const options = [
    { label: 'Registrar Ponto', action: openModal },
    { label: 'Gerenciar Registros', action: openGerenciarModal },
    { label: 'Cálculo de Rescisão', action: openCalculoRescisaoModal },
    { label: 'Trocar Período da Folha', action: openTrocarFolhaModal },
    { label: 'Recalcular Dados', action: openRecalcularModal },
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

      {isRecalcularModalOpen && (
        <RecalcularDadosModal onClose={closeRecalcularModal} />
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

      {isCalculoRescisaoModalOpen && (
        <CalculoRescisaoModal onClose={closeCalculoRescisaoModal} />
      )}


      {isTrocarFolhaModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center px-4 sm:px-6">
          <div className="bg-gray-800 text-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-lg sm:max-w-md">
            <h2 className="text-lg sm:text-xl font-bold mb-4 text-center">Trocar Período da Folha</h2>
            <ul className="space-y-4 max-h-60 sm:max-h-80 overflow-y-auto">
              {folhas.map((folha, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleTrocarFolha(folha)}
                    className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white text-left"
                  >
                    {folha.nome}
                  </button>
                </li>
              ))}
            </ul>
            <button
              onClick={closeTrocarFolhaModal}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white mt-4 w-full"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;