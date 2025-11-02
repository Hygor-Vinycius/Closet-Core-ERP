import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';

// --- COMPONENTE ---
function ContasAPagar() {
  
  // 1. Estados da Página
  const [contas, setContas] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [formasPgto, setFormasPgto] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('Aberto');

  // 2. Estados do MODAL DE PAGAMENTO (o que já tínhamos)
  const [isPagarModalOpen, setIsPagarModalOpen] = useState(false);
  const [contaAtual, setContaAtual] = useState(null); 

  // 3. Estados do FORMULÁRIO DE PAGAMENTO
  const [valorPago, setValorPago] = useState(0);
  const [dataPagamento, setDataPagamento] = useState(new Date().toISOString().split('T')[0]);
  const [selectedFormaPgto, setSelectedFormaPgto] = useState('');
  const [juros, setJuros] = useState(0);
  const [desconto, setDesconto] = useState(0);

  // 4. NOVOS ESTADOS: MODAL DE "VER PAGAMENTOS" (para estorno)
  const [isVerModalOpen, setIsVerModalOpen] = useState(false);
  const [pagamentosDaConta, setPagamentosDaConta] = useState([]);
  const [contaSendoVista, setContaSendoVista] = useState(null);
  const [modalVerMsg, setModalVerMsg] = useState(''); // Mensagem para o 2º modal

  // 5. Funções de Busca (useEffect)
  async function buscarContas() {
    setMensagem("Carregando contas...");
    try {
      const response = await api.get(`/contas-a-pagar?status=${filtroStatus}`); 
      setContas(response.data);
      setMensagem('');
    } catch (error) {
      console.error("Erro ao buscar contas a pagar:", error);
      setMensagem("Erro ao carregar contas.");
    }
  }

  async function buscarDadosSuporte() {
    try {
      const responseFornecedores = await api.get('/fornecedores?status=todos');
      setFornecedores(responseFornecedores.data);
    } catch (error) { console.error("Erro ao buscar fornecedores:", error); }

    try {
      const responseFormas = await api.get('/formas-pagamento');
      setFormasPgto(responseFormas.data);
      if (responseFormas.data.length > 0) {
        setSelectedFormaPgto(responseFormas.data[0].id_forma_pgto);
      }
    } catch (error) { console.error("Erro ao buscar formas de pgto:", error); }
  }

  useEffect(() => {
    buscarDadosSuporte(); 
  }, []);

  useEffect(() => {
    buscarContas(); 
  }, [filtroStatus]); 

  // 6. "Tradutores" de ID para Nome
  const fornecedorMap = useMemo(() => {
    return fornecedores.reduce((map, f) => { map[f.id_fornecedor] = f.razao_social; return map; }, {});
  }, [fornecedores]);

  const formaPgtoMap = useMemo(() => {
    return formasPgto.reduce((map, f) => { map[f.id_forma_pgto] = f.descricao; return map; }, {});
  }, [formasPgto]);

  // 7. Funções do MODAL DE PAGAMENTO (O que já tínhamos)
  function handleAbrirPagarModal(conta) {
    setContaAtual(conta);
    setValorPago(conta.saldo_devedor);
    setDataPagamento(new Date().toISOString().split('T')[0]);
    setJuros(0);
    setDesconto(0);
    setIsPagarModalOpen(true);
    setMensagem('');
  }

  function handleFecharPagarModal() {
    setIsPagarModalOpen(false);
    setContaAtual(null);
  }

  async function handleSalvarPagamento(event) {
    event.preventDefault();
    if (!contaAtual) return;
    const payload = {
      id_cta_a_pgto: contaAtual.id_cta_a_pgto,
      valor_pagamento: valorPago,
      data_pagamento: dataPagamento,
      id_forma_pgto: parseInt(selectedFormaPgto),
      valor_juros: juros,
      valor_desconto: desconto
    };

    try {
      setMensagem("Registrando pagamento...");
      await api.post('/pagamentos', payload);
      setMensagem("Pagamento registrado com sucesso!");
      handleFecharPagarModal();
      buscarContas(); 
    } catch (error) {
      // (Restante do seu código de erro)
      if (error.response && error.response.data && error.response.data.detail) {
        setMensagem(`Erro: ${error.response.data.detail}`);
      } else {
        setMensagem("Erro ao registrar pagamento.");
      }
    }
  }

  // 8. NOVAS FUNÇÕES: MODAL DE "VER PAGAMENTOS" E CANCELAMENTO
  async function handleAbrirVerModal(conta) {
    setContaSendoVista(conta);
    setModalVerMsg("Carregando histórico...");
    setIsVerModalOpen(true);
    try {
      // Chama o NOVO endpoint que criamos no backend!
      const response = await api.get(`/pagamentos/por-conta/${conta.id_cta_a_pgto}`);
      setPagamentosDaConta(response.data);
      setModalVerMsg('');
    } catch (error) {
      console.error("Erro ao buscar pagamentos da conta:", error);
      setModalVerMsg("Erro ao carregar pagamentos.");
    }
  }

  function handleFecharVerModal() {
    setIsVerModalOpen(false);
    setContaSendoVista(null);
    setPagamentosDaConta([]);
    setModalVerMsg('');
  }

  async function handleCancelarPagamento(pagamentoId) {
    if (!window.confirm(`Tem certeza que deseja estornar o pagamento ID ${pagamentoId}? Esta ação é irreversível.`)) {
      return;
    }
    setModalVerMsg("Estornando pagamento...");
    try {
      // Chama o endpoint de cancelamento que JÁ EXISTIA
      await api.post(`/pagamentos/${pagamentoId}/cancelar`);
      setModalVerMsg("Pagamento estornado com sucesso!");
      
      // Atualiza AMBAS as listas
      buscarContas(); // Atualiza a lista principal (o saldo da conta vai mudar)
      handleAbrirVerModal(contaSendoVista); // Re-busca os pagamentos do modal
    } catch (error) {
      if (error.response && error.response.data && error.response.data.detail) {
        setModalVerMsg(`Erro: ${error.response.data.detail}`);
      } else {
        setModalVerMsg("Erro ao estornar pagamento.");
      }
    }
  }


  // 9. O JSX (HTML)
  return (
    <div>
      <h1>Contas a Pagar</h1>

      {/* --- Filtros --- */}
      <div style={{ marginBottom: '20px' }}>
        <label>Filtrar por Status: </label>
        <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
          <option value="Aberto">Aberto (Aberto/Pago Parcial)</option>
          <option value="Pago">Pago</option>
          <option value="Cancelado">Cancelado</option>
          <option value="Todos">Todos</option>
        </select>
      </div>

      {mensagem && <p>{mensagem}</p>}

      {/* --- Tabela de Contas a Pagar --- */}
      <table border="1" cellPadding="5" cellSpacing="0" style={{ width: '100%' }}>
        <thead>
          <tr>
            <th>ID Conta</th>
            <th>ID Compra</th>
            <th>Fornecedor</th>
            <th>Parcela</th>
            <th>Vencimento</th>
            <th>Valor Original</th>
            <th>Saldo Devedor</th>
            <th>Status</th>
            <th>Ação</th>
          </tr>
        </thead>
        <tbody>
          {contas.map(conta => {
            const statusLower = conta.status_conta.trim().toLowerCase();
            return (
              <tr key={conta.id_cta_a_pgto}>
                <td>{conta.id_cta_a_pgto}</td>
                <td>{conta.id_compra}</td>
                <td>{fornecedorMap[conta.id_fornecedor] || `ID ${conta.id_fornecedor}`}</td>
                <td>{conta.num_parcelas}</td>
                <td>{new Date(conta.data_vencimento).toLocaleDateString('pt-BR')}</td>
                <td>R$ {conta.valor_original.toFixed(2)}</td>
                <td style={{ fontWeight: 'bold' }}>R$ {conta.saldo_devedor.toFixed(2)}</td>
                <td>{conta.status_conta}</td>
                <td>
                  {/* Botão Pagar (se tiver saldo) */}
                  {conta.saldo_devedor > 0 && statusLower !== 'cancelado' && (
                    <button onClick={() => handleAbrirPagarModal(conta)}>
                      Pagar
                    </button>
                  )}
                  {/* NOVO BOTÃO: Ver Pagamentos (se for 'Pago' ou 'Pago Parcial') */}
                  {(statusLower === 'pago' || statusLower === 'pago parcial') && (
                    <button 
                      onClick={() => handleAbrirVerModal(conta)}
                      style={{ backgroundColor: '#e0e0e0', marginLeft: '5px' }}
                    >
                      Ver Pagamentos
                    </button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* --- MODAL DE PAGAMENTO (Já existente) --- */}
      {isPagarModalOpen && contaAtual && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <form onSubmit={handleSalvarPagamento}>
              <h2>Registrar Pagamento</h2>
              <p>
                Pagando a Parcela {contaAtual.num_parcelas} (ID {contaAtual.id_cta_a_pgto})<br/>
                Fornecedor: <strong>{fornecedorMap[contaAtual.id_fornecedor]}</strong><br/>
                Saldo Devedor: <strong>R$ {contaAtual.saldo_devedor.toFixed(2)}</strong>
              </p>
              <hr />
              <div style={inputGroupStyle}>
                <label>Valor a Pagar:</label>
                <input type="number" step="0.01" value={valorPago} onChange={(e) => setValorPago(parseFloat(e.target.value) || 0)} required />
              </div>
              <div style={inputGroupStyle}>
                <label>Data Pagamento:</label>
                <input type="date" value={dataPagamento} onChange={(e) => setDataPagamento(e.target.value)} required />
              </div>
              <div style={inputGroupStyle}>
                <label>Forma de Pagamento:</label>
                <select value={selectedFormaPgto} onChange={(e) => setSelectedFormaPgto(e.target.value)} required>
                  {formasPgto.map(f => <option key={f.id_forma_pgto} value={f.id_forma_pgto}>{f.descricao}</option>)}
                </select>
              </div>
              <div style={inputGroupStyle}>
                <label>Juros (R$):</label>
                <input type="number" step="0.01" value={juros} onChange={(e) => setJuros(parseFloat(e.target.value) || 0)} />
              </div>
              <div style={inputGroupStyle}>
                <label>Desconto (R$):</label>
                <input type="number" step="0.01" value={desconto} onChange={(e) => setDesconto(parseFloat(e.target.value) || 0)} />
              </div>
              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                <button type="submit">Confirmar Pagamento</button>
                <button type="button" onClick={handleFecharPagarModal}>Cancelar</button>
              </div>
              {mensagem && <p>{mensagem}</p>}
            </form>
          </div>
        </div>
      )}

      {/* --- NOVO MODAL: "VER PAGAMENTOS" (Para Estorno) --- */}
      {isVerModalOpen && contaSendoVista && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h2>Histórico de Pagamentos</h2>
            <p>
              Conta ID: {contaSendoVista.id_cta_a_pgto} (Parcela {contaSendoVista.num_parcelas})<br/>
              Fornecedor: <strong>{fornecedorMap[contaSendoVista.id_fornecedor]}</strong>
            </p>
            {modalVerMsg && <p>{modalVerMsg}</p>}
            
            <table border="1" cellPadding="5" cellSpacing="0" style={{ width: '100%', marginTop: '15px' }}>
              <thead>
                <tr>
                  <th>ID Pgto</th>
                  <th>Data</th>
                  <th>Valor</th>
                  <th>Forma</th>
                  <th>Status</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {pagamentosDaConta.length === 0 && (
                  <tr><td colSpan="6">Nenhum pagamento encontrado.</td></tr>
                )}
                {pagamentosDaConta.map(pgto => (
                  <tr key={pgto.id_pagamento}>
                    <td>{pgto.id_pagamento}</td>
                    <td>{new Date(pgto.data_pagamento).toLocaleDateString('pt-BR')}</td>
                    <td>R$ {pgto.valor_pagamento.toFixed(2)}</td>
                    <td>{formaPgtoMap[pgto.id_forma_pgto] || 'N/A'}</td>
                    <td>{pgto.status}</td>
                    <td>
                      {/* O botão "Cancelar" só aparece se o pagamento estiver "Efetivado" */}
                      {pgto.status === 'Efetivado' && (
                        <button 
                          onClick={() => handleCancelarPagamento(pgto.id_pagamento)}
                          style={{ backgroundColor: '#ffcccc' }}
                        >
                          Cancelar
                        </button>
                      )}
                      {pgto.status === 'Cancelado' && (
                        <span style={{ color: 'red' }}>Estornado</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button type="button" onClick={handleFecharVerModal} style={{ marginTop: '20px' }}>
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Estilos CSS para o Modal (só para funcionar) ---
const modalOverlayStyle = {
  position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
};

const modalContentStyle = {
  backgroundColor: 'white', padding: '20px', borderRadius: '5px',
  width: '500px', // Aumentei um pouco o tamanho para o novo modal
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
};

const inputGroupStyle = {
  marginTop: '10px'
};

export default ContasAPagar;