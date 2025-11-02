import { useState, useEffect } from 'react';
import api from '../services/api';

function Fornecedores() {
  
  // 1. Estados
  const [fornecedores, setFornecedores] = useState([]);
  const [mensagem, setMensagem] = useState('');

  // Estados do formulário (agora 'cidade' é um campo válido)
  const [razaoSocial, setRazaoSocial] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [cidade, setCidade] = useState(''); // <-- ESTE CAMPO AGORA FUNCIONARÁ
  const [uf, setUf] = useState('');
  const [cep, setCep] = useState('');

  // 2. Função de busca
  async function buscarFornecedores() {
    try {
      const response = await api.get('/fornecedores'); //
      setFornecedores(response.data);
    } catch (error) {
      console.error("Erro ao buscar fornecedores:", error);
    }
  }

  // 3. useEffect (busca ao carregar)
  useEffect(() => {
    buscarFornecedores();
  }, []); 

  // 4. Função de cadastrar (enviando 'cidade')
  async function handleCadastrar(event) {
    event.preventDefault(); 
    
    const dadosFornecedor = {
      razao_social: razaoSocial,
      cnpj: cnpj || null,
      email: email || null,
      telefone: telefone || null,
      endereco: endereco || null,
      cidade: cidade || null, // <-- ENVIANDO O NOVO CAMPO
      uf: uf || null,
      cep: cep || null,
    };
    
    try {
      const response = await api.post('/fornecedores', dadosFornecedor); //
      setMensagem(response.data.mensagem); 

      limparFormulario();
      buscarFornecedores();

    } catch (error) {
      if (error.response && error.response.data && error.response.data.detail) {
        setMensagem(`Erro: ${error.response.data.detail}`);
      } else {
        setMensagem("Erro ao cadastrar fornecedor.");
        console.error("Erro no cadastro:", error);
      }
    }
  }

  function limparFormulario() {
    setRazaoSocial('');
    setCnpj('');
    setEmail('');
    setTelefone('');
    setEndereco('');
    setCidade(''); // <-- LIMPANDO O NOVO CAMPO
    setUf('');
    setCep('');
  }

  // 5. O JSX (HTML)
  return (
    <div>
      <h1>Gerenciamento de Fornecedores</h1>

      <form onSubmit={handleCadastrar}>
        <h2>Novo Fornecedor</h2>
        
        {/* ... (campos razaoSocial, cnpj, email, telefone) ... */}
        <div style={{ marginTop: '10px' }}>
          <label>Razão Social: </label>
          <input type="text" value={razaoSocial} onChange={(e) => setRazaoSocial(e.target.value)} required />
        </div>
        <div style={{ marginTop: '10px' }}>
          <label>CNPJ: </label>
          <input type="text" value={cnpj} onChange={(e) => setCnpj(e.target.value)} />
        </div>
        <div style={{ marginTop: '10px' }}>
          <label>Email: </label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div style={{ marginTop: '10px' }}>
          <label>Telefone: </label>
          <input type="text" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
        </div>

        <hr style={{ margin: '20px 0' }} />
        <h3>Endereço</h3>

        <div style={{ marginTop: '10px' }}>
          <label>Endereço: </label>
          <input type="text" value={endereco} onChange={(e) => setEndereco(e.target.value)} />
        </div>
        
        <div style={{ marginTop: '10px' }}>
          <label>Cidade: </label>
          <input 
            type="text"
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            required
          />
        </div>
        
        <div style={{ marginTop: '10px' }}>
          <label>UF: </label>
          <input type="text" value={uf} onChange={(e) => setUf(e.target.value)} maxLength="2" />
        </div>
        <div style={{ marginTop: '10px' }}>
          <label>CEP: </label>
          <input type="text" value={cep} onChange={(e) => setCep(e.target.value)} />
        </div>

        <button type="submit" style={{ marginTop: '20px' }}>Salvar Fornecedor</button>
      </form>

      {mensagem && <p>{mensagem}</p>}

      <hr style={{ margin: '20px 0' }} />

      {/* A tabela já estava correta, pois não exibimos 'cidade' nela (para manter simples) */}
      <h2>Fornecedores Cadastrados</h2>
      <table border="1" cellPadding="5" cellSpacing="0">
        <thead>
          <tr>
            <th>ID</th>
            <th>Razão Social</th>
            <th>CNPJ</th>
            <th>Email</th>
            <th>Telefone</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {fornecedores.map(fornecedor => (
            <tr key={fornecedor.id_fornecedor}>
              <td>{fornecedor.id_fornecedor}</td>
              <td>{fornecedor.razao_social}</td>
              <td>{fornecedor.cnpj}</td>
              <td>{fornecedor.email}</td>
              <td>{fornecedor.telefone}</td>
              <td>{fornecedor.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Fornecedores;