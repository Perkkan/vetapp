import axios from 'axios';

// Crear instancia de axios con URL base
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

console.log('API URL configurada:', API_URL);

// Crear instancia de axios
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para agregar token a las peticiones
api.interceptors.request.use(
  (config) => {
    console.log('Realizando petición a:', config.url);
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Error en la solicitud:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => {
    console.log('Respuesta recibida de:', response.config.url);
    return response;
  },
  (error) => {
    console.error('Error en la respuesta:', error.message);
    if (error.response) {
      console.error('Datos:', error.response.data);
      console.error('Estado:', error.response.status);
    } else if (error.request) {
      console.error('No se recibió respuesta del servidor');
    }
    return Promise.reject(error);
  }
);

// Servicios de Inventario
export const inventarioService = {
  getAllProductos: () => api.get('/inventario'),
  getProductoById: (id) => api.get(`/inventario/${id}`),
  createProducto: (producto) => api.post('/inventario', producto),
  updateProducto: (id, producto) => api.put(`/inventario/${id}`, producto),
  deleteProducto: (id) => api.delete(`/inventario/${id}`)
};

// Servicios de Propietarios
export const propietariosService = {
  getAllPropietarios: () => api.get('/propietarios'),
  getPropietarioById: (id) => api.get(`/propietarios/${id}`),
  createPropietario: (propietario) => api.post('/propietarios', propietario),
  updatePropietario: (id, propietario) => api.put(`/propietarios/${id}`, propietario),
  deletePropietario: (id) => api.delete(`/propietarios/${id}`)
};

// Servicios de Pacientes
export const pacientesService = {
  getAllPacientes: () => api.get('/pacientes'),
  getPacienteById: (id) => api.get(`/pacientes/${id}`),
  createPaciente: (paciente) => api.post('/pacientes', paciente),
  updatePaciente: (id, paciente) => api.put(`/pacientes/${id}`, paciente),
  deletePaciente: (id) => api.delete(`/pacientes/${id}`),
  getPacientesByPropietario: (propietarioId) => api.get(`/pacientes/propietario/${propietarioId}`),
  getPacientesByEspecie: (especie) => api.get(`/pacientes/especie/${especie}`),
};

// Servicios de Historiales
export const historialesService = {
  getAllHistoriales: () => api.get('/historiales'),
  getHistorialById: (id) => api.get(`/historiales/${id}`),
  createHistorial: (historial) => api.post('/historiales', historial),
  updateHistorial: (id, historial) => api.put(`/historiales/${id}`, historial),
  deleteHistorial: (id) => api.delete(`/historiales/${id}`),
  getHistorialesByPaciente: (pacienteId) => api.get(`/historiales/paciente/${pacienteId}`),
  getHistorialesByVeterinario: (veterinarioId) => api.get(`/historiales/veterinario/${veterinarioId}`),
  getHistorialesByFecha: (fechaInicio, fechaFin) => 
    api.get(`/historiales/fecha?inicio=${fechaInicio}&fin=${fechaFin}`),
};

// Servicios de Facturación
export const facturacionService = {
  getAllFacturas: () => api.get('/facturas'),
  getFacturaById: (id) => api.get(`/facturas/${id}`),
  createFactura: (factura) => api.post('/facturas', factura),
  updateFactura: (id, factura) => api.put(`/facturas/${id}`, factura),
  deleteFactura: (id) => api.delete(`/facturas/${id}`)
};

// Servicios de Citas
export const citasService = {
  getAllCitas: () => api.get('/citas'),
  getCitaById: (id) => api.get(`/citas/${id}`),
  createCita: (cita) => api.post('/citas', cita),
  updateCita: (id, cita) => api.put(`/citas/${id}`, cita),
  deleteCita: (id) => api.delete(`/citas/${id}`),
  getCitasByFecha: (fecha) => api.get(`/citas/fecha/${fecha}`),
  getCitasByPaciente: (pacienteId) => api.get(`/citas/paciente/${pacienteId}`),
  getCitasByVeterinario: (veterinarioId) => api.get(`/citas/veterinario/${veterinarioId}`),
};

// Servicios de Veterinarios
export const veterinariosService = {
  getAllVeterinarios: () => api.get('/veterinarios'),
  getVeterinarioById: (id) => api.get(`/veterinarios/${id}`),
  createVeterinario: (veterinario) => api.post('/veterinarios', veterinario),
  updateVeterinario: (id, veterinario) => api.put(`/veterinarios/${id}`, veterinario),
  deleteVeterinario: (id) => api.delete(`/veterinarios/${id}`),
};

// Servicios de Reportes y Estadísticas
export const reportesService = {
  getEstadisticasCitas: (periodo) => api.get(`/reportes/citas?periodo=${periodo}`),
  getEstadisticasPacientes: () => api.get('/reportes/pacientes'),
  getIngresosPorPeriodo: (fechaInicio, fechaFin) => 
    api.get(`/reportes/ingresos?inicio=${fechaInicio}&fin=${fechaFin}`),
  getReportePersonalizado: (parametros) => api.post('/reportes/personalizado', parametros),
};

// Servicios de Sala de Espera
export const salaEsperaService = {
  getPacientesEnEspera: () => api.get('/sala-espera/espera'),
  getPacientesEnConsulta: () => api.get('/sala-espera/consulta'),
  getPacientesHospitalizados: () => api.get('/sala-espera/hospitalizados'),
  getDetalleHospitalizacion: (id) => api.get(`/sala-espera/hospitalizados/${id}`),
  agregarPacienteEspera: (paciente) => api.post('/sala-espera', paciente),
  moverAConsulta: (id, data) => api.put(`/sala-espera/${id}/consulta`, data),
  moverAHospitalizacion: (id, data) => api.put(`/sala-espera/${id}/hospitalizacion`, data),
  actualizarHospitalizacion: (id, data) => api.put(`/sala-espera/${id}/hospitalizacion/actualizar`, data),
  actualizarPrioridad: (id, data) => api.put(`/sala-espera/${id}/prioridad`, data),
  finalizarAtencion: (id) => api.delete(`/sala-espera/${id}`),
};

// Servicios de Clínicas
export const clinicasService = {
  getAllClinicas: () => api.get('/clinicas'),
  getClinicaById: (id) => api.get(`/clinicas/${id}`),
  createClinica: (clinica) => api.post('/clinicas', clinica),
  updateClinica: (id, clinica) => api.put(`/clinicas/${id}`, clinica),
  deleteClinica: (id) => api.delete(`/clinicas/${id}`),
  getAdministradoresDisponibles: (clinicaId = null) => 
    api.get(`/clinicas-administradores/${clinicaId || ''}`),
  cambiarClinicaActiva: (data) => api.post('/cambiar-clinica', data),
};

// Servicios de Usuarios
export const usuariosService = {
  getAllUsuarios: (clinicaId) => api.get('/usuarios', { params: { clinica_id: clinicaId } }),
  getUsuarioById: (id) => api.get(`/usuarios/${id}`),
  createUsuario: (usuario) => api.post('/usuarios', usuario),
  updateUsuario: (id, usuario) => api.put(`/usuarios/${id}`, usuario),
  deleteUsuario: (id) => api.delete(`/usuarios/${id}`),
  getUsuariosByRol: (rol, clinicaId) => 
    api.get('/usuarios-por-rol', { params: { rol, clinica_id: clinicaId } }),
  cambiarPassword: (id, datos) => api.put(`/usuarios/${id}/cambiar-password`, datos),
};

// Servicios de Permisos
export const permisosService = {
  verificarPermiso: (usuarioId, permisoCodigo) => 
    api.post('/permisos/verificar', { usuario_id: usuarioId, permiso_codigo: permisoCodigo }),
  getPermisosByUsuario: (usuarioId) => api.get(`/permisos/usuario/${usuarioId}`),
};

// Servicios de Notificaciones
export const notificacionesService = {
  getNotificacionesByUsuario: (usuarioId, params = {}) => 
    api.get(`/notificaciones/usuario/${usuarioId}`, { params }),
  marcarComoLeida: (id) => api.put(`/notificaciones/${id}/leida`),
  marcarTodasComoLeidas: (usuarioId) => api.put(`/notificaciones/usuario/${usuarioId}/leidas`),
  eliminarNotificacion: (id) => api.delete(`/notificaciones/${id}`),
};

export default api; 