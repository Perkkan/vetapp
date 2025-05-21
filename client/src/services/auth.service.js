import axios from 'axios';
import { API_URL } from '../config/api.config';

// Configuración para incluir el token en las solicitudes
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Configurar interceptor para agregar tokens a todas las solicitudes
axios.interceptors.request.use(
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

// Interceptor para manejar errores de autenticación (token expirado)
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Si recibimos un 401, el token puede haber expirado
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redireccionar al login si no estamos ya allí
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

const authService = {
  // Iniciar sesión
  login: async (credentials) => {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    return response.data;
  },
  
  // Registrar un nuevo usuario (solo para administradores)
  register: async (userData) => {
    const response = await axios.post(
      `${API_URL}/auth/register`, 
      userData, 
      { headers: getAuthHeader() }
    );
    return response.data;
  },
  
  // Obtener lista de usuarios (solo para administradores)
  getUsers: async () => {
    const response = await axios.get(
      `${API_URL}/usuarios`, 
      { headers: getAuthHeader() }
    );
    return response.data;
  },
  
  // Obtener detalles de un usuario
  getUser: async (id) => {
    const response = await axios.get(
      `${API_URL}/usuarios/${id}`, 
      { headers: getAuthHeader() }
    );
    return response.data;
  },
  
  // Actualizar usuario
  updateUser: async (id, userData) => {
    const response = await axios.put(
      `${API_URL}/usuarios/${id}`, 
      userData, 
      { headers: getAuthHeader() }
    );
    return response.data;
  },
  
  // Eliminar usuario
  deleteUser: async (id) => {
    const response = await axios.delete(
      `${API_URL}/usuarios/${id}`, 
      { headers: getAuthHeader() }
    );
    return response.data;
  },
  
  // Cambiar contraseña
  changePassword: async (data) => {
    const response = await axios.post(
      `${API_URL}/auth/cambiar-password`, 
      data, 
      { headers: getAuthHeader() }
    );
    return response.data;
  },
  
  // Validar token
  validateToken: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/auth/validate-token`, 
        { headers: getAuthHeader() }
      );
      return response.data.valid;
    } catch (error) {
      return false;
    }
  },
  
  // Obtener los permisos del usuario actual
  getUserPermisos: async () => {
    const response = await axios.get(
      `${API_URL}/auth/permisos`, 
      { headers: getAuthHeader() }
    );
    return response.data;
  },
  
  // Actualizar permisos de un rol
  updateRolePermisos: async (rolId, permisos) => {
    const response = await axios.put(
      `${API_URL}/roles/${rolId}/permisos`, 
      { permisos }, 
      { headers: getAuthHeader() }
    );
    return response.data;
  },
  
  // Obtener todos los roles
  getRoles: async () => {
    const response = await axios.get(
      `${API_URL}/roles`, 
      { headers: getAuthHeader() }
    );
    return response.data;
  },
  
  // Solicitar restablecimiento de contraseña
  requestPasswordReset: async (email) => {
    const response = await axios.post(`${API_URL}/auth/request-reset`, { email });
    return response.data;
  },
  
  // Restablecer contraseña con token
  resetPassword: async (token, newPassword) => {
    const response = await axios.post(`${API_URL}/auth/reset-password`, {
      token,
      newPassword
    });
    return response.data;
  }
};

export default authService; 