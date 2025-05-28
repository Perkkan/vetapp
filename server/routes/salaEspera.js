const express = require('express');
const router = express.Router();
const salaEsperaController = require('../controllers/salaEsperaController');
const { verifyToken, hasPermiso } = require('../middleware/auth');

// Apply verifyToken middleware to all salaEspera routes
router.use(verifyToken);

// Get lists of patients in different states
router.get('/espera', hasPermiso('sala_espera_ver'), salaEsperaController.getPacientesEnEspera);
router.get('/consulta', hasPermiso('sala_espera_ver'), salaEsperaController.getPacientesEnConsulta);
// GET /hospitalizados and GET /hospitalizados/:id are now in hospitalizacion.js

// Actions on patients in 'espera' state
// POST /espera was originally POST /api/sala-espera in server/index.js
router.post('/', hasPermiso('sala_espera_gestionar'), salaEsperaController.agregarPacienteEspera); 
router.put('/espera/:id/consulta', hasPermiso('sala_espera_gestionar'), salaEsperaController.moverAConsulta); 
router.put('/espera/:id/prioridad', hasPermiso('sala_espera_gestionar'), salaEsperaController.actualizarPrioridad); 

// Actions on patients in 'consulta' state
// PUT /consulta/:id/hospitalizar is now handled by POST /api/hospitalizacion/:id/hospitalizar

// General action: Finalize attention / remove from sala_espera system
router.delete('/:id', hasPermiso('sala_espera_gestionar'), salaEsperaController.finalizarAtencion); 

module.exports = router;
