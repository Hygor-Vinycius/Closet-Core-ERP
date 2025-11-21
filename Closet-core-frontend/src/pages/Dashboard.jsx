import { useState, useEffect } from 'react';
import api from '../services/api';

// Imports do MUI
import { 
  Grid, Paper, Typography, Box, CircularProgress, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip 
} from '@mui/material';

// Ícones
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import WarningIcon from '@mui/icons-material/Warning';
import CategoryIcon from '@mui/icons-material/Category';
import InventoryIcon from '@mui/icons-material/Inventory'; // Ícone adicional

// Gráficos (Recharts)
import { 
  BarChart, Bar, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

// --- Função de Formatação SEGURA ---
const fMoney = (val) => {
  if (val === undefined || val === null) return 'R$ 0,00';
  const num = Number(val);
  return isNaN(num) ? 'R$ 0,00' : num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// --- Componente do Cartão KPI ---
const KpiCard = ({ title, value, icon, color, trend }) => (
  <Paper elevation={2} sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%', borderRadius: 2 }}>
    <Box>
      <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem' }}>
        {title}
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 'bold', my: 0.5, color: '#333' }}>
        {value}
      </Typography>
      <Typography variant="caption" component="div" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
        {trend}
      </Typography>
    </Box>
    <Box sx={{ 
      backgroundColor: `${color}20`, 
      color: color, 
      borderRadius: '50%', 
      p: 1.5,
      display: 'flex' 
    }}>
      {icon}
    </Box>
  </Paper>
);

// --- Tooltip Seguro para Barras ---
const CustomTooltipBar = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const sku = payload[0].payload?.sku || 'N/A';
    return (
      <div style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
        <p style={{ fontWeight: 'bold', margin: 0, fontSize: '0.9rem', color: '#333' }}>
          {label ? label.split('(')[0] : 'Produto'}
        </p>
        <p style={{ margin: '4px 0', fontSize: '0.8rem', color: '#666' }}>
           SKU: <strong>{sku}</strong>
        </p>
        <p style={{ margin: 0, color: '#2e7d32', fontWeight: 'bold' }}>
          Vendidos: {payload[0].value} un
        </p>
      </div>
    );
  }
  return null;
};

// --- Tooltip Seguro para Linhas ---
const CustomTooltipLine = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
        <p style={{ fontWeight: 'bold', margin: 0 }}>Mês: {label}</p>
        <p style={{ margin: 0, color: '#2e7d32' }}>
          {fMoney(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

function Dashboard() {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarDashboard() {
      try {
        const response = await api.get('/dashboard/resumo');
        console.log("Dados do Dashboard Recebidos:", response.data); // <--- DEBUG NO CONSOLE (F12)
        setDados(response.data);
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      } finally {
        setLoading(false);
      }
    }
    carregarDashboard();
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  
  // Se dados for nulo ou vazio, mostra mensagem em vez de quebrar
  if (!dados) return <Typography sx={{ p: 3 }}>Não foi possível carregar os dados.</Typography>;

  // Garante que os arrays existam para não quebrar os gráficos
  const topProdutos = dados.top_produtos || [];
  const vendasMensais = dados.grafico_evolucao || []; // Alterei para bater com o service anterior
  const graficoPizza = dados.grafico_pizza || [];
  const estoqueBaixo = dados.estoque_baixo || [];

  return (
    <Box sx={{ flexGrow: 1 }}>
      
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontFamily: 'Playfair Display, serif', fontWeight: 'bold', color: '#1a1a1a' }}>
          Dashboard Executivo
        </Typography>
        <Chip label={`Hoje: ${new Date().toLocaleDateString()}`} variant="outlined" />
      </Box>

      <Grid container spacing={3}>
        
        {/* === 1. LINHA DE KPIs (Com verificação ?. segura) === */}
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard 
            title="Faturamento (Mês)" 
            value={fMoney(dados.kpi?.faturamento)} 
            icon={<AttachMoneyIcon fontSize="large" />} 
            color="#2e7d32"
            trend={<span style={{color: 'green', display: 'flex', alignItems: 'center'}}><ArrowUpwardIcon fontSize="small"/> Receita</span>}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard 
            title="Lucro Estimado" 
            value={fMoney(dados.kpi?.lucro)} 
            icon={<TrendingUpIcon fontSize="large" />} 
            color="#1976d2"
            trend={<span style={{color: 'blue'}}>Margem</span>}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard 
            title="Contas a Receber" 
            value={fMoney(dados.kpi?.a_receber)} 
            icon={<ArrowDownwardIcon fontSize="large" />} 
            color="#ed6c02"
            trend="Entradas"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard 
            title="Contas a Pagar" 
            value={fMoney(dados.kpi?.a_pagar)} 
            icon={<ArrowUpwardIcon fontSize="large" />} 
            color="#d32f2f"
            trend="Saídas"
          />
        </Grid>

        {/* === 2. LINHA DE GRÁFICOS === */}
        
        {/* GRÁFICO 1: Top 5 Produtos */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '400px', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
               <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
               <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Top 5 Mais Vendidos</Typography>
            </Box>
            
            {topProdutos.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topProdutos}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }} 
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} hide />
                  <YAxis 
                    dataKey="nome" 
                    type="category" 
                    width={130} 
                    style={{fontSize: '0.75rem', fontWeight: 500}} 
                    tickFormatter={(val) => {
                      if (!val) return '';
                      const nomeCurto = val.split('(')[0].trim(); 
                      return nomeCurto.length > 15 ? nomeCurto.substring(0, 15) + '...' : nomeCurto;
                    }}
                  />
                  <Tooltip content={<CustomTooltipBar />} cursor={{fill: '#f0f0f0'}} />
                  <Bar dataKey="qtd" fill="#ffcc00" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>
                Nenhuma venda registrada.
              </Box>
            )}
          </Paper>
        </Grid>

        {/* GRÁFICO 2: Evolução de Vendas (Anteriormente era Categorias) */}
        {/* Se você preferir o gráfico de linha aqui, use 'vendasMensais' em vez de 'graficoPizza' */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '400px', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
               <InventoryIcon color="success" sx={{ mr: 1 }} />
               <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Evolução de Vendas (Ano)</Typography>
            </Box>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={vendasMensais} // Usando os dados de linha (grafico_evolucao)
                margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="mes" style={{fontSize: '0.8rem'}} />
                <YAxis 
                  style={{fontSize: '0.8rem'}} 
                  tickFormatter={(val) => `R$${val >= 1000 ? (val/1000).toFixed(0) + 'k' : val}`} 
                />
                <Tooltip content={<CustomTooltipLine />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="vendas" 
                  name="Total Vendido" 
                  stroke="#2e7d32" 
                  strokeWidth={3} 
                  activeDot={{ r: 6 }} 
                  dot={{r: 4}}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* === 3. LINHA DE ALERTA (Base) === */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <WarningIcon color="error" sx={{ mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
                Alerta de Reposição (Estoque Baixo)
              </Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Produto</strong></TableCell>
                    <TableCell><strong>SKU</strong></TableCell>
                    <TableCell align="right"><strong>Estoque Atual</strong></TableCell>
                    <TableCell align="center"><strong>Ação</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {estoqueBaixo.length === 0 ? (
                    <TableRow><TableCell colSpan={4} align="center">Nenhum item com estoque crítico.</TableCell></TableRow>
                  ) : (
                    estoqueBaixo.map((item, index) => (
                      <TableRow key={index} hover>
                        <TableCell>{item.produto}</TableCell>
                        <TableCell>{item.sku}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
                          {item.qtd}
                        </TableCell>
                        <TableCell align="center">
                          <Chip label="Comprar" color="error" size="small" variant="outlined" />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

      </Grid>
    </Box>
  );
}

export default Dashboard;