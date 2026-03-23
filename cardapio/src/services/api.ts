import axios from 'axios';

// Cria a conexão com o seu servidor no Render
const api = axios.create({
  baseURL: 'https://comanda-digital-api.onrender.com', 
});

// 🛡️ O INTERCEPTADOR: Pega o token do cofre e mostra pro servidor
api.interceptors.request.use((config) => {
  // 1. Procura o token que guardamos no Login
  const token = localStorage.getItem('@Comanda:token');

  // 2. Se achou o token, anexa ele no cabeçalho (Authorization)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // 3. Libera a requisição para seguir viagem
  return config;
});

export default api;