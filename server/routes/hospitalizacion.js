const express = require('express');
const router = express.Router();
const salaEsperaController = require('../controllers/salaEsperaController'); // Ajusta la ruta si es necesario
const { verifyToken, hasPermiso } = require('../middleware/auth');

router.use(verifyToken);

// Rutas existentes de server/index.js para hospitalizacion (que usaban salaEsperaController)
router.get('/', hasPermiso('hospitalizacion_ver'), salaEsperaController.getPacientesHospitalizados);
router.get('/:id', hasPermiso('hospitalizacion_ver'), salaEsperaController.getDetalleHospitalizacion);
// La siguiente ruta en server/index.js era PUT /api/sala-espera/:id/hospitalizacion, aquí la adaptamos
// Podría necesitar un permiso como 'hospitalizacion_crear' o 'hospitalizacion_editar'
router.post('/:id/hospitalizar', hasPermiso('hospitalizacion_crear'), salaEsperaController.moverAHospitalizacion); 
router.put('/:id/actualizar', hasPermiso('hospitalizacion_editar'), salaEsperaController.actualizarHospitalizacion);

module.exports = router;
