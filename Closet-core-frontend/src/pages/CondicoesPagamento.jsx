import { useState, useEffect } from 'react';
import api from '../services/api';

function CondicoesPagamento() {
  
  // 1. Estados para a lista e mensagem
  const [condicoes, setCondicoes] = useState([]);
  const [mensagem, setMensagem] = useState('');

  // 2. Estados para o formulário (com os nomes corretos)
  const [descricao, setDescricao] = useState('');
  const [parcelas, setParcelas] = useState(1);
  const [intervaloDias, setIntervaloDias] = useState(0);

  // 3. Função de busca (endpoint está correto)
  async function buscarCondicoes() {
    try {
      const response = await api.get('/condicoes-pagamento');
      setCondicoes(response.data);
    } catch (error) {
      console.error("Erro ao buscar condições de pagamento:", error);
    }
  }

  // 4. useEffect (não muda)
  useEffect(() => {
    buscarCondicoes();
  }, []); 

  // 5. Função de cadastrar (payload corrigido)
  async function handleCadastrar(event) {
    event.preventDefault(); 
    
    // Monta o JSON com as chaves que o backend espera
    const dadosCondicao = {
      descricao: descricao,
      parcelas: parcelas, // Nome corrigido
      intervalo_dias_parc: intervaloDias // Nome corrigido
    };
    
    try {
      // Chama o endpoint POST /condicoes-pagamento
      const response = await api.post('/condicoes-pagamento', dadosCondicao);
      
      setMensagem(`Condição "${response.data.descricao}" cadastrada com sucesso!`); 

      // Limpa o formulário
      setDescricao('');
      setParcelas(1);
      setIntervaloDias(0);

      buscarCondicoes(); // Atualiza a lista

    } catch (error) {
      if (error.response && error.response.data && error.response.data.detail) {
        setMensagem(`Erro: ${error.response.data.detail}`);
      } else {
        setMensagem("Erro ao cadastrar condição.");
        console.error("Erro no cadastro:", error);
      }
    }
  }

  // 6. O JSX (HTML)
  return (
    <div>
      <h1>Gerenciamento de Condições de Pagamento</h1>

      {/* --- Formulário de Cadastro --- */}
      <form onSubmit={handleCadastrar}>
        <h2>Nova Condição de Pagamento</h2>
        
        <div style={{ marginTop: '10px' }}>
          <label>Descrição: </label>
          <input 
            type="text"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            required 
          />
        </div>

        <div style={{ marginTop: '10px' }}>
          <label>Nº de Parcelas: </label>
          <input 
            type="number"
            value={parcelas}
            onChange={(e) => setParcelas(parseInt(e.target.value))}
            min="1"
            required 
          />
        </div>

        <div style={{ marginTop: '10px' }}>
          <label>Intervalo entre Parcelas (dias): </label>
          <input 
            type="number"
            value={intervaloDias}
            onChange={(e) => setIntervaloDias(parseInt(e.target.value))}
            min="0"
            required 
          />
        </div>

        <button type="submit" style={{ marginTop: '10px' }}>Salvar Condição</button>
      </form>

      {/* Exibe a mensagem de sucesso ou erro */}
      {mensagem && <p>{mensagem}</p>}

      <hr style={{ margin: '20px 0' }} />

      {/* --- Lista de Condições (Tabela corrigida) --- */}
      <h2>Condições de Pagamento Cadastradas</h2>
      <table border="1" cellPadding="5" cellSpacing="0">
        <thead>
          <tr>
            <th>ID</th>
            <th>Descrição</th>
            <th>Parcelas</th>
            <th>Intervalo (dias)</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {/* Loop adaptado para os nomes de campos corretos */}
          {condicoes.map(condicao => (
            <tr key={condicao.id_condicao}> {/* Chave primária correta */}
              <td>{condicao.id_condicao}</td>
              <td>{condicao.descricao}</td>
              <td>{condicao.parcelas}</td>
              <td>{condicao.intervalo_dias_parc}</td>
              <td>{condicao.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CondicoesPagamento;