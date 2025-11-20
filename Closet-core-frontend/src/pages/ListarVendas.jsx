import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';

function ListarVendas() {
  
  const [vendas, setVendas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [usuarios, setUsuarios] = useState([]); 
  const [mensagem, setMensagem] = useState('');

  // --- Buscas ---
  async function buscarDados() {
    try {
      // Busca Vendas
      const resVendas = await api.get('/vendas');
      setVendas(resVendas.data);

      // Busca Clientes (Todos, inclusive inativos)
      const resClientes = await api.get('/clientes?status=todos');
      setClientes(resClientes.data);

      // Busca Vendedores (Todos)
      const resUsuarios = await api.get('/usuarios?status=todos');
      setUsuarios(resUsuarios.data);

    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      setMensagem("Erro ao carregar lista de vendas.");
    }
  }

  useEffect(() => {
    buscarDados();
  }, []); 

  // --- Mapas para traduzir IDs em Nomes ---
  const clienteMap = useMemo(() => {
    return clientes.reduce((acc, c) => { acc[c.id_cliente] = c.nome_completo; return acc; }, {});
  }, [clientes]);

  const usuarioMap = useMemo(() => {
    return usuarios.reduce((acc, u) => { acc[u.id_usuario] = u.nome; return acc; }, {});
  }, [usuarios]);


  // --- Função de Cancelar ---
  async function handleCancelarVenda(vendaId) {
    if (!window.confirm(`Deseja realmente cancelar a Venda ID ${vendaId}? Isso estornará o estoque e o financeiro.`)) {
      return;
    }

    try {
      setMensagem("Cancelando...");
      // POST /vendas/{id}/cancelar
      await api.post(`/vendas/${vendaId}/cancelar`);
      setMensagem(`Venda ID ${vendaId} cancelada com sucesso!`);
      
      buscarDados(); // Atualiza a lista

    } catch (error) {
      if (error.response && error.response.data && error.response.data.detail) {
        setMensagem(`Erro: ${error.response.data.detail}`);
      } else {
        setMensagem("Erro ao cancelar venda.");
      }
    }
  }

  return (
    <div>
      <h1>Histórico de Vendas</h1>
      {mensagem && <p style={{fontWeight: 'bold', color: 'blue'}}>{mensagem}</p>}
      
      <hr style={{ margin: '20px 0' }} />

      <table border="1" cellPadding="5" cellSpacing="0" style={{ width: '100%' }}>
        <thead>
          <tr style={{ backgroundColor: '#f0f0f0' }}>
            <th>ID</th>
            <th>Data</th>
            <th>Cliente</th>
            <th>Vendedor</th>
            <th>Valor Total</th>
            <th>Status</th>
            <th>Ação</th>
          </tr>
        </thead>
        <tbody>
          {vendas.length === 0 && <tr><td colSpan="7">Nenhuma venda encontrada.</td></tr>}
          
          {vendas.map(venda => {
             // Normaliza o status para evitar erros de digitação/espaços
             const statusSafe = venda.status ? venda.status.trim().toLowerCase() : '';
             
             return (
              <tr key={venda.id_venda}>
                <td>{venda.id_venda}</td>
                <td>{new Date(venda.data_venda).toLocaleDateString('pt-BR')}</td>
                <td>{clienteMap[venda.id_cliente] || `ID ${venda.id_cliente}`}</td>
                <td>{usuarioMap[venda.id_usuario] || `ID ${venda.id_usuario}`}</td>
                <td>R$ {venda.valor_total.toFixed(2)}</td>
                <td>{venda.status}</td>
                <td>
                  {/* Lógica Padronizada: Verifica apenas se é 'finalizada' */}
                  {statusSafe === 'finalizada' && (
                    <button 
                      onClick={() => handleCancelarVenda(venda.id_venda)}
                      style={{ backgroundColor: '#ffcccc', cursor: 'pointer' }}
                    >
                      Cancelar
                    </button>
                  )}
                  
                  {statusSafe === 'cancelada' && (
                    <span style={{ color: 'red' }}>Cancelada</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ListarVendas;