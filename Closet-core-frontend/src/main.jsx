import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
// import './index.css'; // (Opcional, o CssBaseline já faz muito)

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Define um tema básico (dark mode é fácil de ativar aqui, se quiser)
const theme = createTheme({
  palette: {
    // mode: 'dark', 
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Normaliza o CSS em todos os navegadores */}
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);