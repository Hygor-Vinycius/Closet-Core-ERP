import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';

// --- Helper para datas ---
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toISOString().split('T')[0];
}

function NovaVenda() {
  
  // 1. Estados de Dados (Listas)
  const [clientes, setClientes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [produtos, setProdutos] = useState([]); // <-- NOVO: Lista de Produtos Pai
  const [variacoes, setVariacoes] = useState([]); // Todas as variações (cache)
  const [condicoes, setCondicoes] = useState([]); // <-- NOVO: Condições de Pagamento
  const [mensagem, setMensagem] = useState('');

  // Estados de Carregamento
  const [isLoading, setIsLoading] = useState(true);

  // 2. Estados do CABEÇALHO da Venda
  const [selectedCliente, setSelectedCliente] = useState(''); // Inicia vazio
  const [selectedUsuario, setSelectedUsuario] = useState(''); // Inicia vazio
  const [selectedCondicao, setSelectedCondicao] = useState('');

  // 3. Estados para o formulário de ADICIONAR ITEM
  const [selectedProduto, setSelectedProduto] = useState(''); // <-- NOVO: Filtro Pai
  const [currentItem, setCurrentItem] = useState(''); 
  const [currentQtd, setCurrentQtd] = useState(1);
  const [estoqueDisponivel, setEstoqueDisponivel] = useState(0); 
  const [precoVenda, setPrecoVenda] = useState(0);

  // 4. Carrinhos
  const [itensDaVenda, setItensDaVenda] = useState([]);
  const [parcelas, setParcelas] = useState([]); // <-- NOVO: Carrinho de Parcelas

  // 5. Carregamento Inicial de Dados
  useEffect(() => {
    async function carregarDados() {
      setIsLoading(true);
      try {
        // Busca Clientes
        const resCli = await api.get('/clientes?status=Ativo');
        setClientes(resCli.data);

        // Busca Vendedores (Usuários)
        const resUsu = await api.get('/usuarios?status=Ativo');
        setUsuarios(resUsu.data);

        // Busca Produtos (Pai)
        const resProd = await api.get('/produtos?status=Ativo');
        setProdutos(resProd.data);

        // Busca Variações (Todas as ativas, para filtrar depois)
        const resVar = await api.get('/variacoes?status=Ativo');
        setVariacoes(resVar.data);

        // Busca Condições de Pagamento
        const resCond = await api.get('/condicoes-pagamento');
        setCondicoes(resCond.data);
        // Seleciona a primeira condição por padrão (opcional)
        if (resCond.data.length > 0) setSelectedCondicao(resCond.data[0].id_condicao);

      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setMensagem("Erro ao carregar dados do sistema.");
      } finally {
        setIsLoading(false);
      }
    }
    carregarDados();
  }, []); 

  // --- Lógica de Filtro de Variações (Produto -> Variação) ---
  const variacoesFiltradas = useMemo(() => {
    if (!selectedProduto) return [];
    return variacoes.filter(v => v.id_produto === parseInt(selectedProduto));
  }, [variacoes, selectedProduto]);

  // --- Funções do Carrinho de Itens ---
  function handleAddItem() {
    if (!currentItem || currentQtd <= 0) {
      alert("Quantidade inválida.");
      return;
    }
    if (currentQtd > estoqueDisponivel) {
      alert(`Estoque insuficiente! Disponível: ${estoqueDisponivel}`);
      return;
    }

    const variacaoInfo = variacoes.find(v => v.id_variacao === parseInt(currentItem));
    const produtoInfo = produtos.find(p => p.id_produto === parseInt(selectedProduto));

    if (!variacaoInfo) return;

    const novoItem = {
      id_variacao: parseInt(currentItem),
      // Nome amigável: "Camisa Polo - Azul P"
      nome_variacao: `${produtoInfo?.nome_produto || ''} - ${variacaoInfo.cor || ''} ${variacaoInfo.tamanho || ''} (SKU: ${variacaoInfo.sku || 'N/A'})`,
      quantidade: currentQtd,
      preco_venda: precoVenda
    };

    setItensDaVenda([...itensDaVenda, novoItem]);
    setCurrentQtd(1);
    // Mantém o produto selecionado para facilitar adicionar outra cor/tamanho
  }

  function handleRemoveItem(index) {
    setItensDaVenda(prev => prev.filter((_, i) => i !== index));
  }

  const totalVenda = useMemo(() => {
    return itensDaVenda.reduce((total, item) => total + (item.preco_venda * item.quantidade), 0);
  }, [itensDaVenda]);

  // --- Funções de Parcelamento (IGUAL AO NOVA COMPRA) ---
  function handleCalcularParcelas() {
    if (totalVenda <= 0) {
      alert("Adicione itens antes de calcular.");
      return;
    }
    
    const condicaoInfo = condicoes.find(c => c.id_condicao === parseInt(selectedCondicao));
    if (!condicaoInfo) return;

    const { parcelas: numParcelas, intervalo_dias_parc: intervalo } = condicaoInfo;
    
    const valorParcelaBase = Math.floor((totalVenda / numParcelas) * 100) / 100;
    const diferenca = totalVenda - (valorParcelaBase * numParcelas);

    let novasParcelas = [];
    let dataBase = new Date();
    
    for (let i = 0; i < numParcelas; i++) {
      let diasVencimento = (i + 1) * intervalo;
      let valor = valorParcelaBase;
      if (i === 0) valor += diferenca; // Ajuste de centavos na 1ª parcela

      novasParcelas.push({
        data_vencimento: addDays(dataBase, diasVencimento),
        valor_parcela: parseFloat(valor.toFixed(2))
      });
    }
    setParcelas(novasParcelas);
  }

  // --- Editar Parcela Manualmente ---
  function handleEditParcela(index, campo, valor) {
    const novasParcelas = [...parcelas];
    if (campo === 'valor_parcela') {
      novasParcelas[index][campo] = parseFloat(valor) || 0;
    } else {
      novasParcelas[index][campo] = valor;
    }
    setParcelas(novasParcelas);
  }

  const totalParcelas = useMemo(() => {
    return parcelas.reduce((acc, p) => acc + p.valor_parcela, 0);
  }, [parcelas]);

  // --- Finalizar Venda ---
  async function handleSalvarVenda(event) {
    event.preventDefault();

    if (!selectedCliente || !selectedUsuario) {
      alert("Selecione o Cliente e o Vendedor.");
      return;
    }
    if (itensDaVenda.length === 0) {
      alert("Adicione itens à venda.");
      return;
    }
    if (parcelas.length === 0) {
      alert("Calcule as parcelas antes de finalizar.");
      return;
    }
    // Validação Financeira
    if (Math.abs(totalParcelas - totalVenda) > 0.05) {
       if(!window.confirm(`Total das parcelas (R$ ${totalParcelas.toFixed(2)}) difere do total da venda (R$ ${totalVenda.toFixed(2)}). Continuar?`)) {
         return;
       }
    }

    try {
      setMensagem("Registrando venda...");

      // Payload atualizado com parcelas personalizadas
      const payload = {
        id_cliente: parseInt(selectedCliente),
        id_usuario: parseInt(selectedUsuario),
        itens: itensDaVenda.map(item => ({
          id_variacao: item.id_variacao,
          quantidade: item.quantidade
        })),
        parcelas: parcelas.map(p => ({
          data_vencimento: p.data_vencimento,
          valor_parcela: p.valor_parcela
        }))
      };

      const response = await api.post('/vendas', payload);
      
      setMensagem(`Venda ID ${response.data.id_venda} registrada com sucesso!`);
      
      // Limpa tudo
      setItensDaVenda([]);
      setParcelas([]);
      setSelectedCliente(''); // Reseta para forçar nova seleção na próxima venda
      
      // Atualiza estoque local (busca variações novamente)
      const resVar = await api.get('/variacoes?status=Ativo');
      setVariacoes(resVar.data);
      // Limpa seleção de produto
      setSelectedProduto('');
      setCurrentItem('');
      setEstoqueDisponivel(0);

    } catch (error) { 
      console.error("Erro detalhado ao salvar venda:", error); 
      if (error.response && error.response.data && error.response.data.detail) {
        setMensagem(`Erro: ${error.response.data.detail}`);
      } else {
        setMensagem("Erro desconhecido ao registrar a venda.");
      }
    }
  }

  // 11. O JSX (HTML)
  return (
    <div>
      <form onSubmit={handleSalvarVenda}>
        <h1>Nova Venda (PDV)</h1>

        {/* --- Cabeçalho --- */}
        <h2>Dados da Venda</h2>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ minWidth: '250px' }}>
            <label>Cliente: </label>
            <select 
              value={selectedCliente} 
              onChange={(e) => setSelectedCliente(e.target.value)} 
              required
              style={{ width: '100%', padding: '5px' }}
            >
              {isLoading ? <option>Carregando...</option> : <option value="">Selecione um cliente...</option>}
              {clientes.map(c => <option key={c.id_cliente} value={c.id_cliente}>{c.nome_completo}</option>)}
            </select>
          </div>
          <div style={{ minWidth: '200px' }}>
            <label>Vendedor: </label>
            <select 
              value={selectedUsuario} 
              onChange={(e) => setSelectedUsuario(e.target.value)} 
              required
              style={{ width: '100%', padding: '5px' }}
            >
              {isLoading ? <option>Carregando...</option> : <option value="">Selecione...</option>}
              {usuarios.map(u => <option key={u.id_usuario} value={u.id_usuario}>{u.nome}</option>)}
            </select>
          </div>
          <div style={{ minWidth: '200px' }}>
            <label>Condição Pgto: </label>
            <select 
              value={selectedCondicao} 
              onChange={(e) => setSelectedCondicao(e.target.value)} 
              required
              style={{ width: '100%', padding: '5px' }}
            >
              {isLoading ? <option>Carregando...</option> : <option value="">Selecione...</option>}
              {condicoes.map(c => <option key={c.id_condicao} value={c.id_condicao}>{c.descricao} ({c.parcelas}x)</option>)}
            </select>
          </div>
        </div>

        <hr style={{ margin: '20px 0' }} />

        {/* --- Adicionar Itens (Hierarquia Produto -> Variação) --- */}
        <h2>Adicionar Item</h2>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', flexWrap: 'wrap' }}>
          
          {/* 1. Produto Pai */}
          <div style={{ minWidth: '200px' }}>
            <label>Produto:</label><br />
            <select 
              value={selectedProduto} 
              onChange={(e) => {
                setSelectedProduto(e.target.value);
                setCurrentItem('');
                setEstoqueDisponivel(0);
                setPrecoVenda(0);
              }}
              style={{ width: '100%', padding: '5px' }}
            >
              <option value="">Selecione o Produto...</option>
              {produtos.map(p => <option key={p.id_produto} value={p.id_produto}>{p.nome_produto}</option>)}
            </select>
          </div>

          {/* 2. Variação (Filtrada) */}
          <div style={{ minWidth: '250px' }}>
            <label>Variação (Cor/Tam):</label><br />
            <select 
              value={currentItem} 
              onChange={(e) => {
                const variacao = variacoes.find(v => v.id_variacao === parseInt(e.target.value));
                setCurrentItem(e.target.value);
                if (variacao) {
                  setEstoqueDisponivel(variacao.estoque_atual || 0);
                  setPrecoVenda(variacao.preco_venda || 0);
                }
              }}
              disabled={!selectedProduto}
              style={{ width: '100%', padding: '5px' }}
            >
              <option value="">Selecione...</option>
              {variacoesFiltradas.map(v => (
                <option key={v.id_variacao} value={v.id_variacao}>
                  {v.cor || ''} {v.tamanho || ''} (SKU: {v.sku || 'N/A'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Qtd. (Estoque: {estoqueDisponivel})</label><br />
            <input 
              type="number" min="1"
              value={currentQtd}
              onChange={(e) => setCurrentQtd(parseInt(e.target.value) || 1)}
              style={{ width: '80px', padding: '5px' }}
            />
          </div>
          <div>
            <label>Preço Unit. (R$):</label><br />
            <input 
              type="number" step="0.01"
              value={precoVenda}
              readOnly // Preço fixo do cadastro
              style={{ width: '100px', padding: '5px', backgroundColor: '#eee' }}
            />
          </div>
          <button type="button" onClick={handleAddItem} style={{ padding: '6px 15px' }}>Adicionar</button>
        </div>

        {/* --- Tabela de Itens --- */}
        {itensDaVenda.length > 0 && (
          <table border="1" cellPadding="5" cellSpacing="0" style={{ width: '100%', marginTop: '10px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th>Produto / Variação</th> <th>Qtd.</th> <th>Preço Unit.</th> <th>Subtotal</th> <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {itensDaVenda.map((item, index) => (
                <tr key={index}>
                  <td>{item.nome_variacao}</td>
                  <td>{item.quantidade}</td>
                  <td>R$ {item.preco_venda.toFixed(2)}</td>
                  <td>R$ {(item.quantidade * item.preco_venda).toFixed(2)}</td>
                  <td><button type="button" onClick={() => handleRemoveItem(index)}>X</button></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3" style={{ textAlign: 'right' }}><strong>Total Venda:</strong></td>
                <td colSpan="2"><strong>R$ {totalVenda.toFixed(2)}</strong></td>
              </tr>
            </tfoot>
          </table>
        )}

        <hr style={{ margin: '20px 0' }} />

        {/* --- Parcelamento --- */}
        <h2>Parcelamento</h2>
        <div style={{ marginBottom: '10px' }}>
           <button type="button" onClick={handleCalcularParcelas} style={{ padding: '10px' }}>
             Gerar Parcelas
           </button>
        </div>

        {parcelas.length > 0 && (
          <table border="1" cellPadding="5" cellSpacing="0" style={{ width: '100%' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}> 
                <th>Parcela</th> <th>Data Vencimento</th> <th>Valor (R$)</th> 
              </tr>
            </thead>
            <tbody>
              {parcelas.map((p, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>
                    <input 
                      type="date" 
                      value={p.data_vencimento} 
                      onChange={(e) => handleEditParcela(index, 'data_vencimento', e.target.value)}
                    />
                  </td>
                  <td>
                    <input 
                      type="number" step="0.01"
                      value={p.valor_parcela} 
                      onChange={(e) => handleEditParcela(index, 'valor_parcela', e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="2" style={{ textAlign: 'right' }}><strong>Total Parcelas:</strong></td>
                <td style={{ color: Math.abs(totalParcelas - totalVenda) > 0.05 ? 'red' : 'black', fontWeight: 'bold' }}>
                  R$ {totalParcelas.toFixed(2)}
                  {Math.abs(totalParcelas - totalVenda) > 0.05 && " (Diferença!)"}
                </td>
              </tr>
            </tfoot>
          </table>
        )}

        <button type="submit" style={{ marginTop: '30px', padding: '15px', fontSize: '1.2em', width: '100%' }}>
          Finalizar Venda
        </button>
        
        {mensagem && <p style={{ color: 'blue', fontWeight: 'bold', marginTop: '10px' }}>{mensagem}</p>}
      </form>
    </div>
  );
}

export default NovaVenda;