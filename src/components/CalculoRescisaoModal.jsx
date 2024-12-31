import React, { useState } from 'react';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';

const CalculoRescisaoModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    dataAdmissao: '',
    dataDemissao: '',
    salarioAtual: '',
    motivoDemissao: '',
    avisoPrevioCumprido: false,
  });
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const calcularRescisao = () => {
    setLoading(true);
    setResultado(null);
  
    try {
      const { dataAdmissao, dataDemissao, salarioAtual, motivoDemissao, avisoPrevioCumprido, feriasVencidas } = formData;
      const salario = parseFloat(salarioAtual);
  
      const dataInicio = new Date(dataAdmissao);
      const dataFim = new Date(dataDemissao);
      const tempoServico = Math.floor((dataFim - dataInicio) / (1000 * 60 * 60 * 24 * 365));
      const mesesTrabalhadosNoAno = dataFim.getMonth() + 1;
  
      // Saldo de Salário
      const diasTrabalhados = dataFim.getDate();
      const saldoSalario = (salario / 30) * diasTrabalhados;
  
      // Férias
      const feriasVencidasTotal = feriasVencidas ? salario + salario / 3 : 0;
      const feriasProporcionais = ((salario / 12) * mesesTrabalhadosNoAno) + ((salario / 3 / 12) * mesesTrabalhadosNoAno);
  
      // 13º proporcional
      const decimoTerceiroProporcional = (salario / 12) * mesesTrabalhadosNoAno;
  
      // Aviso Prévio
      const avisoPrevio = avisoPrevioCumprido ? 0 : salario + (salario / 30) * (tempoServico >= 1 ? (tempoServico - 1) * 3 : 0);
  
      // FGTS e Multa
      const fgts = salario * 0.08 * (tempoServico * 12);
      const multaFgts = motivoDemissao === 'semJustaCausa' ? fgts * 0.4 : 0;
  
      const totalReceber = saldoSalario + feriasVencidasTotal + feriasProporcionais + decimoTerceiroProporcional + avisoPrevio + multaFgts;
  
      setResultado({
        saldoSalario: saldoSalario.toFixed(2),
        feriasVencidas: feriasVencidasTotal.toFixed(2),
        feriasProporcionais: feriasProporcionais.toFixed(2),
        decimoTerceiroProporcional: decimoTerceiroProporcional.toFixed(2),
        avisoPrevio: avisoPrevio.toFixed(2),
        fgts: fgts.toFixed(2),
        multaFgts: multaFgts.toFixed(2),
        totalReceber: totalReceber.toFixed(2),
      });
    } catch (error) {
      console.error('Erro ao calcular rescisão:', error);
      toast.error('Erro ao calcular rescisão.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.dataAdmissao || !formData.dataDemissao || !formData.salarioAtual || !formData.motivoDemissao) {
      toast.error('Preencha todos os campos!');
      return;
    }
    calcularRescisao();
  };

  const gerarPDF = () => {
    if (!resultado) return;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Cálculo de Rescisão', 10, 10);
    doc.setFontSize(12);
    doc.text(`Saldo de Salário: R$ ${resultado.saldoSalario}`, 10, 30);
    doc.text(`Férias Proporcionais: R$ ${resultado.feriasProporcionais}`, 10, 40);
    doc.text(`13º Proporcional: R$ ${resultado.decimoTerceiroProporcional}`, 10, 50);
    doc.text(`Aviso Prévio: R$ ${resultado.avisoPrevio}`, 10, 60);
    doc.text(`FGTS: R$ ${resultado.fgts}`, 10, 70);
    doc.text(`Multa FGTS: R$ ${resultado.multaFgts}`, 10, 80);
    doc.text(`Total a Receber: R$ ${resultado.totalReceber}`, 10, 100);
    doc.save('rescisao.pdf');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center px-4 sm:px-6">
      <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Cálculo de Rescisão</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Data de Admissão</label>
            <input
              type="date"
              name="dataAdmissao"
              value={formData.dataAdmissao}
              onChange={handleInputChange}
              className="w-full bg-gray-700 rounded-lg p-2 mt-1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Data de Demissão</label>
            <input
              type="date"
              name="dataDemissao"
              value={formData.dataDemissao}
              onChange={handleInputChange}
              className="w-full bg-gray-700 rounded-lg p-2 mt-1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Salário Atual (R$)</label>
            <input
              type="number"
              name="salarioAtual"
              value={formData.salarioAtual}
              onChange={handleInputChange}
              className="w-full bg-gray-700 rounded-lg p-2 mt-1"
              required
            />
          </div>
          <div>
            <label className="inline-flex items-center">
                <input
                type="checkbox"
                name="feriasVencidas"
                checked={formData.feriasVencidas}
                onChange={handleInputChange}
                className="form-checkbox bg-gray-700 text-blue-600"
                />
                <span className="ml-2">1 Período de Férias Vencido</span>
            </label>
            </div>
          <div>
            <label className="block text-sm font-medium">Motivo da Demissão</label>
            <select
              name="motivoDemissao"
              value={formData.motivoDemissao}
              onChange={handleInputChange}
              className="w-full bg-gray-700 rounded-lg p-2 mt-1"
              required
            >
              <option value="" disabled>Selecione</option>
              <option value="pedido">Pedido de Demissão</option>
              <option value="justaCausa">Demissão por Justa Causa</option>
              <option value="semJustaCausa">Demissão sem Justa Causa</option>
            </select>
          </div>
          <div>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="avisoPrevioCumprido"
                checked={formData.avisoPrevioCumprido}
                onChange={handleInputChange}
                className="form-checkbox bg-gray-700 text-blue-600"
              />
              <span className="ml-2">Aviso Prévio Cumprido</span>
            </label>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg text-white font-semibold"
            disabled={loading}
          >
            {loading ? 'Calculando...' : 'Calcular'}
          </button>
        </form>

        {resultado && (
          <div className="mt-6 p-4 bg-gray-700 rounded-lg">
            <h3 className="text-lg font-bold">Resultado</h3>
            <p>Saldo de Salário: <span className="font-bold text-green-400">R$ {resultado.saldoSalario}</span></p>
            <p>Férias Proporcionais: <span className="font-bold text-green-400">R$ {resultado.feriasProporcionais}</span></p>
            <p>13º Proporcional: <span className="font-bold text-green-400">R$ {resultado.decimoTerceiroProporcional}</span></p>
            <p>Aviso Prévio: <span className="font-bold text-green-400">R$ {resultado.avisoPrevio}</span></p>
            <p>FGTS: <span className="font-bold text-green-400">R$ {resultado.fgts}</span></p>
            <p>Multa FGTS: <span className="font-bold text-green-400">R$ {resultado.multaFgts}</span></p>
            <p>Total a Receber: <span className="font-bold text-green-400">R$ {resultado.totalReceber}</span></p>
            <button
              onClick={gerarPDF}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 py-2 rounded-lg text-white"
            >
              Gerar PDF
            </button>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full mt-4 bg-red-600 hover:bg-red-700 py-2 rounded-lg text-white"
        >
          Fechar
        </button>
      </div>
    </div>
  );
};

export default CalculoRescisaoModal;
