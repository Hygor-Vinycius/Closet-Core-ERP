import { useState, useEffect } from 'react';
import api from '../services/api';

// 1. O nome da função mudou
function FormasPagamento() {
  
  // 2. Os estados mudaram (plural)
  const [formas, setFormas] = useState([]); // Guarda a lista
  const [descricao, setDescricao] = useState('');   // Guarda o valor do formulário
  const [mensagem, setMensagem] = useState('');

  // 3. A função de buscar foi adaptada
  async function buscarFormas() {
    try {
      // Chama o endpoint de formas de pagamento (GET /formas-pagamento)
      const response = await api.get('/formas-pagamento');
      setFormas(response.data);
    } catch (error) {
      console.error("Erro ao buscar formas de pagamento:", error);
    }
  }

  // 4. O useEffect agora chama a nova função
  useEffect(() => {
    buscarFormas();
  }, []); 

  // 5. A função de cadastrar foi adaptada
  async function handleCadastrar(event) {
    event.preventDefault(); 
    
    // O JSON enviado é o mesmo (só a descrição)
    const dadosForma = {
      descricao: descricao
    };
    
    try {
      // Chama o endpoint de formas de pagamento (POST /formas-pagamento)
      const response = await api.post('/formas-pagamento', dadosForma);
      
      setMensagem(`Forma de Pagamento "${response.data.descricao}" cadastrada com sucesso!`); 

      setDescricao(''); // Limpa o formulário
      buscarFormas(); // Atualiza a lista na tela

    } catch (error) {
      // Tratamento de erro de duplicidade (HTTP 409)
      if (error.response && error.response.data && error.response.data.detail) {
        setMensagem(`Erro: ${error.response.data.detail}`);
      } else {
        setMensagem("Erro ao cadastrar forma de pagamento.");
        console.error("Erro no cadastro:", error);
      }
    }
  }

  // 6. O JSX (HTML) foi adaptado
  return (
    <div>
      <h1>Gerenciamento de Formas de Pagamento</h1>

      {/* --- Formulário de Cadastro --- */}
      <form onSubmit={handleCadastrar}>
        <h2>Nova Forma de Pagamento</h2>
        <div>
          <label>Descrição: </label>
          <input 
            type="text"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            required 
          />
        </div>
        <button type="submit" style={{ marginTop: '10px' }}>Salvar Forma de Pagamento</button>
      </form>

      {/* Exibe a mensagem de sucesso ou erro */}
      {mensagem && <p>{mensagem}</p>}

      <hr style={{ margin: '20px 0' }} />

      {/* --- Lista de Formas de Pagamento --- */}
      <h2>Formas de Pagamento Cadastradas</h2>
      <table border="1" cellPadding="5" cellSpacing="0">
        <thead>
          <tr>
            <th>ID</th>
            <th>Descrição</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {/* Loop adaptado para 'formas' e o ID correto */}
          {formas.map(forma => (
            <tr key={forma.id_forma_pgto}> {/* ID baseado no seu models.py */}
              <td>{forma.id_forma_pgto}</td>
              <td>{forma.descricao}</td>
              <td>{forma.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default FormasPagamento;