import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components'; // Se você estiver usando styled-components ou vai usar
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Category as CategoryIcon,
  Payment as PaymentIcon,
  CreditCard as CreditCardIcon,
  Percent as PercentIcon,
  Person as PersonIcon,
  Store as StoreIcon,
  ShoppingCart as ShoppingCartIcon,
  Receipt as ReceiptIcon,
  AttachMoney as AttachMoneyIcon,
  Inventory as InventoryIcon,
  PointOfSale as PointOfSaleIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

// Importa a imagem da logo
import LogoImage from '../../assets/images/logo.png'; 

// --- Estilos da Sidebar (ajustados para o tema) ---
const SidebarContainer = styled.div`
  width: 250px;
  background-color: #1a1a1a; /* Fundo escuro */
  color: #f0f0f0; /* Texto claro */
  padding: 15px 0;
  height: 100vh;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  position: fixed; /* Fixa a sidebar */
  top: 0;
  left: 0;
  overflow-y: auto; /* Para scroll em menus longos */
`;

const LogoWrapper = styled.div`
  padding: 10px 15px;
  margin-bottom: 20px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Logo = styled.img`
  max-width: 180px; /* Ajuste o tamanho da logo */
  height: auto;
  filter: drop-shadow(0 0 5px rgba(255, 215, 0, 0.4)); /* Pequeno brilho dourado */
`;

const Title = styled.h2`
  text-align: center;
  color: #ffcc00; /* Dourado para o título do sistema */
  margin: 0;
  font-size: 1.5em;
  font-family: 'Playfair Display', serif; /* Fonte mais elegante, se tiver */
`;

const MenuList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const MenuItem = styled.li`
  margin-bottom: 5px;
`;

const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: 10px 15px;
  color: #e0e0e0;
  text-decoration: none;
  font-size: 0.95em;
  transition: background-color 0.3s, color 0.3s;
  border-radius: 5px;
  margin: 0 10px;

  &:hover {
    background-color: #333; /* Fundo mais claro no hover */
    color: #ffeb3b; /* Dourado mais claro no hover */
  }

  &.active {
    background-color: #ffcc00; /* Dourado para item ativo */
    color: #1a1a1a; /* Texto escuro no item ativo */
    font-weight: bold;
    box-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
  }

  svg {
    margin-right: 10px;
    color: #bbb; /* Cor padrão do ícone */
  }

  &.active svg {
    color: #1a1a1a; /* Cor do ícone no item ativo */
  }
`;

const CollapsibleHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 15px;
  color: #e0e0e0;
  cursor: pointer;
  font-size: 0.95em;
  transition: background-color 0.3s;
  border-radius: 5px;
  margin: 0 10px 5px 10px;

  &:hover {
    background-color: #333;
  }
`;

const CollapsibleContent = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: ${props => (props.isOpen ? '500px' : '0')}; /* Ajuste a altura máxima */
  overflow: hidden;
  transition: max-height 0.4s ease-in-out;
`;

const CollapsibleSubItem = styled(StyledNavLink)`
  padding-left: 35px; /* Indentação para sub-itens */
  background-color: #2a2a2a; /* Fundo ligeiramente diferente para sub-itens */

  &:hover {
    background-color: #444;
  }
  &.active {
    background-color: #ffd700; /* Dourado para item ativo */
    color: #1a1a1a;
  }
  svg {
    color: #999;
  }
  &.active svg {
    color: #1a1a1a;
  }
`;

// Componente para um item de lista com link
const ListItemLink = ({ to, primary, icon }) => (
  <MenuItem>
    <StyledNavLink to={to}>
      {icon}
      <span>{primary}</span>
    </StyledNavLink>
  </MenuItem>
);

// Componente para o menu colapsável
const CollapsibleMenu = ({ title, icon, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <MenuItem>
      <CollapsibleHeader onClick={() => setIsOpen(!isOpen)}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {icon}
          <span>{title}</span>
        </div>
        {isOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
      </CollapsibleHeader>
      <CollapsibleContent isOpen={isOpen}>
        {children.map((child, index) => (
          <CollapsibleSubItem key={index} to={child.props.to}>
            {child.props.icon}
            <span>{child.props.primary}</span>
          </CollapsibleSubItem>
        ))}
      </CollapsibleContent>
    </MenuItem>
  );
};


function Sidebar() {
  return (
    <SidebarContainer>
      <LogoWrapper>
        <Logo src={LogoImage} alt="Larissa Monteiro Closet Logo" />
        <Title>Closet Core ERP</Title>
      </LogoWrapper>

      <MenuList>
        <ListItemLink to="/" primary="Dashboard" icon={<DashboardIcon />} />

        <CollapsibleMenu title="Cadastros" icon={<SettingsIcon />}>
          <ListItemLink to="/categorias" primary="Categorias Produto" icon={<CategoryIcon />} />
          <ListItemLink to="/formas-pagamento" primary="Formas Pagamento" icon={<PaymentIcon />} />
          <ListItemLink to="/condicoes-pagamento" primary="Condições Pagamento" icon={<CreditCardIcon />} />
          <ListItemLink to="/maquininhas" primary="Maquininhas" icon={<CreditCardIcon />} />
          <ListItemLink to="/taxas-parcelamento" primary="Taxas Parcelamento" icon={<PercentIcon />} />
          <ListItemLink to="/clientes" primary="Clientes" icon={<PersonIcon />} />
          <ListItemLink to="/fornecedores" primary="Fornecedores" icon={<StoreIcon />} />
          <ListItemLink to="/usuarios" primary="Usuários / Vendedores" icon={<PeopleIcon />} />
        </CollapsibleMenu>

        <CollapsibleMenu title="Produtos e Estoque" icon={<InventoryIcon />}>
          <ListItemLink to="/produtos" primary="Produtos" icon={<CategoryIcon />} />
          <ListItemLink to="/variacoes-produto" primary="Variações de Produto" icon={<CategoryIcon />} />
          <ListItemLink to="/estoque" primary="Consultar Estoque" icon={<InventoryIcon />} />
        </CollapsibleMenu>

        <CollapsibleMenu title="Operações" icon={<ShoppingCartIcon />}>
          <ListItemLink to="/compras/nova" primary="Nova Compra" icon={<ShoppingCartIcon />} />
          <ListItemLink to="/compras" primary="Listar Compras" icon={<ReceiptIcon />} />
          <ListItemLink to="/contas-a-pagar" primary="Contas a Pagar" icon={<AttachMoneyIcon />} />
          <ListItemLink to="/vendas/nova" primary="Nova Venda (PDV)" icon={<PointOfSaleIcon />} />
          <ListItemLink to="/vendas" primary="Listar Vendas" icon={<ReceiptIcon />} />
        </CollapsibleMenu>
      </MenuList>
    </SidebarContainer>
  );
}

export default Sidebar;