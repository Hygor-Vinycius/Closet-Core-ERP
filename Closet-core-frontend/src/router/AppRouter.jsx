import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Importa nosso "Template" principal
import MainLayout from '../components/layout/MainLayout';

// Importa as páginas (que ainda vamos criar)
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
import NovaVenda from '../pages/NovaVenda';
import Estoque from '../pages/Estoque';
// (Vamos criar as outras páginas em breve)
// import CategoriasProduto from '../pages/CategoriasProduto'; 
// ... etc ...

// Esta é a definição das nossas "rotas de frontend"
const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />, // Todas as rotas usarão este "template"
    children: [
      // Cada "página" é um "filho" do layout
      {
        path: '/', // Rota raiz (ex: localhost:5173/)
        element: <Dashboard />,
      },
      {
        path: '/usuarios', // Rota /usuarios
        element: <Usuarios />,
      },
      { 
        path: '/categorias', 
        element: <CategoriasProduto />,
      },
      { 
        path: '/formas-pagamento', 
        element: <FormasPagamento />,
      },
      {
        path: '/condicoes-pagamento', 
        element: <CondicoesPagamento />,
      },
      { 
        path: '/maquininhas', 
        element: <Maquininhas />,
      },
      { 
        path: '/taxas-parcelamento', 
        element: <TaxasParcelamento />,
      },
      { 
        path: '/clientes', 
        element: <Clientes />,
      },
      {
        path: '/fornecedores', 
        element: <Fornecedores />,
      },
      { 
        path: '/produtos', 
        element: <Produtos />,
      },
      { 
        path: '/variacoes-produto', 
        element: <VariacoesProduto />,
      },
      { 
        path: '/compras/nova', 
        element: <NovaCompra />,
      },
      {
        path: '/compras',
        element: <ListarCompras />,
      },
      { 
        path: '/contas-a-pagar',
        element: <ContasAPagar />,
      },
      { // <-- 2. ADICIONE ESTE BLOCO
        path: '/estoque', 
        element: <Estoque />,
      },
      { 
        path: '/vendas/nova', 
        element: <NovaVenda />,
      }
    ],
  },
]);

// Componente que fornece as rotas para a aplicação
function AppRouter() {
  return <RouterProvider router={router} />;
}

export default AppRouter;