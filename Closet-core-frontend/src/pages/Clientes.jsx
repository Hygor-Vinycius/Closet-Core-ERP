// Em: src/pages/Clientes.jsx

import { useState, useEffect } from 'react';
import api from '../services/api';

function Clientes() {
  
  // 1. Estados
  const [clientes, setClientes] = useState([]);
  const [mensagem, setMensagem] = useState('');

  // 2. Estados do formulário (Corrigidos para o seu models.py)
  const [tipoCliente, setTipoCliente] = useState('PF'); // 'PF' ou 'PJ'
  
  // Campos PF
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [cpf, setCpf] = useState('');
  
  // Campos PJ
  const [razaoSocial, setRazaoSocial] = useState('');
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [cnpj, setCnpj] = useState('');

  // Campos comuns (Corrigidos)
  const [e_mail, setE_mail] = useState(''); // <--- NOME CORRIGIDO
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');
  const [cep, setCep] = useState('');

  // 3. Função de busca (não muda)
  async function buscarClientes() {
    try {
      const response = await api.get('/clientes/'); //
      setClientes(response.data);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    }
  }

  // 4. useEffect (não muda)
  useEffect(() => {
    buscarClientes();
  }, []); 

  // 5. Função de cadastrar (Payload Corrigido)
  async function handleCadastrar(event) {
    event.preventDefault(); 
    
    // Monta o payload (JSON) baseado no seu models.py
    const dadosCliente = {
      tipo_cliente: tipoCliente,
      e_mail: e_mail,       // <--- NOME CORRIGIDO (e obrigatório)
      telefone: telefone,   // <--- Obrigatório
      endereco: endereco || null,
      cidade: cidade || null,
      uf: uf || null,
      cep: cep || null,

      // Campos que dependem do tipo
      ...(tipoCliente === 'PF' ? {
        nome_completo: nomeCompleto,
        cpf: cpf || null,
        // (Campos PJ ficam nulos no backend)
      } : {
        // Para PJ, o 'nome_completo' do modelo recebe a 'razao_social'
        nome_completo: razaoSocial, 
        razao_social: razaoSocial,
        nome_fantasia: nomeFantasia || null,
        cnpj: cnpj || null,
        // (Campos PF ficam nulos no backend)
      })
    };
    
    try {
      // POST /clientes/
      const response = await api.post('/clientes/', dadosCliente);
      
      setMensagem(response.data.mensagem); 

      limparFormulario();
      buscarClientes(); // Atualiza a lista

    } catch (error) {
      if (error.response && error.response.data && error.response.data.detail) {
        setMensagem(`Erro: ${error.response.data.detail}`);
      } else {
        setMensagem("Erro ao cadastrar cliente.");
        console.error("Erro no cadastro:", error);
      }
    }
  }

  // Função auxiliar para limpar todos os estados do formulário
  function limparFormulario() {
    setNomeCompleto('');
    setCpf('');
    setRazaoSocial('');
    setNomeFantasia('');
    setCnpj('');
    setE_mail(''); // <--- NOME CORRIGIDO
    setTelefone('');
    setEndereco('');
    setCidade('');
    setUf('');
    setCep('');
  }

  // 6. O JSX (HTML)
  return (
    <div>
      <h1>Gerenciamento de Clientes</h1>

      {/* --- Formulário de Cadastro --- */}
      <form onSubmit={handleCadastrar}>
        <h2>Novo Cliente</h2>
        
        <div style={{ marginTop: '10px' }}>
          <label>Tipo de Cliente: </label>
          <select value={tipoCliente} onChange={(e) => setTipoCliente(e.target.value)}>
            <option value="PF">Pessoa Física</option>
            <option value="PJ">Pessoa Jurídica</option>
          </select>
        </div>

        {/* --- CAMPOS DE PESSOA FÍSICA (tipoCliente === 'PF') --- */}
        {tipoCliente === 'PF' && (
          <>
            <div style={{ marginTop: '10px' }}>
              <label>Nome Completo: </label>
              <input 
                type="text"
                value={nomeCompleto}
                onChange={(e) => setNomeCompleto(e.target.value)}
                required 
              />
            </div>
            <div style={{ marginTop: '10px' }}>
              <label>CPF (Opcional): </label>
              <input 
                type="text"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
              />
            </div>
          </>
        )}

        {/* --- CAMPOS DE PESSOA JURÍDICA (tipoCliente === 'PJ') --- */}
        {tipoCliente === 'PJ' && (
          <>
            <div style={{ marginTop: '10px' }}>
              <label>Razão Social: </label>
              <input 
                type="text"
                value={razaoSocial}
                onChange={(e) => setRazaoSocial(e.target.value)}
                required 
              />
            </div>
             <div style={{ marginTop: '10px' }}>
              <label>Nome Fantasia (Opcional): </label>
              <input 
                type="text"
                value={nomeFantasia}
                onChange={(e) => setNomeFantasia(e.target.value)}
              />
            </div>
            <div style={{ marginTop: '10px' }}>
              <label>CNPJ (Opcional): </label>
              <input 
                type="text"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
              />
            </div>
          </>
        )}
        
        {/* --- CAMPOS COMUNS --- */}
        <hr style={{ margin: '20px 0' }} />

        <div style={{ marginTop: '10px' }}>
          <label>E-mail: </label>
          <input 
            type="email"
            value={e_mail} // <--- NOME CORRIGIDO
            onChange={(e) => setE_mail(e.target.value)} // <--- NOME CORRIGIDO
            required // <--- Campo agora é obrigatório
          />
        </div>
        <div style={{ marginTop: '10px' }}>
          <label>Telefone: </label>
          <input 
            type="text"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            required // <--- Campo agora é obrigatório
          />
        </div>
        <div style={{ marginTop: '10px' }}>
          <label>Endereço (Opcional): </label>
          <input 
            type="text"
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
          />
        </div>
        <div style={{ marginTop: '10px' }}>
          <label>Cidade (Opcional): </label>
          <input 
            type="text"
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
          />
        </div>
        <div style={{ marginTop: '10px' }}>
          <label>UF (Opcional): </label>
          <input 
            type="text"
            value={uf}
            onChange={(e) => setUf(e.target.value)}
            maxLength="2"
          />
        </div>
        <div style={{ marginTop: '10px' }}>
          <label>CEP (Opcional): </label>
          <input 
            type="text"
            value={cep}
            onChange={(e) => setCep(e.target.value)}
          />
        </div>

        <button type="submit" style={{ marginTop: '20px' }}>Salvar Cliente</button>
      </form>

      {/* Exibe a mensagem de sucesso ou erro */}
      {mensagem && <p>{mensagem}</p>}

      <hr style={{ margin: '20px 0' }} />

      {/* --- Lista de Clientes (Tabela Corrigida) --- */}
      <h2>Clientes Cadastrados</h2>
      <table border="1" cellPadding="5" cellSpacing="0">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome / Razão Social</th>
            <th>Tipo</th>
            <th>CPF/CNPJ</th>
            <th>E-mail</th> {/* <--- NOME CORRIGIDO (só no cabeçalho) */}
            <th>Telefone</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map(cliente => (
            <tr key={cliente.id_cliente}>
              <td>{cliente.id_cliente}</td>
              <td>{cliente.nome_completo}</td> {/* Simplificado: 'nome_completo' guarda o nome ou a razão social */}
              <td>{cliente.tipo_cliente}</td>
              <td>{cliente.tipo_cliente === 'PF' ? cliente.cpf : cliente.cnpj}</td>
              <td>{cliente.e_mail}</td> {/* <--- NOME CORRIGIDO */}
              <td>{cliente.telefone}</td>
              <td>{cliente.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Clientes;