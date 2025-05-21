import axios from 'axios';
import { API_URL } from '../config/api.config';

const notificacionesService = {
  // Obtener notificaciones del usuario actual con paginación
  getNotificaciones: async (page = 1, limit = 10) => {
    const response = await axios.get(`${API_URL}/notificaciones`, {
      params: { page, limit }
    });
    return response.data;
  },
  
  // Obtener conteo de notificaciones no leídas
  getUnreadCount: async () => {
    const response = await axios.get(`${API_URL}/notificaciones/no-leidas/count`);
    return response.data.count;
  },
  
  // Marcar una notificación como leída
  markAsRead: async (notificacionId) => {
    const response = await axios.put(`${API_URL}/notificaciones/${notificacionId}/leer`);
    return response.data;
  },
  
  // Marcar todas las notificaciones como leídas
  markAllAsRead: async () => {
    const response = await axios.put(`${API_URL}/notificaciones/leer-todas`);
    return response.data;
  },
  
  // Eliminar una notificación
  deleteNotificacion: async (notificacionId) => {
    const response = await axios.delete(`${API_URL}/notificaciones/${notificacionId}`);
    return response.data;
  },
  
  // Crear una nueva notificación (principalmente para administradores)
  createNotificacion: async (notificacionData) => {
    const response = await axios.post(`${API_URL}/notificaciones`, notificacionData);
    return response.data;
  },
  
  // Obtener notificaciones por tipo
  getNotificacionesByTipo: async (tipo, page = 1, limit = 10) => {
    const response = await axios.get(`${API_URL}/notificaciones/tipo/${tipo}`, {
      params: { page, limit }
    });
    return response.data;
  },
  
  // Suscribirse a las notificaciones en tiempo real (si se usa WebSockets)
  subscribeToNotificaciones: (callback) => {
    // Esta funcionalidad requeriría implementación WebSocket
    // que se podría agregar en el futuro
    console.warn('Funcionalidad WebSocket no implementada');
  }
};

export default notificacionesService; 