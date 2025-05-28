const express = require('express');
const router = express.Router();
const facturacionController = require('../controllers/facturacionController');
const { verifyToken, hasPermiso } = require('../middleware/auth');

// Apply verifyToken middleware to all facturacion routes
router.use(verifyToken);

// Define routes for facturacion with specific permissions
router.get('/', hasPermiso('facturacion_ver'), facturacionController.getAllFacturas);
router.post('/', hasPermiso('facturacion_crear'), facturacionController.createFactura);
router.get('/:id', hasPermiso('facturacion_ver'), facturacionController.getFacturaById);
router.put('/:id', hasPermiso('facturacion_editar'), facturacionController.updateFactura);
router.delete('/:id', hasPermiso('facturacion_eliminar'), facturacionController.deleteFactura);

module.exports = router;
