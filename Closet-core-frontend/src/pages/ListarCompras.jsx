import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';

function ListarCompras() {
  
  const [compras, setCompras] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [mensagem, setMensagem] = useState('');

  async function buscarCompras() {
    try {
      const response = await api.get('/compras'); //
      setCompras(response.data);
    } catch (error) {
      console.error("Erro ao buscar compras:", error);
      setMensagem("Erro ao carregar compras.");
    }
  }

  async function buscarFornecedores() {
    try {
      // 1. CORREÇÃO DO FORNECEDOR:
      // Busca TODOS os fornecedores (ativos e inativos) para o mapa
      const response = await api.get('/fornecedores?status=todos'); //
      setFornecedores(response.data);
    } catch (error) {
      console.error("Erro ao buscar fornecedores:", error);
    }
  }

  useEffect(() => {
    buscarCompras();
    buscarFornecedores();
  }, []); 

  // Mapa para "traduzir" ID de fornecedor para Nome
  const fornecedorMap = useMemo(() => {
    return fornecedores.reduce((map, fornecedor) => {
      map[fornecedor.id_fornecedor] = fornecedor.razao_social;
      return map;
    }, {});
  }, [fornecedores]);

  // Função para Cancelar Compra
  async function handleCancelarCompra(compraId) {
    if (!window.confirm(`Tem certeza que deseja cancelar a compra ID ${compraId}? Esta ação reverterá o estoque e o financeiro.`)) {
      return;
    }
    setMensagem("Cancelando...");

    try {
      // POST /compras/{compra_id}/cancelar
      await api.post(`/compras/${compraId}/cancelar`);
      setMensagem(`Compra ID ${compraId} cancelada com sucesso!`);
      buscarCompras(); // Atualiza a lista

    } catch (error) {
      if (error.response && error.response.data && error.response.data.detail) {
        setMensagem(`Erro: ${error.response.data.detail}`);
      } else {
        setMensagem("Erro ao cancelar a compra.");
        console.error("Erro no cancelamento:", error);
      }
    }
  }

  return (
    <div>
      <h1>Histórico de Compras</h1>

      {mensagem && <p>{mensagem}</p>}

      <hr style={{ margin: '20px 0' }} />

      <table border="1" cellPadding="5" cellSpacing="0" style={{ width: '100%' }}>
        <thead>
          <tr>
            <th>ID Compra</th>
            <th>Fornecedor</th>
            <th>Nota Fiscal</th>
            <th>Data</th>
            <th>Valor Total</th>
            <th>Status</th>
            <th>Ação</th>
          </tr>
        </thead>
        <tbody>
          {compras.map(compra => (
            <tr key={compra.id_compra}>
              <td>{compra.id_compra}</td>
              <td>
                {/* Agora o 'mapa' estará completo e mostrará o nome correto */}
                {fornecedorMap[compra.id_fornecedor] || `ID ${compra.id_fornecedor}`}
              </td>
              <td>{compra.nota_fiscal}</td>
              <td>{new Date(compra.data_compra).toLocaleDateString('pt-BR')}</td>
              <td>R$ {compra.valor_total.toFixed(2)}</td>
              <td>{compra.status}</td>
              <td>
                {/* 2. CORREÇÃO DO BOTÃO:
                    Adicionado '.trim()' para ignorar espaços em branco */}
                {compra.status && compra.status.trim() === 'Recebida' && (
                  <button 
                    onClick={() => handleCancelarCompra(compra.id_compra)}
                    style={{ backgroundColor: '#ffcccc' }}
                  >
                    Cancelar
                  </button>
                )}
                {compra.status && compra.status.trim() === 'Cancelada' && (
                  <span style={{ color: 'red' }}>Cancelada</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ListarCompras;