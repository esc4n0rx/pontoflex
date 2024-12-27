import axios from 'axios';

/**
 * Verifica se uma data é feriado.
 * @param {Date} date - Data a ser verificada.
 * @param {string} countryCode - Código do país (padrão "BR").
 * @returns {Promise<boolean>} - Retorna `true` se for feriado.
 */
export const isHoliday = async (date, countryCode = 'BR') => {
    const API_KEY = process.env.REACT_APP_HOLIDAY_API_KEY;
  
    if (!API_KEY) {
      throw new Error('A chave da API para feriados não está configurada nas variáveis de ambiente.');
    }
  
    const url = `https://holidays.abstractapi.com/v1/?api_key=${API_KEY}&country=${countryCode}&year=${date.getFullYear()}&month=${date.getMonth() + 1}&day=${date.getDate()}`;
  
    try {
      const response = await axios.get(url, { timeout: 5000 });
      if (response.status === 200) {
        const holidays = response.data;
        return holidays.length > 0;
      } else {
        console.error(`Erro na requisição: ${response.status}`);
        return false;
      }
    } catch (error) {
      console.error('Erro ao verificar feriado:', error);
      return false;
    }
  };

  
/**
 * Calcula o total de horas trabalhadas
 * @param {string} horaEntrada - Hora de entrada no formato HH:mm
 * @param {string} horaSaida - Hora de saída no formato HH:mm
 * @returns {string} - Total de horas no formato HH:mm:ss
 */
export const calcularTotalHoras = (horaEntrada, horaSaida) => {
    if (!horaEntrada || !horaSaida) {
      console.error('Horas inválidas:', { horaEntrada, horaSaida });
      console.log('Horas:', { horaEntrada, horaSaida });
      return 0;
    }
  
    const [horaE, minutoE] = horaEntrada.split(':').map(Number);
    const [horaS, minutoS] = horaSaida.split(':').map(Number);
  
    if (isNaN(horaE) || isNaN(minutoE) || isNaN(horaS) || isNaN(minutoS)) {
      console.error('Erro no parsing das horas:', { horaEntrada, horaSaida });
      return 0;
    }
  
    let horasTrabalhadas = horaS - horaE;
    let minutosTrabalhados = minutoS - minutoE;
  
    if (minutosTrabalhados < 0) {
      horasTrabalhadas -= 1;
      minutosTrabalhados += 60;
    }
  
    // Converte para horas decimais
    return horasTrabalhadas + minutosTrabalhados / 60;
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
  
    if (escala === '6x1') horasNecessarias = diaSemana === 'domingo' ? 0 : 8;
    else if (escala === '5x2') horasNecessarias = diaSemana === 'sábado' ? 0 : 8.75;
  
    const saldoHoras = totalHoras - horasNecessarias;
  
    if (isFeriado || diaSemana === 'domingo') {
      resultado.horasExtras = totalHoras;
    } else if (diaSemana === 'sábado' && escala === '5x2') {
      resultado.horasPositivas = Math.min(totalHoras, 2);
      resultado.horasExtras = Math.max(0, totalHoras - 2);
    } else {
      if (saldoHoras > 2) {
        resultado.horasPositivas = 2;
        resultado.horasExtras = saldoHoras - 2;
      } else if (saldoHoras > 0) {
        resultado.horasPositivas = saldoHoras;
      } else {
        resultado.horasNegativas = Math.abs(saldoHoras);
      }
    }
  
    // Formata os resultados antes de retorná-los
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
 * Calcula adicional noturno
 * @param {string} horaEntrada - Hora de entrada no formato HH:mm
 * @param {string} horaSaida - Hora de saída no formato HH:mm
 * @param {boolean} flagNoturno - Indica se o trabalho foi noturno
 * @returns {number} - Horas de adicional noturno
 */
export const calcularAdicionalNoturno = (horaEntrada, horaSaida, flagNoturno) => {
  if (!flagNoturno) return 0;

  const [horaE, minutoE] = horaEntrada.split(':').map(Number);
  const [horaS, minutoS] = horaSaida.split(':').map(Number);

  let adicionalNoturno = 0;

  for (let hora = horaE; hora !== horaS; hora = (hora + 1) % 24) {
    if (hora >= 0 && hora < 5) {
      adicionalNoturno += 1;
    }
  }

  return adicionalNoturno + (minutoS - minutoE) / 60;
};
