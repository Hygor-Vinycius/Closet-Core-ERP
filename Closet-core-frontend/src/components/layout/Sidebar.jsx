// (Usaremos o 'Link' do react-router-dom em vez da tag <a> 
// para que a página não recarregue)
import { Link } from 'react-router-dom';

function Sidebar() {
  return (
    <nav style={{ 
      width: '250px', 
      background: '#f4f4f4', 
      height: '100vh', 
      padding: '20px' 
    }}>
      <h2>Closet Core ERP</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li><Link to="/">Dashboard</Link></li>
        
        {/* Links do Sprint 1 */}
        <li style={{ marginTop: '10px' }}><strong>Sprint 1: Fundação</strong></li>
        <li><Link to="/usuarios">Usuários</Link></li>
        <li><Link to="/categorias">Categorias de Produto</Link></li>
        <li><Link to="/formas-pagamento">Formas de Pagamento</Link></li>
        <li><Link to="/condicoes-pagamento">Condições de Pagamento</Link></li>
        <li><Link to="/maquininhas">Maquininhas</Link></li>
        <li><Link to="/taxas-parcelamento">Taxas de Parcelamento</Link></li>
        <li style={{ marginTop: '10px' }}><strong>Sprint 2: Entidades</strong></li>
        <li><Link to="/clientes">Clientes</Link></li>
        <li><Link to="/fornecedores">Fornecedores</Link></li>
        <li><Link to="/produtos">Produtos</Link></li>
        <li><Link to="/variacoes-produto">Variações (SKUs)</Link></li>
        <li style={{ marginTop: '10px' }}><strong>Sprint 3: Operações</strong></li>
        <li><Link to="/compras/nova">Nova Compra</Link></li>
        <li><Link to="/compras">Listar Compras</Link></li>
        <li><Link to="/contas-a-pagar">Contas a Pagar</Link></li>
        <li><Link to="/estoque">Consultar Estoque</Link></li>
        <li style={{ marginTop: '10px' }}><strong>Sprint 4: Vendas</strong></li>
      <li><Link to="/vendas/nova">Nova Venda (PDV)</Link></li>
      </ul>
    </nav>
  );
}

export default Sidebar;