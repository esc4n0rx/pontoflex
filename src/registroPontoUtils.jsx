import feriados2025 from '../src/holiday.json';

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

export const isHoliday = (dateString) => {
  const date = new Date(dateString);
  console.log(date); 
  if (date.getFullYear() !== 2025) {
    return false;
  }

  const dia = date.getDate();
  const mes = date.getMonth() + 1;

  return feriados2025.feriados.some((fer) => {
    const mesNumerico = monthsMap[fer.mes];
    return fer.dia === dia && mesNumerico === mes;
  });
};


// Corrige a data para ser salva corretamente no banco
export const corrigirDataRegistro = (data) => {
  const [year, month, day] = data.split('-').map(Number);
  const dataMeioDia = new Date(year, month - 1, day, 12);
  return dataMeioDia.toISOString().split('T')[0];
};

// Calcula o total de horas trabalhadas (considerando entrada e saída)
export const calcularTotalHoras = (horaEntrada, horaSaida) => {
  // Garante que horaEntrada e horaSaida sejam strings
  horaEntrada = String(horaEntrada);
  horaSaida = String(horaSaida);

  if (!horaEntrada || !horaSaida) {
    console.error('Horas inválidas:', { horaEntrada, horaSaida });
    return 0;
  }

  const [horaE, minutoE] = horaEntrada.split(':').map(Number);
  const [horaS, minutoS] = horaSaida.split(':').map(Number);

  let entrada = horaE * 60 + minutoE;
  let saida = horaS * 60 + minutoS;

  if (saida <= entrada) {
    saida += 24 * 60;
  }

  const duracaoMinutos = saida - entrada;
  return duracaoMinutos / 60; // Retorna em horas decimais
};

// Calcula adicional noturno (22h às 05h)
export const calcularAdicionalNoturno = (horaEntrada, horaSaida, flagNoturno) => {
  if (!flagNoturno) {
    return 0;
  }

  const [hE, mE] = horaEntrada.split(':').map(Number);
  const [hS, mS] = horaSaida.split(':').map(Number);

  let entrada = hE * 60 + mE;
  let saida = hS * 60 + mS;

  if (saida <= entrada) {
    saida += 24 * 60;
  }

  const noturnoInicio = 22 * 60;
  const noturnoFim = 29 * 60;

  const inicioOverlap = Math.max(entrada, noturnoInicio);
  const fimOverlap = Math.min(saida, noturnoFim);
  const duracaoOverlap = Math.max(0, fimOverlap - inicioOverlap);

  return duracaoOverlap / 60; // Retorna em horas decimais
};

// Calcula horas extras, positivas e negativas
export const calcularHorasExtras = (horaEntrada, horaSaida, escala, diaSemana, isFeriado) => {
  // Garante que os valores sejam strings
  horaEntrada = String(horaEntrada);
  horaSaida = String(horaSaida);

  const resultado = { horasPositivas: 0, horasExtras: 0, horasNegativas: 0 };

  const isDomingoOuFeriado = isFeriado || diaSemana === 'domingo';

  // Define as horas necessárias por escala
  let horasNecessarias = 0;
  if (!isDomingoOuFeriado) {
    if (escala === '6x1') {
      horasNecessarias = 7.33; // 7h20 de segunda a sábado
    } else if (escala === '5x2') {
      horasNecessarias = diaSemana === 'sábado' ? 2 : 8.75; // 2h aos sábados, 8h45 dias úteis
    }
  }

  // Calcula horas trabalhadas e desconta 1 hora de almoço
  let totalHoras = calcularTotalHoras(horaEntrada, horaSaida);
  totalHoras = totalHoras > 1 ? totalHoras - 1 : 0;

  const totalHorasCentesimos = converterParaCentesimos(totalHoras);
  const horasNecessariasCentesimos = converterParaCentesimos(horasNecessarias);

  if (isDomingoOuFeriado) {
    resultado.horasExtras = totalHorasCentesimos; // Todas as horas trabalhadas são extras
  } else {
    const saldoHoras = totalHorasCentesimos - horasNecessariasCentesimos;

    if (saldoHoras > 2) {
      resultado.horasPositivas = 2; // Até 2h para o banco de horas
      resultado.horasExtras = saldoHoras - 2; // Restante é extra
    } else if (saldoHoras > 0) {
      resultado.horasPositivas = saldoHoras; // Saldo menor que 2h vai para banco
    } else {
      resultado.horasNegativas = Math.abs(saldoHoras); // Saldo negativo
    }
  }

  return {
    horasPositivas: formatarCentesimos(resultado.horasPositivas),
    horasExtras: formatarCentesimos(resultado.horasExtras),
    horasNegativas: formatarCentesimos(resultado.horasNegativas),
  };
};

// Converte horas decimais para centésimos
const converterParaCentesimos = (horasDecimais) => {
  const horas = Math.floor(horasDecimais);
  const minutos = Math.round((horasDecimais - horas) * 60);
  return horas + minutos / 60;
};

// Converte centésimos para o formato HH:mm:ss
const formatarCentesimos = (horasCentesimos) => {
  const horas = Math.floor(horasCentesimos);
  const minutosCentesimos = horasCentesimos - horas;
  const minutos = Math.round(minutosCentesimos * 60);
  return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:00`;
};
