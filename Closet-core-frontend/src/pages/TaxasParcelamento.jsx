// Em: src/pages/TaxasParcelamento.jsx

import { useState, useEffect } from 'react';
import api from '../services/api';

function TaxasParcelamento() {
  
  // 1. Estados
  const [taxas, setTaxas] = useState([]); // Guarda a lista de taxas cadastradas
  const [maquininhas, setMaquininhas] = useState([]); // Guarda a lista de maquininhas para o dropdown
  const [mensagem, setMensagem] = useState('');

  // Estados do formulário (Corrigidos para o seu modelo)
  const [selectedMaquininha, setSelectedMaquininha] = useState(''); // Para o id_maquininha
  const [numParcelas, setNumParcelas] = useState(1);
  const [taxa, setTaxa] = useState(0); // Este é o campo "taxa" correto

  // 2. Função para buscar as taxas já cadastradas
  async function buscarTaxas() {
    try {
      const response = await api.get('/taxas-parcelamento'); //
      setTaxas(response.data);
    } catch (error) {
      console.error("Erro ao buscar taxas:", error);
    }
  }

  // 3. Função para buscar as maquininhas (para o dropdown)
  async function buscarMaquininhas() {
    try {
      const response = await api.get('/maquininhas'); //
      setMaquininhas(response.data);
      if (response.data.length > 0) {
        setSelectedMaquininha(response.data[0].id_maquininha);
      }
    } catch (error) {
      console.error("Erro ao buscar maquininhas:", error);
    }
  }

  // 4. useEffect (busca os dados das DUAS fontes ao carregar)
  useEffect(() => {
    buscarTaxas();
    buscarMaquininhas();
  }, []); 

  // 5. Função para cadastrar a nova taxa
  async function handleCadastrar(event) {
    event.preventDefault(); 
    
    // Payload (JSON) Corrigido para bater com o Insomnia e o Model
    const dadosTaxa = {
      id_maquininha: parseInt(selectedMaquininha),
      numero_parcelas: numParcelas,
      taxa: taxa // Campo corrigido
    };
    
    try {
      // POST /taxas-parcelamento
      const response = await api.post('/taxas-parcelamento', dadosTaxa);
      
      setMensagem(`Taxa cadastrada com sucesso! (ID: ${response.data.id_taxa})`); // ID corrigido

      // Limpa o formulário
      setNumParcelas(1);
      setTaxa(0); // Campo corrigido
      
      buscarTaxas(); // Atualiza a lista de taxas na tela

    } catch (error) {
      if (error.response && error.response.data && error.response.data.detail) {
        setMensagem(`Erro: ${error.response.data.detail}`);
      } else {
        setMensagem("Erro ao cadastrar taxa.");
        console.error("Erro no cadastro:", error);
      }
    }
  }

  // 6. O JSX (HTML) que será renderizado
  return (
    <div>
      <h1>Gerenciamento de Taxas de Parcelamento</h1>

      {/* --- Formulário de Cadastro --- */}
      <form onSubmit={handleCadastrar}>
        <h2>Nova Taxa</h2>
        
        <div style={{ marginTop: '10px' }}>
          <label>Maquininha: </label>
          <select 
            value={selectedMaquininha} 
            onChange={(e) => setSelectedMaquininha(e.target.value)}
          >
            {/* O dropdown é populado dinamicamente com a lista de maquininhas */}
            {maquininhas.map(maq => (
              <option key={maq.id_maquininha} value={maq.id_maquininha}>
                {maq.nome_maquininha}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: '10px' }}>
          <label>Nº de Parcelas: </label>
          <input 
            type="number"
            value={numParcelas}
            onChange={(e) => setNumParcelas(parseInt(e.target.value) || 1)}
            min="1"
            required 
          />
        </div>

        <div style={{ marginTop: '10px' }}>
          <label>Taxa (ex: 0.25 para 25%): </label> {/* Label corrigido */}
          <input 
            type="number"
            step="0.001"
            value={taxa} // Campo corrigido
            onChange={(e) => setTaxa(parseFloat(e.target.value) || 0)} // Campo corrigido
            min="0"
            required 
          />
        </div>

        <button type="submit" style={{ marginTop: '10px' }}>Salvar Taxa</button>
      </form>

      {/* Exibe a mensagem de sucesso ou erro */}
      {mensagem && <p>{mensagem}</p>}

      <hr style={{ margin: '20px 0' }} />

      {/* --- Lista de Taxas (Tabela Corrigida) --- */}
      <h2>Taxas Cadastradas</h2>
      <table border="1" cellPadding="5" cellSpacing="0">
        <thead>
          <tr>
            <th>ID</th>
            <th>Maquininha (ID)</th>
            <th>Nº Parcelas</th>
            <th>Taxa</th> {/* Coluna corrigida */}
          </tr>
        </thead>
        <tbody>
          {/* Loop para exibir as taxas */}
          {taxas.map(itemTaxa => ( // renomeado para 'itemTaxa' para evitar conflito
            <tr key={itemTaxa.id_taxa}> {/* ID corrigido */}
              <td>{itemTaxa.id_taxa}</td> {/* ID corrigido */}
              <td>{itemTaxa.id_maquininha}</td>
              <td>{itemTaxa.numero_parcelas}</td>
              <td>{itemTaxa.taxa}</td> {/* Campo corrigido */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TaxasParcelamento;