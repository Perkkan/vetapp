require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;
const { testConnection } = require('./config/database');
const propietariosController = require('./controllers/propietariosController');
const inventarioController = require('./controllers/inventarioController');
const facturacionController = require('./controllers/facturacionController');
const pacientesController = require('./controllers/pacientesController');
const historialesController = require('./controllers/historialesController');
const salaEsperaController = require('./controllers/salaEsperaController');
const clinicasController = require('./controllers/clinicasController');
const usuariosController = require('./controllers/usuariosController');
const notificacionesController = require('./controllers/notificacionesController');
const permisosController = require('./controllers/permisosController');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.get('/', (req, res) => {
  res.json({ mensaje: 'API del Sistema de Administración de Clínicas Veterinarias' });
});

// Ruta temporal para probar el inicio de sesión
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // En un sistema real, validaríamos contra la base de datos y usaríamos bcrypt para comparar
  
  // Verificamos las credenciales de prueba
  if (email === 'superadmin@vetapp.com' && password === 'password') {
    res.json({
      success: true,
      token: 'mock-jwt-token-superadmin',
      user: {
        id: 1,
        nombre: 'Superadmin',
        email: 'superadmin@vetapp.com',
        rol: 'superadmin'
      }
    });
  } else if (email === 'admin@vetapp.com' && password === 'password') {
    res.json({
      success: true,
      token: 'mock-jwt-token-admin',
      user: {
        id: 2,
        nombre: 'Admin Central',
        email: 'admin@vetapp.com',
        rol: 'admin',
        clinica_id: 1
      }
    });
  } else if (email === 'admin.norte@vetapp.com' && password === 'password') {
    res.json({
      success: true,
      token: 'mock-jwt-token-admin-norte',
      user: {
        id: 3,
        nombre: 'Admin Sucursal Norte',
        email: 'admin.norte@vetapp.com',
        rol: 'admin',
        clinica_id: 2
      }
    });
  } else if (email === 'admin.sur@vetapp.com' && password === 'password') {
    res.json({
      success: true,
      token: 'mock-jwt-token-admin-sur',
      user: {
        id: 4,
        nombre: 'Admin Sucursal Sur',
        email: 'admin.sur@vetapp.com',
        rol: 'admin',
        clinica_id: 3
      }
    });
  } else if (email === 'vet@vetapp.com' && password === 'password') {
    res.json({
      success: true,
      token: 'mock-jwt-token-vet',
      user: {
        id: 5,
        nombre: 'Veterinario',
        email: 'vet@vetapp.com',
        rol: 'veterinario',
        clinica_id: 1
      }
    });
  } else if (email === 'recepcion@vetapp.com' && password === 'password') {
    res.json({
      success: true,
      token: 'mock-jwt-token-recepcion',
      user: {
        id: 6,
        nombre: 'Recepcionista',
        email: 'recepcion@vetapp.com',
        rol: 'recepcionista',
        clinica_id: 1
      }
    });
  } else {
    res.status(401).json({
      success: false,
      mensaje: 'Credenciales inválidas'
    });
  }
});

// Rutas de propietarios
app.get('/api/propietarios', propietariosController.getAllPropietarios);
app.get('/api/propietarios/:id', propietariosController.getPropietarioById);
app.post('/api/propietarios', propietariosController.createPropietario);
app.put('/api/propietarios/:id', propietariosController.updatePropietario);
app.delete('/api/propietarios/:id', propietariosController.deletePropietario);

// Rutas de pacientes
app.get('/api/pacientes', pacientesController.getAllPacientes);
app.get('/api/pacientes/:id', pacientesController.getPacienteById);
app.post('/api/pacientes', pacientesController.createPaciente);
app.put('/api/pacientes/:id', pacientesController.updatePaciente);
app.delete('/api/pacientes/:id', pacientesController.deletePaciente);
app.get('/api/propietarios/:propietarioId/pacientes', pacientesController.getPacientesByPropietario);

// Rutas de historiales
app.get('/api/historiales', historialesController.getAllHistoriales);
app.get('/api/historiales/:id', historialesController.getHistorialById);
app.post('/api/historiales', historialesController.createHistorial);
app.put('/api/historiales/:id', historialesController.updateHistorial);
app.delete('/api/historiales/:id', historialesController.deleteHistorial);
app.get('/api/pacientes/:pacienteId/historiales', historialesController.getHistorialesByPaciente);

// Rutas de inventario
app.get('/api/inventario', inventarioController.getAllProductos);
app.get('/api/inventario/:id', inventarioController.getProductoById);
app.post('/api/inventario', inventarioController.createProducto);
app.put('/api/inventario/:id', inventarioController.updateProducto);
app.delete('/api/inventario/:id', inventarioController.deleteProducto);
app.patch('/api/inventario/:id/stock', inventarioController.updateStock);

// Rutas de facturación
app.get('/api/facturas', facturacionController.getAllFacturas);
app.get('/api/facturas/:id', facturacionController.getFacturaById);
app.post('/api/facturas', facturacionController.createFactura);
app.put('/api/facturas/:id', facturacionController.updateFactura);
app.delete('/api/facturas/:id', facturacionController.deleteFactura);

// Rutas de sala de espera
app.get('/api/sala-espera/espera', salaEsperaController.getPacientesEnEspera);
app.get('/api/sala-espera/consulta', salaEsperaController.getPacientesEnConsulta);
app.get('/api/sala-espera/hospitalizados', salaEsperaController.getPacientesHospitalizados);
app.get('/api/sala-espera/hospitalizados/:id', salaEsperaController.getDetalleHospitalizacion);
app.post('/api/sala-espera', salaEsperaController.agregarPacienteEspera);
app.put('/api/sala-espera/:id/consulta', salaEsperaController.moverAConsulta);
app.put('/api/sala-espera/:id/hospitalizacion', salaEsperaController.moverAHospitalizacion);
app.put('/api/sala-espera/:id/hospitalizacion/actualizar', salaEsperaController.actualizarHospitalizacion);
app.put('/api/sala-espera/:id/prioridad', salaEsperaController.actualizarPrioridad);
app.delete('/api/sala-espera/:id', salaEsperaController.finalizarAtencion);

// Rutas de clínicas
app.get('/api/clinicas', clinicasController.getAllClinicas);
app.get('/api/clinicas/:id', clinicasController.getClinicaById);
app.post('/api/clinicas', clinicasController.createClinica);
app.put('/api/clinicas/:id', clinicasController.updateClinica);
app.delete('/api/clinicas/:id', clinicasController.deleteClinica);
app.get('/api/clinicas-administradores/:clinica_id?', clinicasController.getAdministradoresDisponibles);
app.post('/api/cambiar-clinica', clinicasController.cambiarClinicaActiva);

// Rutas de usuarios
app.get('/api/usuarios', usuariosController.getAllUsuarios);
app.get('/api/usuarios/:id', usuariosController.getUsuarioById);
app.post('/api/usuarios', usuariosController.createUsuario);
app.put('/api/usuarios/:id', usuariosController.updateUsuario);
app.delete('/api/usuarios/:id', usuariosController.deleteUsuario);
app.get('/api/usuarios-por-rol', usuariosController.getUsuariosByRol);
app.put('/api/usuarios/:id/cambiar-password', usuariosController.cambiarPassword);

// Rutas de permisos
app.post('/api/permisos/verificar', permisosController.verificarPermiso);
app.get('/api/permisos/usuario/:usuario_id', permisosController.getPermisosByUsuario);

// Rutas de notificaciones
app.get('/api/notificaciones/usuario/:usuario_id', notificacionesController.getNotificacionesByUsuario);
app.put('/api/notificaciones/:id/leida', notificacionesController.marcarComoLeida);
app.put('/api/notificaciones/usuario/:usuario_id/leidas', notificacionesController.marcarTodasComoLeidas);
app.delete('/api/notificaciones/:id', notificacionesController.eliminarNotificacion);

// Iniciar servidor
const startServer = async () => {
  try {
    // Verificar conexión a la base de datos
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('No se pudo conectar a la base de datos. Verificar configuración.');
      process.exit(1);
    }
    
    app.listen(PORT, () => {
      console.log(`Servidor ejecutándose en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer(); 