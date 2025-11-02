import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';

function Estoque() {
  
  // 1. Estados
  const [variacoes, setVariacoes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [mensagem, setMensagem] = useState('');

  // 2. Funções de busca
  async function buscarVariacoesEmEstoque() {
    setMensagem("Carregando estoque...");
    try {
      // Busca todas as variações ATIVAS
      const response = await api.get('/variacoes?status=Ativo'); //
      setVariacoes(response.data);
      setMensagem('');
    } catch (error) {
      console.error("Erro ao buscar variações:", error);
      setMensagem("Erro ao carregar estoque.");
    }
  }

  async function buscarProdutos() {
    try {
      // Busca TODOS os produtos (ativos e inativos) para o "mapa"
      const response = await api.get('/produtos?status=todos'); //
      setProdutos(response.data);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    }
  }

  // 3. useEffect (busca os DOIS conjuntos de dados)
  useEffect(() => {
    buscarVariacoesEmEstoque();
    buscarProdutos();
  }, []); 

  // 4. "Tradutor" de ID de Produto para Nome
  const produtoMap = useMemo(() => {
    return produtos.reduce((map, produto) => {
      map[produto.id_produto] = produto.nome_produto;
      return map;
    }, {});
  }, [produtos]); // Recalcula só quando a lista de produtos mudar

  // 5. O FILTRO MÁGICO!
  // 'useMemo' cria uma nova lista (filtrada) e só a recalcula
  // se a lista original de 'variacoes' mudar.
  const variacoesEmEstoque = useMemo(() => {
    return variacoes.filter(v => v.estoque_atual > 0);
  }, [variacoes]);


  // 6. O JSX (HTML)
  return (
    <div>
      <h1>Consulta de Estoque</h1>
      <p>Exibindo apenas itens com estoque maior que zero.</p>

      {mensagem && <p>{mensagem}</p>}

      <hr style={{ margin: '20px 0' }} />

      <table border="1" cellPadding="5" cellSpacing="0" style={{ width: '100%' }}>
        <thead>
          <tr>
            <th>Produto (Pai)</th>
            <th>Variação (Cor/Tamanho)</th>
            <th>SKU</th>
            <th>Fornecedor (ID)</th>
            <th>Preço Venda (R$)</th>
            <th>Estoque Atual</th>
          </tr>
        </thead>
        <tbody>
          {/* 7. Fazemos o .map() na lista JÁ FILTRADA */}
          {variacoesEmEstoque.length === 0 && (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center' }}>Nenhum item em estoque encontrado.</td>
            </tr>
          )}

          {variacoesEmEstoque.map(v => (
            <tr key={v.id_variacao}>
              <td>
                {/* Usa o "mapa" para mostrar o nome do produto */}
                {produtoMap[v.id_produto] || `ID ${v.id_produto}`}
              </td>
              <td>{v.cor || ''} {v.tamanho || ''}</td>
              <td>{v.sku}</td>
              <td>{v.id_fornecedor}</td>
              <td>R$ {v.preco_venda.toFixed(2)}</td>
              <td style={{ fontWeight: 'bold', backgroundColor: '#dfffe0' }}>
                {v.estoque_atual}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Estoque;