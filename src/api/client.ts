import axios from 'axios';

const baseURL = import.meta.env.VITE_BASE_URL || 'http://localhost:8081';

const client = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;