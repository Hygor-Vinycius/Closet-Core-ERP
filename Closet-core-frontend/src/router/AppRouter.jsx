import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Importa nosso "Template" principal
import MainLayout from '../components/layout/MainLayout';

// Importa as páginas
import Dashboard from '../pages/Dashboard';
import Usuarios from '../pages/Usuarios';
import CategoriasProduto from '../pages/CategoriasProduto';
import FormasPagamento from '../pages/FormasPagamento';
import CondicoesPagamento from '../pages/CondicoesPagamento';
import Maquininhas from '../pages/Maquininhas';
import TaxasParcelamento from '../pages/TaxasParcelamento';
import Clientes from '../pages/Clientes';
import Fornecedores from '../pages/Fornecedores';
import Produtos from '../pages/Produtos';
import VariacoesProduto from '../pages/VariacoesProduto';
import NovaCompra from '../pages/NovaCompra';
import ListarCompras from '../pages/ListarCompras';
import ContasAPagar from '../pages/ContasAPagar';
import ContasAReceber from '../pages/ContasAReceber'; // <--- NOVO IMPORT
import Estoque from '../pages/Estoque';
import NovaVenda from '../pages/NovaVenda';
import ListarVendas from '../pages/ListarVendas';

// Definição das rotas
const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />, 
    children: [
      // --- Dashboard ---
      { path: '/', element: <Dashboard /> },

      // --- Sprint 1: Configurações ---
      { path: '/usuarios', element: <Usuarios /> },
      { path: '/categorias', element: <CategoriasProduto /> },
      { path: '/formas-pagamento', element: <FormasPagamento /> },
      { path: '/condicoes-pagamento', element: <CondicoesPagamento /> },
      { path: '/maquininhas', element: <Maquininhas /> },
      { path: '/taxas-parcelamento', element: <TaxasParcelamento /> },

      // --- Sprint 2: Cadastros ---
      { path: '/clientes', element: <Clientes /> },
      { path: '/fornecedores', element: <Fornecedores /> },
      { path: '/produtos', element: <Produtos /> },
      { path: '/variacoes-produto', element: <VariacoesProduto /> },

      // --- Sprint 3: Compras e Financeiro ---
      { path: '/compras/nova', element: <NovaCompra /> },
      { path: '/compras', element: <ListarCompras /> },
      { path: '/contas-a-pagar', element: <ContasAPagar /> },
      { path: '/contas-a-receber', element: <ContasAReceber /> }, // <--- NOVA ROTA ADICIONADA

      // --- Sprint 4: Vendas e Estoque ---
      { path: '/estoque', element: <Estoque /> },
      { 
        path: '/vendas/nova', 
        element: <NovaVenda /> 
      },
      { 
        path: '/vendas', 
        element: <ListarVendas /> 
      },
    ],
  },
]);

function AppRouter() {
  return <RouterProvider router={router} />;
}

export default AppRouter;