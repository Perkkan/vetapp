const express = require('express');
const router = express.Router();
const historialesController = require('../controllers/historialesController');
const { verifyToken, hasPermiso } = require('../middleware/auth');

// Apply verifyToken middleware to all historial routes
router.use(verifyToken);

// Define routes for historiales with specific permissions
router.get('/', hasPermiso('historiales_ver'), historialesController.getAllHistoriales);
router.post('/', hasPermiso('historiales_crear'), historialesController.createHistorial);
router.get('/por-paciente/:pacienteId', hasPermiso('historiales_ver_por_paciente'), historialesController.getHistorialesByPaciente);
router.get('/:id', hasPermiso('historiales_ver'), historialesController.getHistorialById);
router.put('/:id', hasPermiso('historiales_editar'), historialesController.updateHistorial);
router.delete('/:id', hasPermiso('historiales_eliminar'), historialesController.deleteHistorial);

module.exports = router;
