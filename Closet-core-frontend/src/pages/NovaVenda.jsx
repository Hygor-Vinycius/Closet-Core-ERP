// Em: src/pages/NovaVenda.jsx

import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';

function NovaVenda() {
  
  // 1. Estados de Dados
  const [clientes, setClientes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [variacoes, setVariacoes] = useState([]);
  const [mensagem, setMensagem] = useState('');

  // --- 🚀 CORREÇÃO AQUI 🚀 ---
  // 2. Estados de Carregamento (para corrigir o bug do "Carregando...")
  const [isLoadingClientes, setIsLoadingClientes] = useState(true);
  const [isLoadingUsuarios, setIsLoadingUsuarios] = useState(true);
  const [isLoadingVariacoes, setIsLoadingVariacoes] = useState(true);

  // 3. Estados do Formulário
  const [selectedCliente, setSelectedCliente] = useState('');
  const [selectedUsuario, setSelectedUsuario] = useState('');
  const [currentItem, setCurrentItem] = useState('');
  const [currentQtd, setCurrentQtd] = useState(1);
  const [estoqueDisponivel, setEstoqueDisponivel] = useState(0); 
  const [precoVenda, setPrecoVenda] = useState(0);
  const [itensDaVenda, setItensDaVenda] = useState([]);

  // --- Funções de Busca (no escopo principal) ---

  // Buscar Variações (SKUs Ativos)
  async function buscarVariacoes() {
    setIsLoadingVariacoes(true); // <--- CORREÇÃO
    try {
      const response = await api.get('/variacoes?status=Ativo'); //
      const variacoesData = response.data || [];
      setVariacoes(variacoesData);
      return variacoesData;
    } catch (error) { 
      console.error("Erro ao buscar variações:", error);
      return [];
    } finally {
      setIsLoadingVariacoes(false); // <--- CORREÇÃO
    }
  }

  // Buscar Clientes
  async function buscarClientes() {
    setIsLoadingClientes(true); // <--- CORREÇÃO
    try {
      const response = await api.get('/clientes?status=Ativo'); //
      setClientes(response.data);
      return response.data; 
    } catch (error) { 
      console.error("Erro ao buscar clientes:", error);
      return []; 
    } finally {
      setIsLoadingClientes(false); // <--- CORREÇÃO
    }
  }

  // Buscar Usuários (Vendedores)
  async function buscarUsuarios() {
    setIsLoadingUsuarios(true); // <--- CORREÇÃO
    try {
      const response = await api.get('/usuarios?status=Ativo'); //
      setUsuarios(response.data);
      return response.data;
    } catch (error) { 
      console.error("Erro ao buscar usuários:", error);
      return [];
    } finally {
      setIsLoadingUsuarios(false); // <--- CORREÇÃO
    }
  }

  // 5. useEffect: Orquestra o carregamento inicial
  useEffect(() => {
    async function carregarPagina() {
      // Carrega todos os dados em paralelo
      const [clientesData, usuariosData, variacoesData] = await Promise.all([
        buscarClientes(),
        buscarUsuarios(),
        buscarVariacoes()
      ]);

      // Define os valores padrão DEPOIS que os dados chegarem
      if (clientesData.length > 0) {
        setSelectedCliente(clientesData[0].id_cliente);
      }
      if (usuariosData.length > 0) {
        setSelectedUsuario(usuariosData[0].id_usuario);
      }
      if (variacoesData.length > 0) {
        const primeiroItem = variacoesData[0];
        setCurrentItem(primeiroItem.id_variacao);
        setEstoqueDisponivel(primeiroItem.estoque_atual || 0);
        setPrecoVenda(primeiroItem.preco_venda || 0);
      }
    }
    
    carregarPagina();
  }, []); // Roda só uma vez

  // 6. Função de Mudança de Item
  function handleItemChange(variacaoId) {
    const variacao = variacoes.find(v => v.id_variacao === parseInt(variacaoId));
    if (variacao) {
      setCurrentItem(variacao.id_variacao);
      setEstoqueDisponivel(variacao.estoque_atual || 0);
      setPrecoVenda(variacao.preco_venda || 0);
      setCurrentQtd(1); 
    }
  }

  // 7. Adicionar Item ao Carrinho
  function handleAddItem() {
    if (!currentItem || currentQtd <= 0) {
      alert("Quantidade deve ser maior que zero.");
      return;
    }
    if (currentQtd > estoqueDisponivel) {
      alert(`Erro: Estoque insuficiente! Disponível: ${estoqueDisponivel}`);
      return;
    }
    const variacaoInfo = variacoes.find(v => v.id_variacao === parseInt(currentItem));
    if (!variacaoInfo) return;
    
    // Pega os campos corretos da variação (baseado no models.py)
    const nome = `${variacaoInfo.cor || ''} ${variacaoInfo.tamanho || ''}`.trim();
    
    const novoItem = {
      id_variacao: parseInt(currentItem),
      nome_variacao: nome || `(Variação ID: ${variacaoInfo.id_variacao})`,
      quantidade: currentQtd,
      preco_venda: precoVenda
    };
    setItensDaVenda([...itensDaVenda, novoItem]);
    setCurrentQtd(1);
  }

  // 8. Remover Item
  function handleRemoveItem(index) {
    setItensDaVenda(itensDaVenda.filter((_, i) => i !== index));
  }

  // 9. Calcular Total
  const totalVenda = useMemo(() => {
    return itensDaVenda.reduce((total, item) => {
      return total + (item.preco_venda * item.quantidade);
    }, 0);
  }, [itensDaVenda]);

  // 10. Finalizar Venda (JSON alinhado com o que você enviou)
  async function handleSalvarVenda(event) {
    event.preventDefault();

    try {
      setMensagem("Registrando venda...");

      if (itensDaVenda.length === 0) {
        throw new Error("Adicione pelo menos um item à venda.");
      }

      // Payload 100% alinhado com seu JSON de exemplo
      const payload = {
        id_cliente: parseInt(selectedCliente),
        id_usuario: parseInt(selectedUsuario),
        itens: itensDaVenda.map(item => ({
          id_variacao: item.id_variacao,
          quantidade: item.quantidade
        }))
      };

      const response = await api.post('/vendas', payload); //
      
      setMensagem(`Venda ID ${response.data.id_venda} registrada com sucesso!`);
      setItensDaVenda([]);
      
      // Re-busca as variações para atualizar o estoque na tela
      buscarVariacoes(); 

    } catch (error) { 
      console.error("Erro detalhado ao salvar venda:", error); 
      if (error.response && error.response.data && error.response.data.detail) {
        setMensagem(`Erro do Servidor: ${error.response.data.detail}`);
      } 
      else if (error.message) {
        setMensagem(`Erro no App: ${error.message}`);
      } 
      else {
        setMensagem("Ocorreu um erro desconhecido ao registrar a venda.");
      }
    }
  }

  // 11. O JSX (HTML)
  return (
    <div>
      <form onSubmit={handleSalvarVenda}>
        <h1>Nova Venda (PDV)</h1>

        {/* --- Cabeçalho da Venda --- */}
        <h2>Dados da Venda</h2>
        <div style={{ display: 'flex', gap: '20px' }}>
          <div>
            <label>Cliente: </label>
            <select value={selectedCliente} onChange={(e) => setSelectedCliente(e.target.value)} required>
              {/* --- LÓGICA DE CARREGAMENTO CORRIGIDA --- */}
              {isLoadingClientes ? (
                <option>Carregando...</option>
              ) : clientes.length === 0 ? (
                <option value="">Nenhum cliente ativo</option>
              ) : (
                clientes.map(c => <option key={c.id_cliente} value={c.id_cliente}>{c.nome_completo}</option>)
              )}
            </select>
          </div>
          <div>
            <label>Vendedor (Usuário): </label>
            <select value={selectedUsuario} onChange={(e) => setSelectedUsuario(e.target.value)} required>
              {/* --- LÓGICA DE CARREGAMENTO CORRIGIDA --- */}
              {isLoadingUsuarios ? (
                <option>Carregando...</option>
              ) : usuarios.length === 0 ? (
                <option value="">Nenhum usuário ativo</option>
              ) : (
                usuarios.map(u => <option key={u.id_usuario} value={u.id_usuario}>{u.nome}</option>)
              )}
            </select>
          </div>
        </div>

        <hr style={{ margin: '20px 0' }} />

        {/* --- Adicionar Itens --- */}
        <h2>Adicionar Item</h2>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
          <div>
            <label>Variação (SKU):</label><br />
            <select value={currentItem} onChange={(e) => handleItemChange(e.target.value)}>
              {/* --- LÓGICA DE CARREGAMENTO CORRIGIDA --- */}
              {isLoadingVariacoes ? (
                <option>Carregando...</option>
              ) : variacoes.length === 0 ? (
                <option value="">Nenhuma variação ativa</option>
              ) : (
                variacoes.map(v => (
                  <option key={v.id_variacao} value={v.id_variacao}>
                    {/* (Usei os campos do seu models.py) */}
                    {v.cor || ''} {v.tamanho || ''} (SKU: {v.sku || 'N/A'})
                  </option>
                ))
              )}
            </select>
          </div>
          <div>
            <label>Qtd. (Estoque: {estoqueDisponivel})</label><br />
            <input 
              type="number" min="1"
              value={currentQtd}
              onChange={(e) => setCurrentQtd(parseInt(e.target.value) || 1)}
            />
          </div>
          <div>
            <label>Preço Venda (R$):</label><br />
            <input 
              type="number" step="0.01"
              value={precoVenda}
              readOnly 
              style={{ backgroundColor: '#eee' }}
            />
          </div>
          <button type="button" onClick={handleAddItem}>Adicionar</button>
        </div>

        <hr style={{ margin: '20px 0' }} />

        {/* --- Carrinho / Itens da Venda --- */}
        <h2>Itens da Venda</h2>
        <table border="1" cellPadding="5" cellSpacing="0" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>SKU/Variação</th>
              <th>Qtd.</th>
              <th>Preço Unit.</th>
              <th>Subtotal</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {itensDaVenda.map((item, index) => (
              <tr key={index}>
                <td>{item.nome_variacao}</td>
                <td>{item.quantidade}</td>
                <td>R$ {item.preco_venda.toFixed(2)}</td>
                <td>R$ {(item.quantidade * item.preco_venda).toFixed(2)}</td>
                <td><button type="button" onClick={() => handleRemoveItem(index)}>Remover</button></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="3" style={{ textAlign: 'right' }}><strong>Total:</strong></td>
              <td colSpan="2"><strong>R$ {totalVenda.toFixed(2)}</strong></td>
            </tr>
          </tfoot>
        </table>

        {/* --- Finalizar --- */}
        <button type="submit" style={{ marginTop: '20px', padding: '10px', fontSize: '1.2em' }}>
          Finalizar Venda
        </button>
        
        {mensagem && <p style={{ fontWeight: 'bold' }}>{mensagem}</p>}
      </form>
    </div>
  );
}

export default NovaVenda;