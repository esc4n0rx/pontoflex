import { supabase } from './supabaseClient';

/**
 * Calcula o período da folha atual.
 * A folha começa no dia 16 do mês anterior e termina no dia 15 do mês atual.
 */
export const getPeriodoFolha = () => {
  const hoje = new Date();
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth() - (hoje.getDate() < 16 ? 1 : 0), 16);
  const fim = new Date(inicio.getFullYear(), inicio.getMonth() + 1, 15);
  return { inicio, fim };
};

/**
 * Gera uma lista de folhas disponíveis com base no período atual.
 * Por padrão, gera folhas dos últimos 12 meses.
 * @param {number} meses - Número de meses a retroceder para gerar as folhas (padrão: 12).
 */
export const gerarFolhasDisponiveis = (meses = 12) => {
  const folhas = [];
  const hoje = new Date();

  for (let i = 0; i < meses; i++) {
    const ano = hoje.getFullYear();
    const mes = hoje.getMonth() - i;

    const inicio = new Date(ano, mes - (hoje.getDate() < 16 ? 1 : 0), 16);
    const fim = new Date(inicio.getFullYear(), inicio.getMonth() + 1, 15);

    const nome = `Folha de ${inicio.toLocaleString('pt-BR', { month: 'long' }).charAt(0).toUpperCase() + inicio.toLocaleString('pt-BR', { month: 'long' }).slice(1)} (${inicio.toLocaleDateString()} - ${fim.toLocaleDateString()})`;

    folhas.push({ inicio, fim, nome });
  }

  return folhas.reverse(); 
};

/**
 * Calcula os indicadores baseados nos registros do usuário.
 * @param {string} userId 
 * @param {object} periodo 
 */
export const calcularIndicadores = async (userId, periodo) => {
  const { inicio, fim } = periodo;

  const { data: registros, error } = await supabase
    .from('registro_pontos')
    .select('total_horas, horas_extras, horas_negativas, horas_positivas, adicional_noturno, is_feriado')
    .eq('usuario_id', userId)
    .gte('dia', inicio.toISOString())
    .lte('dia', fim.toISOString());

  if (error) {
    console.error('Erro ao buscar registros:', error);
    throw new Error('Erro ao buscar registros');
  }


  let totalBancoHoras = 0;
  let totalHorasExtras = 0;
  let totalHorasNegativas = 0;
  let totalHorasPositivas = 0;
  let totalAdicionalNoturno = 0;
  let totalReceber = 0;


  const { data: user, error: userError } = await supabase
    .from('users')
    .select('salario_base, carga_horaria_mensal')
    .eq('id', userId)
    .single();

  if (userError) {
    console.error('Erro ao buscar salário do usuário:', userError);
    throw new Error('Erro ao calcular salário.');
  }

  const valorHora = user.salario_base / user.carga_horaria_mensal;

  // Processa os registros
  registros.forEach((registro) => {
    totalBancoHoras += parseFloat(registro.total_horas);
    totalHorasExtras += parseFloat(registro.horas_extras);
    totalHorasNegativas += parseFloat(registro.horas_negativas);
    totalHorasPositivas += parseFloat(registro.horas_positivas);
    totalAdicionalNoturno += parseFloat(registro.adicional_noturno);

    // Calcula o valor a receber para cada registro
    const valorHorasExtras = parseFloat(registro.horas_extras) * valorHora * (registro.is_feriado ? 2 : 1.5);
    const valorAdicionalNoturno = parseFloat(registro.adicional_noturno) * valorHora * 0.5;

    totalReceber += valorHorasExtras + valorAdicionalNoturno;
  });

  return {
    totalBancoHoras,
    totalHorasExtras,
    totalHorasNegativas,
    totalHorasPositivas,
    totalReceber,
  };
};
