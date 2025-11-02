// 1. IMPORTAÇÕES
// 'useState' é para criar "variáveis de estado" (que atualizam a tela)
// 'useEffect' é para executar código quando a tela carrega
import { useState, useEffect } from 'react';

// Importamos nossa "ponte" da API que criamos
import api from '../services/api';

// 2. DEFINIÇÃO DO COMPONENTE
function Usuarios() {
  
  // 3. CRIAÇÃO DOS ESTADOS (useState)
  // 'usuarios' vai guardar a lista vinda do backend. Começa como um array vazio [].
  const [usuarios, setUsuarios] = useState([]);
  
  // Estados para os campos do formulário
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [funcao, setFuncao] = useState(''); // Campo "Função" adicionado
  
  // 'mensagem' vai guardar o feedback do backend (ex: "Usuário cadastrado!")
  const [mensagem, setMensagem] = useState('');

  // 4. EFEITO DE CARREGAMENTO (useEffect)
  // Este bloco de código roda UMA VEZ quando o componente é desenhado na tela
  // É o lugar perfeito para buscar os dados iniciais da API.
  useEffect(() => {
    // Definimos uma função 'buscarUsuarios'
    async function buscarUsuarios() {
      try {
        // CHAMA A API DO BACKEND! (GET /usuarios/)
        const response = await api.get('/usuarios/');
        
        // Quando os dados chegam (response.data), nós os guardamos no estado
        setUsuarios(response.data); // Isso vai fazer a lista na tela aparecer!

      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
      }
    }

    // Chamamos a função que acabamos de definir
    buscarUsuarios();
  }, []); // O '[]' vazio garante que isso rode só uma vez.

  // 5. FUNÇÃO PARA LIDAR COM O CADASTRO (Formulário)
  // Esta função é chamada quando o usuário clica no botão "Salvar"
  async function handleCadastrar(event) {
    // Previne o comportamento padrão do HTML de recarregar a página
    event.preventDefault(); 
    
    // Montamos o "payload" (o JSON) que o backend espera
    // (Alinhado com seu teste do Insomnia e models.py corrigido)
    const dadosUsuario = {
      nome: nome,
      email: email,
      funcao: funcao
    };
    
    try {
      // CHAMA A API DO BACKEND! (POST /usuarios/)
      const response = await api.post('/usuarios/', dadosUsuario);
      
      // Deu certo! Guardamos a mensagem de sucesso
      // (Seu backend retorna a mensagem direto, ex: "Usuario... cadastrado com sucesso!")
      setMensagem(response.data); 

      // Limpa os campos do formulário
      setNome('');
      setEmail('');
      setFuncao('');
      
      // ATUALIZA A LISTA!
      // Buscamos a lista de novo para mostrar o novo usuário
      const responseGet = await api.get('/usuarios/');
      setUsuarios(responseGet.data);

    } catch (error) {
      // Se o backend der erro (ex: HTTP 409 - "E-mail já existe")
      if (error.response && error.response.data && error.response.data.detail) {
        setMensagem(`Erro: ${error.response.data.detail}`);
      } else {
        setMensagem("Erro ao cadastrar usuário.");
        console.error("Erro no cadastro:", error);
      }
    }
  }

  // 6. O "HTML" (JSX) QUE SERÁ DESENHADO
  return (
    <div>
      <h1>Gerenciamento de Usuários</h1>

      {/* --- Formulário de Cadastro --- */}
      <form onSubmit={handleCadastrar}>
        <h2>Novo Usuário</h2>
        <div>
          <label>Nome: </label>
          <input 
            type="text"
            value={nome} // O valor do campo está "amarrado" ao estado 'nome'
            onChange={(e) => setNome(e.target.value)} // Quando o usuário digita, atualiza o estado 'nome'
            required 
          />
        </div>
        <div style={{ marginTop: '10px' }}>
          <label>Email: </label>
          <input 
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
        </div>
        <div style={{ marginTop: '10px' }}>
          <label>Função: </label>
          <input 
            type="text"
            value={funcao}
            onChange={(e) => setFuncao(e.target.value)}
            placeholder="Ex: Vendedor, Admin"
            required 
          />
        </div>
        <button type="submit" style={{ marginTop: '10px' }}>Salvar Usuário</button>
      </form>

      {/* Exibe a mensagem de sucesso ou erro */}
      {mensagem && <p>{JSON.stringify(mensagem)}</p>} {/* Mostra a mensagem da API */}

      <hr style={{ margin: '20px 0' }} />

      {/* --- Lista de Usuários --- */}
      <h2>Usuários Cadastrados</h2>
      <table border="1" cellPadding="5" cellSpacing="0">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Email</th>
            <th>Função</th> {/* Coluna Adicionada */}
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {/* Loop que desenha uma <tr> para cada item no estado 'usuarios' */}
          {usuarios.map(usuario => (
            <tr key={usuario.id_usuario}> {/* 'key' é um ID único que o React exige */}
              <td>{usuario.id_usuario}</td>
              <td>{usuario.nome}</td>
              <td>{usuario.email}</td>
              <td>{usuario.funcao}</td> {/* Campo Adicionado */}
              <td>{usuario.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Exporta o componente para que o Roteador possa usá-lo
export default Usuarios;