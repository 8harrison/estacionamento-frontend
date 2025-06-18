import axios from 'axios';

const apiReal = 'https://projeto-estacionamento-senai.onrender.com/api'

const apiLocal = 'http://localhost:3000/api'

// Criando uma instância do axios com a URL base da API
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || apiLocal,
});

// Interceptor para adicionar o token de autenticação em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de resposta (como token expirado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      // Token expirado ou inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
