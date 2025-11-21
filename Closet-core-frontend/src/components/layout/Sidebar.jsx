import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Category as CategoryIcon,
  Payment as PaymentIcon,
  CreditCard as CreditCardIcon,
  Percent as PercentIcon,
  Person as PersonIcon,
  Store as StoreIcon,
  ShoppingCart as ShoppingCartIcon, // Ícone Compras
  PointOfSale as PointOfSaleIcon,   // Ícone Vendas
  AttachMoney as AttachMoneyIcon,   // Ícone Financeiro
  Receipt as ReceiptIcon,
  Inventory as InventoryIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Settings as SettingsIcon,
  AddShoppingCart as AddShoppingCartIcon, // Novo
  ListAlt as ListAltIcon // Novo
} from '@mui/icons-material';

import LogoImage from '../../assets/images/logo.png'; 

const SidebarContainer = styled.div`
  width: 250px; background-color: #1a1a1a; color: #f0f0f0; padding: 15px 0; height: 100vh;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.5); display: flex; flex-direction: column;
  position: fixed; top: 0; left: 0; overflow-y: auto;
`;
const LogoWrapper = styled.div`
  padding: 10px 15px; margin-bottom: 20px; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;
const Logo = styled.img`
  max-width: 180px; height: auto; filter: drop-shadow(0 0 5px rgba(255, 215, 0, 0.4));
`;
const Title = styled.h2`
  text-align: center; color: #ffcc00; margin: 0; font-size: 1.5em; font-family: 'Playfair Display', serif;
`;
const MenuList = styled.ul`list-style: none; padding: 0; margin: 0;`;
const MenuItem = styled.li`margin-bottom: 5px;`;
const StyledNavLink = styled(NavLink)`
  display: flex; align-items: center; padding: 10px 15px; color: #e0e0e0; text-decoration: none;
  font-size: 0.95em; transition: background-color 0.3s, color 0.3s; border-radius: 5px; margin: 0 10px;
  &:hover { background-color: #333; color: #ffeb3b; }
  &.active { background-color: #ffcc00; color: #1a1a1a; font-weight: bold; box-shadow: 0 0 8px rgba(255, 215, 0, 0.6); }
  svg { margin-right: 10px; color: #bbb; }
  &.active svg { color: #1a1a1a; }
`;
const CollapsibleHeader = styled.div`
  display: flex; align-items: center; justify-content: space-between; padding: 10px 15px; color: #e0e0e0;
  cursor: pointer; font-size: 0.95em; transition: background-color 0.3s; border-radius: 5px; margin: 0 10px 5px 10px;
  &:hover { background-color: #333; }
`;
const CollapsibleContent = styled.ul`
  list-style: none; padding: 0; margin: 0; max-height: ${props => (props.isOpen ? '500px' : '0')};
  overflow: hidden; transition: max-height 0.4s ease-in-out;
`;
const CollapsibleSubItem = styled(StyledNavLink)`
  padding-left: 35px; background-color: #2a2a2a;
  &:hover { background-color: #444; }
  &.active { background-color: #ffd700; color: #1a1a1a; }
  svg { color: #999; }
  &.active svg { color: #1a1a1a; }
`;

const ListItemLink = ({ to, primary, icon }) => (
  <MenuItem>
    <StyledNavLink to={to}>
      {icon}
      <span>{primary}</span>
    </StyledNavLink>
  </MenuItem>
);

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

// --- MENU REORGANIZADO ---
function Sidebar() {
  return (
    <SidebarContainer>
      <LogoWrapper>
        <Logo src={LogoImage} alt="Larissa Monteiro Closet Logo" />
        <Title>Closet Core</Title>
      </LogoWrapper>

      <MenuList>
        <ListItemLink to="/" primary="Dashboard" icon={<DashboardIcon />} />      

        {/* 2. VENDAS (Saída) */}
        <CollapsibleMenu title="Vendas" icon={<PointOfSaleIcon />}>
          <ListItemLink to="/vendas/nova" primary="Nova Venda (PDV)" icon={<PointOfSaleIcon />} />
          <ListItemLink to="/vendas" primary="Histórico de Vendas" icon={<ListAltIcon />} />
          <ListItemLink to="/clientes" primary="Clientes" icon={<PersonIcon />} />
        </CollapsibleMenu>

        {/* 1. COMPRAS (Entrada) */}
        <CollapsibleMenu title="Compras" icon={<ShoppingCartIcon />}>
          <ListItemLink to="/compras/nova" primary="Nova Compra" icon={<AddShoppingCartIcon />} />
          <ListItemLink to="/compras" primary="Histórico de Compras" icon={<ListAltIcon />} />
          <ListItemLink to="/fornecedores" primary="Fornecedores" icon={<StoreIcon />} />
        </CollapsibleMenu>
        
        {/* 3. FINANCEIRO (Controle) */}
        <CollapsibleMenu title="Financeiro" icon={<AttachMoneyIcon />}>
          <ListItemLink to="/contas-a-receber" primary="Contas a Receber" icon={<AttachMoneyIcon />} />
          <ListItemLink to="/contas-a-pagar" primary="Contas a Pagar" icon={<PaymentIcon />} />
        </CollapsibleMenu>

        {/* 4. ESTOQUE & PRODUTOS */}
        <CollapsibleMenu title="Estoque & Produtos" icon={<InventoryIcon />}>
          <ListItemLink to="/estoque" primary="Consultar Estoque" icon={<InventoryIcon />} />
          <ListItemLink to="/produtos" primary="Catálogo de Produtos" icon={<CategoryIcon />} />
          <ListItemLink to="/variacoes-produto" primary="Variações (SKUs)" icon={<CategoryIcon />} />
        </CollapsibleMenu>

        {/* 5. CONFIGURAÇÕES */}
        <CollapsibleMenu title="Configurações" icon={<SettingsIcon />}>
          <ListItemLink to="/usuarios" primary="Usuários" icon={<PeopleIcon />} />
          <ListItemLink to="/categorias" primary="Categorias" icon={<CategoryIcon />} />
          <ListItemLink to="/formas-pagamento" primary="Formas Pagamento" icon={<CreditCardIcon />} />
          <ListItemLink to="/condicoes-pagamento" primary="Condições Pagto" icon={<CreditCardIcon />} />
          <ListItemLink to="/maquininhas" primary="Maquininhas" icon={<CreditCardIcon />} />
          <ListItemLink to="/taxas-parcelamento" primary="Taxas" icon={<PercentIcon />} />
        </CollapsibleMenu>

      </MenuList>
    </SidebarContainer>
  );
}

export default Sidebar;