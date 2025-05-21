// URL base de la API
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Tiempo máximo de espera para las peticiones en milisegundos
export const REQUEST_TIMEOUT = 15000;

// Configuración para subida de archivos
export const UPLOAD_CONFIG = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedFileTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
};

// URLs para las diferentes secciones de la API
export const API_ROUTES = {
  // Auth
  LOGIN: `${API_URL}/auth/login`,
  REGISTER: `${API_URL}/auth/register`,
  VALIDATE_TOKEN: `${API_URL}/auth/validate-token`,
  
  // Usuarios
  USUARIOS: `${API_URL}/usuarios`,
  
  // Pacientes
  PACIENTES: `${API_URL}/pacientes`,
  
  // Citas
  CITAS: `${API_URL}/citas`,
  
  // Sala de Espera
  SALA_ESPERA: `${API_URL}/sala-espera`,
  
  // Hospitalización
  HOSPITALIZACION: `${API_URL}/hospitalizacion`,
  
  // Historiales médicos
  HISTORIALES: `${API_URL}/historiales`,
  
  // Notificaciones
  NOTIFICACIONES: `${API_URL}/notificaciones`,
  
  // Clínicas
  CLINICAS: `${API_URL}/clinicas`,
  
  // Facturación
  FACTURACION: `${API_URL}/facturacion`,
  
  // Roles y permisos
  ROLES: `${API_URL}/roles`,
  PERMISOS: `${API_URL}/permisos`
}; 