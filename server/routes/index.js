const express = require('express');
const router = express.Router();

// Importar rutas
const pacientesRoutes = require('./pacientes');
const citasRoutes = require('./citas');
const historialesRoutes = require('./historiales');
const salaEsperaRoutes = require('./salaEspera');
const hospitalizacionRoutes = require('./hospitalizacion');
const facturacionRoutes = require('./facturacion');
const propietariosRoutes = require('./propietarios');
const clinicasRoutes = require('./clinicas');
const inventarioRoutes = require('./inventario');
const notificacionesRoutes = require('./notificaciones');
const usuariosRoutes = require('./usuarios');
const rolesRoutes = require('./roles');
const authRoutes = require('./auth');

// Definir rutas principales
router.use('/pacientes', pacientesRoutes);
router.use('/citas', citasRoutes);
router.use('/historiales', historialesRoutes);
router.use('/sala-espera', salaEsperaRoutes);
router.use('/hospitalizacion', hospitalizacionRoutes);
router.use('/facturacion', facturacionRoutes);
router.use('/propietarios', propietariosRoutes);
router.use('/clinicas', clinicasRoutes);
router.use('/inventario', inventarioRoutes);
router.use('/notificaciones', notificacionesRoutes);
router.use('/usuarios', usuariosRoutes);
router.use('/roles', rolesRoutes);
router.use('/auth', authRoutes);

// Ruta raíz para verificar que la API está funcionando
router.get('/', (req, res) => {
  res.json({ message: 'API de Sistema Veterinario funcionando correctamente' });
});

module.exports = router; 