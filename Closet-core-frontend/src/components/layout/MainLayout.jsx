import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

// A largura exata que definimos no Sidebar.jsx
const SIDEBAR_WIDTH = 250;

function MainLayout() {
  return (
    <div style={{ display: 'flex' }}>
      {/* 1. O Sidebar (Fixo à esquerda) */}
      <Sidebar />

      {/* 2. O Conteúdo Principal */}
      <div 
        className="main-content" 
        style={{ 
          // A MÁGICA ESTÁ AQUI:
          marginLeft: `${SIDEBAR_WIDTH}px`, // Empurra o conteúdo para a direita
          width: `calc(100% - ${SIDEBAR_WIDTH}px)`, // Ajusta a largura para não criar barra de rolagem horizontal
          padding: '20px', // Espaçamento interno
          minHeight: '100vh', // Garante altura mínima
          backgroundColor: '#f5f5f5', // Fundo cinza claro para destacar do menu
          boxSizing: 'border-box'
        }}
      >
        {/* Onde as páginas são renderizadas */}
        <Outlet /> 
      </div>
    </div>
  );
}

export default MainLayout;