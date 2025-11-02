import axios from 'axios';

// Cria uma "instância" do axios
const api = axios.create({
  // Define a URL base para todas as chamadas de API
  // Agora, em vez de digitar a URL inteira,
  // você pode apenas usar api.get('/usuarios'), api.post('/clientes'), etc.
  baseURL: 'http://127.0.0.1:8000',
});

// Exporta a instância para que possamos usá-la em nossas páginas
export default api;