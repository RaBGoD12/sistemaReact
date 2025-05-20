import axios from 'axios';
// Importa la constante de URL base desde el archivo de constantes de rutas
import { API_BASE_URL as BASE_URL_CONSTANTE } from './apiConfig';
export const API_BASE_URL = 'http://localhost:8080'; // URL base de la API


const apiClient = axios.create({
  baseURL: BASE_URL_CONSTANTE, // Usa la constante que definiste
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token JWT a las cabeceras
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Usando 'token' como en tu AuthProvider
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Aseguramos que la URL sea relativa a la baseURL si ya está incluida en la constante de ruta
    // Esto es importante porque nuestras constantes de ruta YA incluyen la API_BASE_URL
    if (config.url && config.url.startsWith(BASE_URL_CONSTANTE)) {
      config.url = config.url.substring(BASE_URL_CONSTANTE.length);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de respuesta para manejar errores globales (ej. 401)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      console.error('Error 401: No autorizado. Token inválido o expirado.');
      // window.location.href = '/login'; // Redirección simple
    }
    return Promise.reject(error);
  }
);

export default apiClient;
