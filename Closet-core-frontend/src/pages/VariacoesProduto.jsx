import { useState, useEffect } from 'react';
import api from '../services/api';

function VariacoesProduto() {
  
  // 1. Estados
  const [variacoes, setVariacoes] = useState([]);
  const [produtos, setProdutos] = useState([]); // Para o dropdown de produtos
  const [fornecedores, setFornecedores] = useState([]); // Novo: para o dropdown de fornecedores
  const [mensagem, setMensagem] = useState('');

  // Estados do formulário (baseado no seu JSON)
  const [selectedProduto, setSelectedProduto] = useState('');
  const [selectedFornecedor, setSelectedFornecedor] = useState('');
  const [tamanho, setTamanho] = useState('');
  const [cor, setCor] = useState('');
  const [ean, setEan] = useState('');
  const [sku, setSku] = useState('');
  const [custo, setCusto] = useState(0); // Corrigido de 'precoCusto'
  const [precoVenda, setPrecoVenda] = useState(0);

  // 2. Funções de busca
  async function buscarVariacoes() {
    try {
      const response = await api.get('/variacoes'); //
      setVariacoes(response.data);
    } catch (error) {
      console.error("Erro ao buscar variações:", error);
    }
  }

  async function buscarProdutos() {
    try {
      const response = await api.get('/produtos'); //
      setProdutos(response.data);
      if (response.data.length > 0) {
        setSelectedProduto(response.data[0].id_produto);
      }
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    }
  }

  // Nova função para buscar fornecedores
  async function buscarFornecedores() {
    try {
      const response = await api.get('/fornecedores'); //
      setFornecedores(response.data);
      if (response.data.length > 0) {
        setSelectedFornecedor(response.data[0].id_fornecedor);
      }
    } catch (error) {
      console.error("Erro ao buscar fornecedores:", error);
    }
  }

  // 3. useEffect (agora busca 3 fontes de dados)
  useEffect(() => {
    buscarVariacoes();
    buscarProdutos();
    buscarFornecedores(); // Adicionado
  }, []); 

  // 4. Função de cadastrar
  async function handleCadastrar(event) {
    event.preventDefault(); 
    
    // Monta o payload (JSON) 100% baseado no que você enviou
    const dadosVariacao = {
      id_produto: parseInt(selectedProduto),
      id_fornecedor: parseInt(selectedFornecedor),
      tamanho: tamanho || null,
      cor: cor || null,
      ean: ean || null,
      sku: sku || null,
      custo: custo, // Corrigido
      preco_venda: precoVenda
    };
    
    try {
      // POST /variacoes
      const response = await api.post('/variacoes', dadosVariacao);
      
      setMensagem(`Variação cadastrada com sucesso! (SKU: ${response.data.sku})`); 

      limparFormulario();
      buscarVariacoes(); // Atualiza a lista

    } catch (error) {
      if (error.response && error.response.data && error.response.data.detail) {
        setMensagem(`Erro: ${error.response.data.detail}`);
      } else {
        setMensagem("Erro ao cadastrar variação.");
        console.error("Erro no cadastro:", error);
      }
    }
  }

  function limparFormulario() {
    // Não limpa produto/fornecedor
    setTamanho('');
    setCor('');
    setEan('');
    setSku('');
    setCusto(0);
    setPrecoVenda(0);
  }

  // 5. O JSX (HTML)
  return (
    <div>
      <h1>Gerenciamento de Variações (SKUs)</h1>

      {/* --- Formulário de Cadastro --- */}
      <form onSubmit={handleCadastrar}>
        <h2>Nova Variação de Produto</h2>
        
        {/* --- Seletores de ID --- */}
        <div style={{ display: 'flex', gap: '20px' }}>
          <div>
            <label>Produto (Pai): </label>
            <select 
              value={selectedProduto} 
              onChange={(e) => setSelectedProduto(e.target.value)}
              required
            >
              {produtos.map(prod => (
                <option key={prod.id_produto} value={prod.id_produto}>
                  {prod.nome_produto}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Fornecedor Padrão: </label>
            <select 
              value={selectedFornecedor} 
              onChange={(e) => setSelectedFornecedor(e.target.value)}
              required
            >
              {fornecedores.map(f => (
                <option key={f.id_fornecedor} value={f.id_fornecedor}>
                  {f.razao_social}
                </option>
              ))}
            </select>
          </div>
        </div>

        <hr style={{ margin: '20px 0' }} />

        {/* --- Descritores --- */}
        <div style={{ display: 'flex', gap: '20px' }}>
          <div>
            <label>Tamanho: </label>
            <input 
              type="text"
              value={tamanho}
              onChange={(e) => setTamanho(e.target.value)}
            />
          </div>
          <div>
            <label>Cor: </label>
            <input 
              type="text"
              value={cor}
              onChange={(e) => setCor(e.target.value)}
            />
          </div>
        </div>

        {/* --- Códigos --- */}
        <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
          <div>
            <label>SKU (Código Interno): </label>
            <input 
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
            />
          </div>
          <div>
            <label>EAN (Código de Barras): </label>
            <input 
              type="text"
              value={ean}
              onChange={(e) => setEan(e.target.value)}
            />
          </div>
        </div>
        
        <hr style={{ margin: '20px 0' }} />

        {/* --- Preços --- */}
        <div style={{ display: 'flex', gap: '20px' }}>
          <div>
            <label>Custo (R$): </label>
            <input 
              type="number" step="0.01"
              value={custo} // Corrigido
              onChange={(e) => setCusto(parseFloat(e.target.value) || 0)} // Corrigido
              required
            />
          </div>
          <div>
            <label>Preço de Venda (R$): </label>
            <input 
              type="number" step="0.01"
              value={precoVenda}
              onChange={(e) => setPrecoVenda(parseFloat(e.target.value) || 0)}
              required
            />
          </div>
        </div>

        <button type="submit" style={{ marginTop: '20px' }}>Salvar Variação</button>
      </form>

      {mensagem && <p>{mensagem}</p>}

      <hr style={{ margin: '20px 0' }} />

      {/* --- Lista de Variações --- */}
      <h2>Variações Cadastradas (SKUs)</h2>
      <table border="1" cellPadding="5" cellSpacing="0">
        <thead>
          <tr>
            <th>ID</th>
            <th>Produto (ID)</th>
            <th>Fornecedor (ID)</th>
            <th>Tamanho</th>
            <th>Cor</th>
            <th>SKU</th>
            <th>Custo (R$)</th> {/* Corrigido */}
            <th>Venda (R$)</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {variacoes.map(v => (
            <tr key={v.id_variacao}>
              <td>{v.id_variacao}</td>
              <td>{v.id_produto}</td>
              <td>{v.id_fornecedor}</td>
              <td>{v.tamanho}</td>
              <td>{v.cor}</td>
              <td>{v.sku}</td>
              <td>{v.custo}</td> {/* Corrigido de preco_custo */}
              <td>{v.preco_venda}</td>
              <td>{v.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default VariacoesProduto;