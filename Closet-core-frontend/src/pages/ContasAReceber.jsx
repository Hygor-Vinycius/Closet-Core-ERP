// Em: src/pages/ContasAReceber.jsx

import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';

function ContasAReceber() {
  
  // 1. Estados
  const [contas, setContas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [formasPgto, setFormasPgto] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('Aberto');

  // 2. Estados do MODAL DE RECEBIMENTO
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contaAtual, setContaAtual] = useState(null); 

  // 3. Estados do FORMULÁRIO
  const [valorRecebido, setValorRecebido] = useState(0);
  const [dataRecebimento, setDataRecebimento] = useState(new Date().toISOString().split('T')[0]);
  const [selectedFormaPgto, setSelectedFormaPgto] = useState('');
  const [juros, setJuros] = useState(0);
  const [desconto, setDesconto] = useState(0);

  // 4. Buscas
  async function buscarContas() {
    setMensagem("Carregando contas...");
    try {
      const response = await api.get(`/contas-a-receber?status=${filtroStatus}`); 
      setContas(response.data);
      setMensagem('');
    } catch (error) {
      console.error("Erro:", error);
      setMensagem("Erro ao carregar contas.");
    }
  }

  async function buscarDadosSuporte() {
    try {
      const response = await api.get('/clientes?status=todos');
      setClientes(response.data);
    } catch (error) { console.error("Erro clientes:", error); }

    try {
      const response = await api.get('/formas-pagamento');
      setFormasPgto(response.data);
      if (response.data.length > 0) setSelectedFormaPgto(response.data[0].id_forma_pgto);
    } catch (error) { console.error("Erro formas pgto:", error); }
  }

  useEffect(() => { buscarDadosSuporte(); }, []);
  useEffect(() => { buscarContas(); }, [filtroStatus]); 

  const clienteMap = useMemo(() => {
    return clientes.reduce((map, c) => { map[c.id_cliente] = c.nome_completo; return map; }, {});
  }, [clientes]);

  // 5. Lógica do Modal
  function handleAbrirModal(conta) {
    setContaAtual(conta);
    setValorRecebido(conta.saldo_devedor);
    setDataRecebimento(new Date().toISOString().split('T')[0]);
    setJuros(0);
    setDesconto(0);
    setIsModalOpen(true);
    setMensagem('');
  }

  function handleFecharModal() {
    setIsModalOpen(false);
    setContaAtual(null);
  }

  // 6. Registrar Recebimento
  async function handleSalvarRecebimento(event) {
    event.preventDefault();
    if (!contaAtual) return;

    const payload = {
      id_cta_a_receber: contaAtual.id_cta_a_receber,
      valor_pagamento: valorRecebido, 
      data_pagamento: dataRecebimento,
      id_forma_pgto: parseInt(selectedFormaPgto),
      valor_juros: juros,
      valor_desconto: desconto
    };

    try {
      setMensagem("Registrando recebimento...");
      await api.post('/recebimentos', payload);
      setMensagem("Recebimento registrado com sucesso!");
      handleFecharModal();
      buscarContas();

    } catch (error) {
      if (error.response && error.response.data && error.response.data.detail) {
        setMensagem(`Erro: ${error.response.data.detail}`);
      } else {
        setMensagem("Erro ao registrar recebimento.");
      }
    }
  }

  return (
    <div>
      <h1>Contas a Receber</h1>

      <div style={{ marginBottom: '20px' }}>
        <label>Filtrar por Status: </label>
        <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
          <option value="Aberto">Aberto (Aberto/Parcial)</option>
          <option value="Recebido">Recebido</option>
          <option value="Cancelado">Cancelado</option>
          <option value="Todos">Todos</option>
        </select>
      </div>

      {mensagem && <p>{mensagem}</p>}

      <table border="1" cellPadding="5" cellSpacing="0" style={{ width: '100%' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>ID Venda</th>
            <th>Cliente</th>
            <th>Parcela</th>
            <th>Vencimento</th>
            <th>Valor Original</th>
            <th>Saldo a Receber</th>
            <th>Status</th>
            <th>Ação</th>
          </tr>
        </thead>
        <tbody>
          {contas.map(conta => (
            <tr key={conta.id_cta_a_receber}>
              <td>{conta.id_cta_a_receber}</td>
              <td>{conta.id_venda}</td>
              <td>{clienteMap[conta.id_cliente] || `ID ${conta.id_cliente}`}</td>
              
              {/* --- CORREÇÃO AQUI --- */}
              <td>{conta.numero_parcela}</td> 
              {/* --------------------- */}

              <td>{new Date(conta.data_vencimento).toLocaleDateString('pt-BR')}</td>
              <td>R$ {conta.valor_original.toFixed(2)}</td>
              <td style={{ fontWeight: 'bold', color: 'green' }}>R$ {conta.saldo_devedor.toFixed(2)}</td>
              <td>{conta.status_conta}</td>
              <td>
                {conta.saldo_devedor > 0 && conta.status_conta !== 'Cancelado' && (
                  <button onClick={() => handleAbrirModal(conta)} style={{backgroundColor: '#4caf50', color: 'white'}}>
                    Receber
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* --- MODAL --- */}
      {isModalOpen && contaAtual && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <form onSubmit={handleSalvarRecebimento}>
              <h2>Registrar Recebimento</h2>
              <p>
                Cliente: <strong>{clienteMap[contaAtual.id_cliente]}</strong><br/>
                Saldo: <strong>R$ {contaAtual.saldo_devedor.toFixed(2)}</strong><br/>
                Parcela: {contaAtual.numero_parcela} {/* Correção no modal também */}
              </p>
              <hr />
              
              <div style={inputGroupStyle}>
                <label>Valor Recebido:</label>
                <input type="number" step="0.01" value={valorRecebido} onChange={(e) => setValorRecebido(parseFloat(e.target.value) || 0)} required />
              </div>
              <div style={inputGroupStyle}>
                <label>Data:</label>
                <input type="date" value={dataRecebimento} onChange={(e) => setDataRecebimento(e.target.value)} required />
              </div>
              <div style={inputGroupStyle}>
                <label>Forma:</label>
                <select value={selectedFormaPgto} onChange={(e) => setSelectedFormaPgto(e.target.value)} required>
                  {formasPgto.map(f => <option key={f.id_forma_pgto} value={f.id_forma_pgto}>{f.descricao}</option>)}
                </select>
              </div>
              
              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                <button type="submit">Confirmar</button>
                <button type="button" onClick={handleFecharModal} style={{backgroundColor: '#ccc', color: 'black'}}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const modalOverlayStyle = {
  position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
};
const modalContentStyle = {
  backgroundColor: 'white', padding: '20px', borderRadius: '5px', width: '400px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
};
const inputGroupStyle = { marginTop: '10px' };

export default ContasAReceber;