
import feriados2025 from '../src/holiday.json';

// Mapeia meses por escrito para número
const monthsMap = {
  'Janeiro': 1,
  'Fevereiro': 2,
  'Março': 3,
  'Abril': 4,
  'Maio': 5,
  'Junho': 6,
  'Julho': 7,
  'Agosto': 8,
  'Setembro': 9,
  'Outubro': 10,
  'Novembro': 11,
  'Dezembro': 12
};

export const isHoliday = async (date) => {
  // Se não for o ano de 2025, já devolve false.
  // (Ou adapte para anos diferentes, se quiser.)
  if (date.getFullYear() !== 2025) {
    return false;
  }

  // Extrai dia e mês da data
  const dia = date.getDate();
  const mes = date.getMonth() + 1;

  // Verifica se bate com algum feriado no JSON
  const encontrado = feriados2025.feriados.some((fer) => {
    const mesNumerico = monthsMap[fer.mes]; 
    return fer.dia === dia && mesNumerico === mes;
  });

  return encontrado; // true se encontrou, false se não
};

/**
 * Calcula o total de horas trabalhadas, inclusive quando cruza a meia-noite.
 * @param {string} horaEntrada - Formato HH:mm
 * @param {string} horaSaida   - Formato HH:mm
 * @returns {number} - Total de horas (decimal). Ex.: 7.5 = 7h30min
 */
export const calcularTotalHoras = (horaEntrada, horaSaida) => {
  if (!horaEntrada || !horaSaida) {
    console.error('Horas inválidas:', { horaEntrada, horaSaida });
    return 0;
  }

  // 1. Converte para minutos
  const [horaE, minutoE] = horaEntrada.split(':').map(Number);
  const [horaS, minutoS] = horaSaida.split(':').map(Number);

  // Se deu parsing errado, retorna 0
  if (isNaN(horaE) || isNaN(minutoE) || isNaN(horaS) || isNaN(minutoS)) {
    console.error('Erro no parsing das horas:', { horaEntrada, horaSaida });
    return 0;
  }

  let entrada = horaE * 60 + minutoE;
  let saida   = horaS * 60 + minutoS;

  // 2. Se saída <= entrada, significa que passou da meia-noite
  if (saida <= entrada) {
    saida += 24 * 60;  // soma 24h em minutos
  }

  // 3. Duração total em minutos
  const duracaoMinutos = saida - entrada;

  // 4. Converte para horas decimais
  return duracaoMinutos / 60; 
};

  
  /**
 * Corrige a data para ser salva corretamente no banco
 * @param {Date|string} data - Data a ser corrigida
 * @returns {string} - Data formatada em UTC (YYYY-MM-DD)
 */
 
 // Ajustado para criar uma data "no meio do dia" e não cair pro dia anterior:
export const corrigirDataRegistro = (data) => {
  // data vem no formato 'YYYY-MM-DD'
  const [year, month, day] = data.split('-').map(Number);
  // Cria a data no meio do dia local (12:00) pra não correr o risco de cair no dia anterior
  const dataMeioDia = new Date(year, month - 1, day, 12);
  return dataMeioDia.toISOString().split('T')[0]; // Assim fica 2024-12-28
};

  
  

/**
 * Calcula horas extras, positivas e negativas
 * @param {number} totalHoras - Total de horas trabalhadas
 * @param {string} escala - Escala do usuário (6x1, 5x2, etc.)
 * @param {string} diaSemana - Dia da semana (segunda, domingo, etc.)
 * @param {boolean} isFeriado - Indica se o dia é feriado
 * @returns {object} - Contém horas positivas, extras e negativas no formato HH:mm:ss
 */


export const calcularHorasExtras = (totalHoras, escala, diaSemana, isFeriado) => {
  const resultado = { horasPositivas: 0, horasExtras: 0, horasNegativas: 0 };

  let horasNecessarias = 0;

  // Define as horas necessárias com base na escala e no dia da semana
  if (escala === '6x1') {
    horasNecessarias = diaSemana === 'domingo' ? 0 : 7.33; // 7 horas e 20 minutos de segunda a sábado
  } else if (escala === '5x2') {
    horasNecessarias = diaSemana === 'sábado' ? 2 : diaSemana === 'domingo' ? 0 : 8.75; // 2 horas aos sábados
  }

  const saldoHoras = totalHoras - horasNecessarias;

  // Multiplicador de hora extra
  let multiplicadorHoraExtra = 1.5; // 50% adicional para dias normais
  if (isFeriado || diaSemana === 'domingo') {
    multiplicadorHoraExtra = 2; // 100% adicional para feriados e domingos
  }

  if (isFeriado || diaSemana === 'domingo') {
    resultado.horasExtras = totalHoras; // Todas as horas trabalhadas são extras
  } else {
    if (saldoHoras > 2) {
      resultado.horasPositivas = 2; // Até 2 horas vão para o banco de horas positivas
      resultado.horasExtras = (saldoHoras - 2) * multiplicadorHoraExtra; // O restante vai para hora extra
    } else if (saldoHoras > 0) {
      resultado.horasPositivas = saldoHoras; // Se o saldo é menor que 2, vai para o banco de horas positivas
    } else {
      resultado.horasNegativas = Math.abs(saldoHoras); // Saldo negativo
    }
  }

  return {
    horasPositivas: formatarHoras(resultado.horasPositivas),
    horasExtras: formatarHoras(resultado.horasExtras),
    horasNegativas: formatarHoras(resultado.horasNegativas),
  };
};

/**
 * Formata horas decimais para o formato HH:mm:ss
 * @param {number} horasDecimais - Horas no formato decimal
 * @returns {string} - Horas no formato HH:mm:ss
 */

export const formatarHoras = (horasDecimais) => {
    if (isNaN(horasDecimais) || horasDecimais < 0) {
      return '00:00:00';
    }
  
    const horas = Math.floor(horasDecimais); // Parte inteira das horas
    const minutos = Math.round((horasDecimais - horas) * 60); // Calcula os minutos a partir do decimal
  
    return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:00`; // Adiciona sempre :00 nos segundos
  };
  



  /**
 * Calcula as horas em adicional noturno (22h às 05h).
 * Se flagNoturno = true, entende que pode cruzar a meia-noite.
 * Retorna somente a quantidade de horas em decimal que caem no intervalo noturno.
 */
export const calcularAdicionalNoturno = (horaEntrada, horaSaida, flagNoturno) => {
  if (!flagNoturno) {
    return 0;
  }

  // 1. Converte hora de entrada e saída para minutos
  const [hE, mE] = horaEntrada.split(':').map(Number);
  const [hS, mS] = horaSaida.split(':').map(Number);

  let entrada = hE * 60 + mE; 
  let saida = hS * 60 + mS;

  // 2. Se a saída é menor ou igual à entrada, soma 24h em minutos
  if (saida <= entrada) {
    saida += 24 * 60; 
  }

  // 3. Intervalo noturno: [22:00, 05:00 do dia seguinte]
  const noturnoInicio = 22 * 60;  // 1320
  const noturnoFim = 29 * 60;     // 1740 (05:00 do dia seguinte)

  // 4. Calcula a sobreposição
  const inicioOverlap = Math.max(entrada, noturnoInicio);
  const fimOverlap = Math.min(saida, noturnoFim);
  const duracaoOverlap = Math.max(0, fimOverlap - inicioOverlap);

  // 5. Converte minutos para horas (decimal)
  const horasNoturnas = duracaoOverlap / 60;

  return horasNoturnas;
};

