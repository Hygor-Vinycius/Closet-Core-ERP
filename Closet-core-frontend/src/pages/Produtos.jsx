import { useState, useEffect } from 'react';
import api from '../services/api';

function Produtos() {
  
  // 1. Estados
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]); // <-- Novo: para o dropdown
  const [mensagem, setMensagem] = useState('');

  // Estados do formulário (baseado no models.py)
  const [nomeProduto, setNomeProduto] = useState('');
  const [descricao, setDescricao] = useState('');
  const [marca, setMarca] = useState('');
  const [gestao, setGestao] = useState('Própria'); // Valor padrão
  const [selectedCategoria, setSelectedCategoria] = useState(''); // Guarda o ID da categoria

  // 2. Funções de busca
  async function buscarProdutos() {
    try {
      const response = await api.get('/produtos'); //
      setProdutos(response.data);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    }
  }

  // Nova função para buscar as categorias (do Sprint 1)
  async function buscarCategorias() {
    try {
      const response = await api.get('/categorias'); //
      setCategorias(response.data);
      // Se houver categorias, seleciona a primeira como padrão
      if (response.data.length > 0) {
        setSelectedCategoria(response.data[0].id_categoria);
      }
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
    }
  }

  // 3. useEffect (busca os DOIS conjuntos de dados)
  useEffect(() => {
    buscarProdutos();
    buscarCategorias();
  }, []); 

  // 4. Função de cadastrar
  async function handleCadastrar(event) {
    event.preventDefault(); 
    
    // Monta o payload (JSON)
    const dadosProduto = {
      nome_produto: nomeProduto,
      descricao: descricao || null,
      marca: marca || null,
      gestao: gestao,
      id_categoria_produto: parseInt(selectedCategoria)
    };
    
    try {
      // POST /produtos
      const response = await api.post('/produtos', dadosProduto);
      
      setMensagem(`Produto "${response.data.nome_produto}" cadastrado com sucesso!`); 

      limparFormulario();
      buscarProdutos(); // Atualiza a lista

    } catch (error) {
      // Erro de duplicidade (nome_produto)
      if (error.response && error.response.data && error.response.data.detail) {
        setMensagem(`Erro: ${error.response.data.detail}`);
      } else {
        setMensagem("Erro ao cadastrar produto.");
        console.error("Erro no cadastro:", error);
      }
    }
  }

  function limparFormulario() {
    setNomeProduto('');
    setDescricao('');
    setMarca('');
    setGestao('Própria');
    // Não limpamos a categoria selecionada, para facilitar cadastros sequenciais
  }

  // 5. O JSX (HTML)
  return (
    <div>
      <h1>Gerenciamento de Produtos</h1>

      {/* --- Formulário de Cadastro --- */}
      <form onSubmit={handleCadastrar}>
        <h2>Novo Produto</h2>
        
        <div style={{ marginTop: '10px' }}>
          <label>Nome do Produto: </label>
          <input 
            type="text"
            value={nomeProduto}
            onChange={(e) => setNomeProduto(e.target.value)}
            required 
          />
        </div>

        <div style={{ marginTop: '10px' }}>
          <label>Categoria: </label>
          <select 
            value={selectedCategoria} 
            onChange={(e) => setSelectedCategoria(e.target.value)}
            required
          >
            {/* O dropdown é populado dinamicamente com as categorias */}
            {categorias.map(cat => (
              <option key={cat.id_categoria} value={cat.id_categoria}>
                {cat.descricao}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: '10px' }}>
          <label>Descrição (Opcional): </label>
          <input 
            type="text"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
        </div>

        <div style={{ marginTop: '10px' }}>
          <label>Marca (Opcional): </label>
          <input 
            type="text"
            value={marca}
            onChange={(e) => setMarca(e.target.value)}
          />
        </div>

        <div style={{ marginTop: '10px' }}>
          <label>Tipo de Gestão: </label>
          <select value={gestao} onChange={(e) => setGestao(e.target.value)}>
            <option value="Própria">Própria</option>
            <option value="Consignado">Consignado</option>
          </select>
        </div>

        <button type="submit" style={{ marginTop: '20px' }}>Salvar Produto</button>
      </form>

      {mensagem && <p>{mensagem}</p>}

      <hr style={{ margin: '20px 0' }} />

      {/* --- Lista de Produtos --- */}
      <h2>Produtos Cadastrados</h2>
      <table border="1" cellPadding="5" cellSpacing="0">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Marca</th>
            <th>Gestão</th>
            <th>Categoria (ID)</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {produtos.map(produto => (
            <tr key={produto.id_produto}>
              <td>{produto.id_produto}</td>
              <td>{produto.nome_produto}</td>
              <td>{produto.marca}</td>
              <td>{produto.gestao}</td>
              <td>{produto.id_categoria_produto}</td>
              <td>{produto.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Produtos;