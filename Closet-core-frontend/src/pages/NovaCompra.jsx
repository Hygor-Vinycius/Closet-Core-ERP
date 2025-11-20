import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';

// --- Helper para calcular datas de vencimento ---
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toISOString().split('T')[0];
}

function NovaCompra() {
  
  // 1. Estados para os DADOS (Dropdowns)
  const [fornecedores, setFornecedores] = useState([]);
  const [produtos, setProdutos] = useState([]); // <-- NOVO: Lista de Produtos Pai
  const [condicoes, setCondicoes] = useState([]);
  const [variacoes, setVariacoes] = useState([]); // Todas as variações (cache)
  const [mensagem, setMensagem] = useState('');

  // 2. Estados do CABEÇALHO da Compra
  const [selectedFornecedor, setSelectedFornecedor] = useState(''); // Inicia vazio
  const [selectedCondicao, setSelectedCondicao] = useState('');
  const [notaFiscal, setNotaFiscal] = useState('');

  // 3. Estados para o formulário de ADICIONAR ITEM
  const [selectedProduto, setSelectedProduto] = useState(''); // <-- NOVO: Filtro Pai
  const [currentItem, setCurrentItem] = useState(''); // ID da variação
  const [currentQtd, setCurrentQtd] = useState(1);
  const [currentCusto, setCurrentCusto] = useState(0);

  // 4. Carrinhos
  const [itensDaCompra, setItensDaCompra] = useState([]);
  const [parcelas, setParcelas] = useState([]);

  // 5. useEffect: Carrega dados iniciais
  useEffect(() => {
    async function carregarDados() {
      try {
        // Busca Fornecedores
        const resForn = await api.get('/fornecedores?status=todos');
        setFornecedores(resForn.data);
        // NOTA: Não selecionamos mais o primeiro automaticamente

        // Busca Condições
        const resCond = await api.get('/condicoes-pagamento');
        setCondicoes(resCond.data);
        if (resCond.data.length > 0) setSelectedCondicao(resCond.data[0].id_condicao);

        // Busca Produtos (Pai)
        const resProd = await api.get('/produtos?status=Ativo');
        setProdutos(resProd.data);

        // Busca Variações (Todas as ativas, para filtrar depois)
        const resVar = await api.get('/variacoes?status=Ativo');
        setVariacoes(resVar.data);

      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setMensagem("Erro ao carregar dados iniciais.");
      }
    }
    carregarDados();
  }, []); 

  // --- Lógica de Filtro de Variações ---
  const variacoesFiltradas = useMemo(() => {
    if (!selectedProduto) return [];
    return variacoes.filter(v => v.id_produto === parseInt(selectedProduto));
  }, [variacoes, selectedProduto]);

  // --- Funções do Carrinho de Itens ---
  function handleAddItem() {
    if (!currentItem || currentQtd <= 0 || currentCusto < 0) {
      alert("Preencha os dados do item corretamente.");
      return;
    }

    const variacaoInfo = variacoes.find(v => v.id_variacao === parseInt(currentItem));
    const produtoInfo = produtos.find(p => p.id_produto === parseInt(selectedProduto));
    
    if (!variacaoInfo) return;

    const novoItem = {
      id_variacao: parseInt(currentItem),
      // Monta um nome bonito: "Camisa Polo - Azul P (SKU: ...)"
      nome_variacao: `${produtoInfo?.nome_produto || ''} - ${variacaoInfo.cor || ''} ${variacaoInfo.tamanho || ''} (SKU: ${variacaoInfo.sku || 'N/A'})`,
      quantidade: currentQtd,
      custo_unitario: currentCusto 
    };
    setItensDaCompra([...itensDaCompra, novoItem]);
    
    // Limpa campos do item (mantém o produto selecionado para facilitar)
    setCurrentQtd(1);
    // setCurrentItem(''); // Opcional: limpar ou manter a variação
  }

  function handleRemoveItem(index) {
    setItensDaCompra(itensDaVenda => itensDaVenda.filter((_, i) => i !== index));
  }

  const totalCompra = useMemo(() => {
    return itensDaCompra.reduce((total, item) => total + (item.custo_unitario * item.quantidade), 0);
  }, [itensDaCompra]);

  // --- Funções de Parcelamento ---
  function handleCalcularParcelas() {
    if (totalCompra <= 0) {
      alert("Adicione itens antes de calcular.");
      return;
    }
    
    const condicaoInfo = condicoes.find(c => c.id_condicao === parseInt(selectedCondicao));
    if (!condicaoInfo) return;

    const { parcelas: numParcelas, intervalo_dias_parc: intervalo } = condicaoInfo;
    
    // Arredondamento simples para 2 casas
    const valorParcelaBase = Math.floor((totalCompra / numParcelas) * 100) / 100;
    const diferenca = totalCompra - (valorParcelaBase * numParcelas); // Centavos que sobram

    let novasParcelas = [];
    let dataBase = new Date();
    
    for (let i = 0; i < numParcelas; i++) {
      let diasVencimento = (i + 1) * intervalo;
      
      // Adiciona os centavos de diferença na primeira parcela (padrão contábil comum)
      let valor = valorParcelaBase;
      if (i === 0) valor += diferenca;

      novasParcelas.push({
        data_vencimento: addDays(dataBase, diasVencimento),
        valor_parcela: parseFloat(valor.toFixed(2))
      });
    }
    setParcelas(novasParcelas);
  }

  // --- NOVA FUNÇÃO: Editar Parcela Manualmente ---
  function handleEditParcela(index, campo, valor) {
    const novasParcelas = [...parcelas];
    if (campo === 'valor_parcela') {
      novasParcelas[index][campo] = parseFloat(valor) || 0;
    } else {
      novasParcelas[index][campo] = valor;
    }
    setParcelas(novasParcelas);
  }

  // Calcula o total das parcelas para validar se bate com o total da compra
  const totalParcelas = useMemo(() => {
    return parcelas.reduce((acc, p) => acc + p.valor_parcela, 0);
  }, [parcelas]);

  // --- Finalizar Compra ---
  async function handleSalvarCompra(event) {
    event.preventDefault();

    if (!selectedFornecedor) {
      alert("Selecione um fornecedor.");
      return;
    }
    if (itensDaCompra.length === 0) {
      alert("Adicione itens à compra.");
      return;
    }
    if (parcelas.length === 0) {
      alert("Calcule as parcelas antes de finalizar.");
      return;
    }
    // Validação de segurança financeira
    if (Math.abs(totalParcelas - totalCompra) > 0.05) { // Margem de 5 centavos
       if(!window.confirm(`O total das parcelas (R$ ${totalParcelas.toFixed(2)}) está diferente do total da compra (R$ ${totalCompra.toFixed(2)}). Deseja continuar mesmo assim?`)) {
         return;
       }
    }

    const payload = {
      id_fornecedor: parseInt(selectedFornecedor),
      nota_fiscal: notaFiscal || null,
      itens: itensDaCompra.map(item => ({
        id_variacao: item.id_variacao,
        quantidade: item.quantidade,
        custo_unitario: item.custo_unitario
      })),
      parcelas: parcelas.map(p => ({
        data_vencimento: p.data_vencimento,
        valor_parcela: p.valor_parcela
      }))
    };

    try {
      const response = await api.post('/compras', payload);
      setMensagem(`Compra ID ${response.data.id_compra} registrada com sucesso!`);
      
      // Limpa Tela
      setItensDaCompra([]);
      setParcelas([]);
      setNotaFiscal('');
      setSelectedFornecedor(''); 

    } catch (error) {
      if (error.response && error.response.data && error.response.data.detail) {
        setMensagem(`Erro: ${error.response.data.detail}`);
      } else {
        setMensagem("Erro ao registrar a compra.");
        console.error("Erro na compra:", error);
      }
    }
  }

  return (
    <div>
      <form onSubmit={handleSalvarCompra}>
        <h1>Nova Compra</h1>

        {/* --- Cabeçalho --- */}
        <h2>Dados da Compra</h2>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ minWidth: '200px' }}>
            <label>Fornecedor: </label>
            <select 
              value={selectedFornecedor} 
              onChange={(e) => setSelectedFornecedor(e.target.value)} 
              required
              style={{ width: '100%', padding: '5px' }}
            >
              <option value="">Selecione um fornecedor...</option>
              {fornecedores.map(f => <option key={f.id_fornecedor} value={f.id_fornecedor}>{f.razao_social}</option>)}
            </select>
          </div>
          <div style={{ minWidth: '150px' }}>
            <label>Nota Fiscal: </label>
            <input 
              type="text" 
              value={notaFiscal} 
              onChange={(e) => setNotaFiscal(e.target.value)} 
              style={{ width: '100%', padding: '5px' }}
            />
          </div>
          <div style={{ minWidth: '200px' }}>
            <label>Condição Pgto: </label>
            <select 
              value={selectedCondicao} 
              onChange={(e) => setSelectedCondicao(e.target.value)} 
              required
              style={{ width: '100%', padding: '5px' }}
            >
              {condicoes.map(c => <option key={c.id_condicao} value={c.id_condicao}>{c.descricao} ({c.parcelas}x)</option>)}
            </select>
          </div>
        </div>

        <hr style={{ margin: '20px 0' }} />

        {/* --- Adicionar Itens (Lógica Nova) --- */}
        <h2>Adicionar Item</h2>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', flexWrap: 'wrap' }}>
          
          {/* 1. Seleção do Produto Pai */}
          <div style={{ minWidth: '200px' }}>
            <label>Produto:</label><br />
            <select 
              value={selectedProduto} 
              onChange={(e) => {
                setSelectedProduto(e.target.value);
                setCurrentItem(''); // Reseta a variação ao mudar o produto
              }}
              style={{ width: '100%', padding: '5px' }}
            >
              <option value="">Selecione o Produto...</option>
              {produtos.map(p => (
                <option key={p.id_produto} value={p.id_produto}>{p.nome_produto}</option>
              ))}
            </select>
          </div>

          {/* 2. Seleção da Variação (Filtrada) */}
          <div style={{ minWidth: '250px' }}>
            <label>Variação (Cor/Tam):</label><br />
            <select 
              value={currentItem} 
              onChange={(e) => {
                const variacao = variacoes.find(v => v.id_variacao === parseInt(e.target.value));
                setCurrentItem(e.target.value);
                if (variacao) setCurrentCusto(variacao.custo || 0);
              }}
              disabled={!selectedProduto} // Desabilita se não tiver produto selecionado
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
            <label>Qtd:</label><br />
            <input 
              type="number" min="1"
              value={currentQtd}
              onChange={(e) => setCurrentQtd(parseInt(e.target.value) || 1)}
              style={{ width: '60px', padding: '5px' }}
            />
          </div>
          <div>
            <label>Custo (R$):</label><br />
            <input 
              type="number" step="0.01" min="0"
              value={currentCusto}
              onChange={(e) => setCurrentCusto(parseFloat(e.target.value) || 0)}
              style={{ width: '80px', padding: '5px' }}
            />
          </div>
          <button type="button" onClick={handleAddItem} style={{ padding: '6px 15px' }}>Adicionar</button>
        </div>

        {/* --- Tabela de Itens --- */}
        {itensDaCompra.length > 0 && (
          <table border="1" cellPadding="5" cellSpacing="0" style={{ width: '100%', marginTop: '10px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th>Produto / Variação</th> <th>Qtd.</th> <th>Custo Unit.</th> <th>Subtotal</th> <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {itensDaCompra.map((item, index) => (
                <tr key={index}>
                  <td>{item.nome_variacao}</td>
                  <td>{item.quantidade}</td>
                  <td>R$ {item.custo_unitario.toFixed(2)}</td>
                  <td>R$ {(item.quantidade * item.custo_unitario).toFixed(2)}</td>
                  <td><button type="button" onClick={() => handleRemoveItem(index)}>X</button></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3" style={{ textAlign: 'right' }}><strong>Total Compra:</strong></td>
                <td colSpan="2"><strong>R$ {totalCompra.toFixed(2)}</strong></td>
              </tr>
            </tfoot>
          </table>
        )}

        <hr style={{ margin: '20px 0' }} />

        {/* --- Parcelamento (Com Edição) --- */}
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
                <th>Parcela</th> 
                <th>Data Vencimento</th> 
                <th>Valor (R$)</th> 
              </tr>
            </thead>
            <tbody>
              {parcelas.map((p, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>
                    {/* Input para editar DATA */}
                    <input 
                      type="date" 
                      value={p.data_vencimento} 
                      onChange={(e) => handleEditParcela(index, 'data_vencimento', e.target.value)}
                    />
                  </td>
                  <td>
                    {/* Input para editar VALOR */}
                    <input 
                      type="number" 
                      step="0.01"
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
                <td style={{ 
                  color: Math.abs(totalParcelas - totalCompra) > 0.05 ? 'red' : 'black',
                  fontWeight: 'bold'
                }}>
                  R$ {totalParcelas.toFixed(2)}
                  {Math.abs(totalParcelas - totalCompra) > 0.05 && " (Diferença!)"}
                </td>
              </tr>
            </tfoot>
          </table>
        )}

        <button type="submit" style={{ marginTop: '30px', padding: '15px', fontSize: '1.2em', width: '100%' }}>
          Finalizar Compra
        </button>
        
        {mensagem && <p style={{ color: 'blue', fontWeight: 'bold', marginTop: '10px' }}>{mensagem}</p>}
      </form>
    </div>
  );
}

export default NovaCompra;