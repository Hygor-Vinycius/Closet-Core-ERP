// Em: src/pages/Maquininhas.jsx

import { useState, useEffect } from 'react';
import api from '../services/api';

function Maquininhas() {
  
  // 1. Estados
  const [maquininhas, setMaquininhas] = useState([]);
  const [mensagem, setMensagem] = useState('');

  // Estados do formulário (agora com os campos de taxa)
  const [nomeMaquininha, setNomeMaquininha] = useState('');
  const [taxaDebito, setTaxaDebito] = useState(0);
  const [taxaCreditoAVista, setTaxaCreditoAVista] = useState(0);


  // 2. Função de busca (não muda)
  async function buscarMaquininhas() {
    try {
      const response = await api.get('/maquininhas');
      setMaquininhas(response.data);
    } catch (error) {
      console.error("Erro ao buscar maquininhas:", error);
    }
  }

  // 3. useEffect (não muda)
  useEffect(() => {
    buscarMaquininhas();
  }, []); 

  // 4. Função de cadastrar (adaptada com os novos campos)
  async function handleCadastrar(event) {
    event.preventDefault(); 
    
    // Payload corrigido para bater com seu JSON e models.py
    const dadosMaquininha = {
      nome_maquininha: nomeMaquininha,
      taxa_debito: taxaDebito,
      taxa_credito_a_vista: taxaCreditoAVista
    };
    
    try {
      // POST /maquininhas
      const response = await api.post('/maquininhas', dadosMaquininha);
      
      setMensagem(`Maquininha "${response.data.nome_maquininha}" cadastrada com sucesso!`); 

      // Limpa todos os campos do formulário
      setNomeMaquininha('');
      setTaxaDebito(0);
      setTaxaCreditoAVista(0);

      buscarMaquininhas(); // Atualiza a lista

    } catch (error) {
      if (error.response && error.response.data && error.response.data.detail) {
        setMensagem(`Erro: ${error.response.data.detail}`);
      } else {
        setMensagem("Erro ao cadastrar maquininha.");
        console.error("Erro no cadastro:", error);
      }
    }
  }

  // 5. O JSX (HTML) (adaptado com os novos campos)
  return (
    <div>
      <h1>Gerenciamento de Maquininhas</h1>

      {/* --- Formulário de Cadastro --- */}
      <form onSubmit={handleCadastrar}>
        <h2>Nova Maquininha</h2>
        
        <div style={{ marginTop: '10px' }}>
          <label>Nome da Maquininha: </label>
          <input 
            type="text"
            value={nomeMaquininha}
            onChange={(e) => setNomeMaquininha(e.target.value)}
            required 
          />
        </div>

        {/* Campo de Taxa de Débito */}
        <div style={{ marginTop: '10px' }}>
          <label>Taxa Débito (ex: 0.080 para 8%): </label>
          <input 
            type="number"
            step="0.001" // Permite 3 casas decimais
            value={taxaDebito}
            onChange={(e) => setTaxaDebito(parseFloat(e.target.value) || 0)}
            required 
          />
        </div>

        {/* Campo de Taxa de Crédito à Vista */}
        <div style={{ marginTop: '10px' }}>
          <label>Taxa Crédito à Vista (ex: 0.155 para 15.5%): </label>
          <input 
            type="number"
            step="0.001" // Permite 3 casas decimais
            value={taxaCreditoAVista}
            onChange={(e) => setTaxaCreditoAVista(parseFloat(e.target.value) || 0)}
            required 
          />
        </div>

        <button type="submit" style={{ marginTop: '10px' }}>Salvar Maquininha</button>
      </form>

      {/* Exibe a mensagem de sucesso ou erro */}
      {mensagem && <p>{mensagem}</p>}

      <hr style={{ margin: '20px 0' }} />

      {/* --- Lista de Maquininhas (Tabela adaptada) --- */}
      <h2>Maquininhas Cadastradas</h2>
      <table border="1" cellPadding="5" cellSpacing="0">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Taxa Débito</th>
            <th>Taxa Crédito à Vista</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {/* Loop adaptado para os novos campos */}
          {maquininhas.map(maq => (
            <tr key={maq.id_maquininha}>
              <td>{maq.id_maquininha}</td>
              <td>{maq.nome_maquininha}</td>
              <td>{maq.taxa_debito}</td>
              <td>{maq.taxa_credito_a_vista}</td>
              <td>{maq.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Maquininhas;