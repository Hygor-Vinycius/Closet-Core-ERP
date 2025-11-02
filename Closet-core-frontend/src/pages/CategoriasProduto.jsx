import { useState, useEffect } from 'react';
import api from '../services/api';

// 1. O nome da função mudou
function CategoriasProduto() {
  
  // 2. Os estados mudaram
  const [categorias, setCategorias] = useState([]); // Guarda a lista
  const [descricao, setDescricao] = useState('');   // Guarda o valor do formulário
  const [mensagem, setMensagem] = useState('');

  // 3. A função de buscar foi adaptada
  async function buscarCategorias() {
    try {
      // Chama o endpoint de categorias (GET /categorias)
      const response = await api.get('/categorias');
      setCategorias(response.data);
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
    }
  }

  // 4. O useEffect agora chama a nova função
  useEffect(() => {
    buscarCategorias();
  }, []); 

  // 5. A função de cadastrar foi adaptada
  async function handleCadastrar(event) {
    event.preventDefault(); 
    
    // O JSON enviado é mais simples, só a descrição
    const dadosCategoria = {
      descricao: descricao
    };
    
    try {
      // Chama o endpoint de categorias (POST /categorias)
      const response = await api.post('/categorias', dadosCategoria);
      
      // O seu backend retorna o objeto criado, não uma mensagem
      // Então vamos criar nossa própria mensagem de sucesso
      setMensagem(`Categoria "${response.data.descricao}" cadastrada com sucesso! (ID: ${response.data.id_categoria})`); 

      setDescricao(''); // Limpa o formulário
      buscarCategorias(); // Atualiza a lista na tela

    } catch (error) {
      // Tratamento de erro de duplicidade (HTTP 409)
      if (error.response && error.response.data && error.response.data.detail) {
        setMensagem(`Erro: ${error.response.data.detail}`);
      } else {
        setMensagem("Erro ao cadastrar categoria.");
        console.error("Erro no cadastro:", error);
      }
    }
  }

  // 6. O JSX (HTML) foi adaptado
  return (
    <div>
      <h1>Gerenciamento de Categorias de Produto</h1>

      {/* --- Formulário de Cadastro --- */}
      <form onSubmit={handleCadastrar}>
        <h2>Nova Categoria</h2>
        <div>
          <label>Descrição: </label>
          <input 
            type="text"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            required 
          />
        </div>
        <button type="submit" style={{ marginTop: '10px' }}>Salvar Categoria</button>
      </form>

      {/* Exibe a mensagem de sucesso ou erro */}
      {mensagem && <p>{mensagem}</p>}

      <hr style={{ margin: '20px 0' }} />

      {/* --- Lista de Categorias --- */}
      <h2>Categorias Cadastradas</h2>
      <table border="1" cellPadding="5" cellSpacing="0">
        <thead>
          <tr>
            <th>ID</th>
            <th>Descrição</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {/* Loop adaptado para 'categorias' */}
          {categorias.map(categoria => (
            <tr key={categoria.id_categoria}> 
              <td>{categoria.id_categoria}</td>
              <td>{categoria.descricao}</td>
              <td>{categoria.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CategoriasProduto;