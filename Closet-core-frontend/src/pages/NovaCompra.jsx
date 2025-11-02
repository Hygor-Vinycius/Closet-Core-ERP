import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';

// --- Helper para calcular datas de vencimento ---
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  // Formata para 'AAAA-MM-DD'
  return result.toISOString().split('T')[0];
}

function NovaCompra() {
  
  // 1. Estados para os DADOS (para os dropdowns)
  const [fornecedores, setFornecedores] = useState([]);
  const [condicoes, setCondicoes] = useState([]);
  const [variacoes, setVariacoes] = useState([]);
  const [mensagem, setMensagem] = useState('');

  // 2. Estados do CABEÇALHO da Compra (agora com nota_fiscal)
  const [selectedFornecedor, setSelectedFornecedor] = useState('');
  const [selectedCondicao, setSelectedCondicao] = useState('');
  const [notaFiscal, setNotaFiscal] = useState(''); // <-- NOVO CAMPO

  // 3. Estados para o "CARRINHO DE ITENS"
  const [itensDaCompra, setItensDaCompra] = useState([]);
  
  // 4. Estados para o "CARRINHO DE PARCELAS" (baseado no seu Insomnia)
  const [parcelas, setParcelas] = useState([]); // <-- NOVO CAMPO

  // 5. Estados para o formulário de ADICIONAR ITEM
  const [currentItem, setCurrentItem] = useState('');
  const [currentQtd, setCurrentQtd] = useState(1);
  const [currentCusto, setCurrentCusto] = useState(0);


  // 6. useEffect: Carrega todos os dados necessários
  useEffect(() => {
    async function buscarFornecedores() {
      try {
        const response = await api.get('/fornecedores'); //
        setFornecedores(response.data);
        if (response.data.length > 0) setSelectedFornecedor(response.data[0].id_fornecedor);
      } catch (error) { console.error("Erro ao buscar fornecedores:", error); }
    }

    async function buscarCondicoes() {
      try {
        const response = await api.get('/condicoes-pagamento'); //
        setCondicoes(response.data);
        if (response.data.length > 0) setSelectedCondicao(response.data[0].id_condicao);
      } catch (error) { console.error("Erro ao buscar condições:", error); }
    }

    async function buscarVariacoes() {
      try {
        const response = await api.get('/variacoes'); //
        setVariacoes(response.data);
        if (response.data.length > 0) {
          setCurrentItem(response.data[0].id_variacao);
          setCurrentCusto(response.data[0].custo || 0);
        }
      } catch (error) { console.error("Erro ao buscar variações:", error); }
    }

    buscarFornecedores();
    buscarCondicoes();
    buscarVariacoes();
  }, []); 

  // 7. Funções do "CARRINHO DE ITENS"
  function handleAddItem() {
    const variacaoInfo = variacoes.find(v => v.id_variacao === parseInt(currentItem));
    if (!variacaoInfo) return;

    const novoItem = {
      id_variacao: parseInt(currentItem),
      nome_variacao: `${variacaoInfo.cor || ''} ${variacaoInfo.tamanho || ''} (SKU: ${variacaoInfo.sku || 'N/A'})`,
      quantidade: currentQtd,
      // Corrigido para 'custo_unitario' (como no seu Insomnia)
      custo_unitario: currentCusto 
    };
    setItensDaCompra([...itensDaCompra, novoItem]);
    setCurrentQtd(1);
    setCurrentCusto(variacaoInfo.custo || 0);
  }

  function handleRemoveItem(index) {
    setItensDaCompra(itensDaCompra.filter((_, i) => i !== index));
  }

  // 8. (Bônus) Calcula o total da compra
  const totalCompra = useMemo(() => {
    return itensDaCompra.reduce((total, item) => {
      // Corrigido para 'custo_unitario'
      return total + (item.custo_unitario * item.quantidade);
    }, 0);
  }, [itensDaCompra]);

  // 9. NOVO: Função para CALCULAR AS PARCELAS
  function handleCalcularParcelas() {
    if (totalCompra <= 0) {
      alert("Adicione itens à compra antes de calcular as parcelas.");
      return;
    }
    
    const condicaoInfo = condicoes.find(c => c.id_condicao === parseInt(selectedCondicao));
    if (!condicaoInfo) {
      alert("Condição de pagamento não encontrada.");
      return;
    }

    const { parcelas: numParcelas, intervalo_dias_parc: intervalo } = condicaoInfo;
    const valorParcela = parseFloat((totalCompra / numParcelas).toFixed(2));
    
    let novasParcelas = [];
    let dataVencimento = new Date(); // Começa hoje
    
    // Lógica simples de vencimento (pode ser ajustada)
    // Assumindo que o intervalo é a partir de hoje
    
    for (let i = 0; i < numParcelas; i++) {
      // A primeira parcela vence (hoje + intervalo), a segunda (hoje + 2*intervalo), etc.
      let diasVencimento = (i + 1) * intervalo;
      
      novasParcelas.push({
        data_vencimento: addDays(dataVencimento, diasVencimento),
        valor_parcela: (i === numParcelas - 1) 
          ? totalCompra - (valorParcela * (numParcelas - 1)) // Ajuste de centavos na última
          : valorParcela
      });
    }
    setParcelas(novasParcelas);
  }

  // 10. Função para FINALIZAR A COMPRA (Payload Corrigido)
  async function handleSalvarCompra(event) {
    event.preventDefault();

    if (itensDaCompra.length === 0 || parcelas.length === 0) {
      setMensagem("Erro: Adicione itens e calcule as parcelas antes de salvar.");
      return;
    }

    // Payload (JSON) 100% baseado no seu Insomnia
    const payload = {
      id_fornecedor: parseInt(selectedFornecedor),
      nota_fiscal: notaFiscal || null, // <-- NOVO CAMPO
      
      // Itens (com 'custo_unitario' corrigido)
      itens: itensDaCompra.map(item => ({
        id_variacao: item.id_variacao,
        quantidade: item.quantidade,
        custo_unitario: item.custo_unitario // <-- NOME CORRIGIDO
      })),

      // Parcelas (como o backend espera)
      parcelas: parcelas.map(p => ({
        data_vencimento: p.data_vencimento,
        valor_parcela: p.valor_parcela
      }))
    };

    try {
      // POST /compras
      const response = await api.post('/compras', payload);
      setMensagem(`Compra ID ${response.data.id_compra} registrada com sucesso!`);
      
      // Limpa tudo
      setItensDaCompra([]);
      setParcelas([]);
      setNotaFiscal('');

    } catch (error) {
      if (error.response && error.response.data && error.response.data.detail) {
        setMensagem(`Erro: ${error.response.data.detail}`);
      } else {
        setMensagem("Erro ao registrar a compra.");
        console.error("Erro na compra:", error);
      }
    }
  }


  // 11. O JSX (HTML)
  return (
    <div>
      {/* O formulário principal engloba TUDO */}
      <form onSubmit={handleSalvarCompra}>
        <h1>Nova Compra</h1>

        {/* --- Cabeçalho da Compra (com NF) --- */}
        <h2>Dados da Compra</h2>
        <div style={{ display: 'flex', gap: '20px' }}>
          <div>
            <label>Fornecedor: </label>
            <select value={selectedFornecedor} onChange={(e) => setSelectedFornecedor(e.target.value)} required>
              {fornecedores.map(f => <option key={f.id_fornecedor} value={f.id_fornecedor}>{f.razao_social}</option>)}
            </select>
          </div>
          <div>
            <label>Nota Fiscal (Opcional): </label>
            <input type="text" value={notaFiscal} onChange={(e) => setNotaFiscal(e.target.value)} />
          </div>
        </div>

        <hr style={{ margin: '20px 0' }} />

        {/* --- Adicionar Itens --- */}
        <h2>Adicionar Item</h2>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
          <div>
            <label>Variação (SKU):</label><br />
            <select value={currentItem} onChange={(e) => {
              const variacao = variacoes.find(v => v.id_variacao === parseInt(e.target.value));
              setCurrentItem(e.target.value);
              if (variacao) setCurrentCusto(variacao.custo || 0);
            }}>
              {variacoes.map(v => <option key={v.id_variacao} value={v.id_variacao}>{v.cor || ''} {v.tamanho || ''} (SKU: {v.sku || 'N/A'})</option>)}
            </select>
          </div>
          <div>
            <label>Quantidade:</label><br />
            <input type="number" min="1" value={currentQtd} onChange={(e) => setCurrentQtd(parseInt(e.target.value) || 1)} />
          </div>
          <div>
            <label>Custo Unitário (R$):</label><br />
            <input type="number" step="0.01" min="0" value={currentCusto} onChange={(e) => setCurrentCusto(parseFloat(e.target.value) || 0)} />
          </div>
          <button type="button" onClick={handleAddItem}>Adicionar</button>
        </div>

        {/* --- Carrinho / Itens da Compra --- */}
        <h2 style={{ marginTop: '20px' }}>Itens da Compra</h2>
        <table border="1" cellPadding="5" cellSpacing="0" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>SKU/Variação</th> <th>Qtd.</th> <th>Custo Unit.</th> <th>Subtotal</th> <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {itensDaCompra.map((item, index) => (
              <tr key={index}>
                <td>{item.nome_variacao}</td>
                <td>{item.quantidade}</td>
                <td>R$ {item.custo_unitario.toFixed(2)}</td>
                <td>R$ {(item.quantidade * item.custo_unitario).toFixed(2)}</td>
                <td><button type="button" onClick={() => handleRemoveItem(index)}>Remover</button></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="3" style={{ textAlign: 'right' }}><strong>Total:</strong></td>
              <td colSpan="2"><strong>R$ {totalCompra.toFixed(2)}</strong></td>
            </tr>
          </tfoot>
        </table>

        <hr style={{ margin: '20px 0' }} />

        {/* --- NOVA SEÇÃO: Parcelamento --- */}
        <h2>Parcelamento</h2>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px' }}>
           <div>
            <label>Condição de Pagamento (para cálculo): </label>
            <select value={selectedCondicao} onChange={(e) => setSelectedCondicao(e.target.value)} required>
              {condicoes.map(c => <option key={c.id_condicao} value={c.id_condicao}>{c.descricao} ({c.parcelas}x)</option>)}
            </select>
          </div>
          <button type="button" onClick={handleCalcularParcelas}>Calcular Parcelas (Total: R$ {totalCompra.toFixed(2)})</button>
        </div>

        {/* --- Lista de Parcelas Geradas --- */}
        <h3 style={{ marginTop: '20px' }}>Parcelas a Gerar</h3>
        <table border="1" cellPadding="5" cellSpacing="0" style={{ width: '100%' }}>
          <thead>
            <tr> <th>Parcela</th> <th>Data Vencimento</th> <th>Valor (R$)</th> </tr>
          </thead>
          <tbody>
            {parcelas.map((p, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{p.data_vencimento}</td>
                <td>R$ {p.valor_parcela.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* --- Finalizar --- */}
        <button typeS="submit" style={{ marginTop: '20px', padding: '10px', fontSize: '1.2em' }}>
          Finalizar Compra
        </button>
        
        {mensagem && <p style={{ color: 'green', fontWeight: 'bold' }}>{mensagem}</p>}
      </form>
    </div>
  );
}

export default NovaCompra;