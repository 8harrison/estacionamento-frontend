import axios from 'axios';

export const apiReal = 'https://projeto-estacionamento-senai.onrender.com'

export const apiLocal = 'http://localhost:3000'

export const apiUtilizada = import.meta.env.VITE_API_URL && apiReal

// Criando uma instância do axios com a URL base da API
const api = axios.create({
  baseURL: apiUtilizada + '/api',
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
