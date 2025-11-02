import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

function MainLayout() {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '20px' }}>
        {/* O 'Outlet' é o "buraco" onde o react-router
            vai renderizar a página da rota atual 
            (ex: Usuarios.jsx, Categorias.jsx, etc.) */}
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;