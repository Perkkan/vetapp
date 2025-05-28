const express = require('express');
const router = express.Router();
const inventarioController = require('../controllers/inventarioController');
const { verifyToken, hasRole, hasPermiso } = require('../middleware/auth');

// Apply verifyToken middleware to all inventario routes
router.use(verifyToken);

// Define routes for inventario
router.get('/', inventarioController.getAllProductos); // Permiso: 'inventario_ver'
router.get('/:id', inventarioController.getProductoById); // Permiso: 'inventario_ver'

// Routes requiring specific permissions
router.post('/', hasPermiso('inventario_crear'), inventarioController.createProducto);
router.put('/:id', hasPermiso('inventario_editar'), inventarioController.updateProducto);
router.patch('/:id/stock', hasPermiso('inventario_actualizar_stock'), inventarioController.updateStock); // Using PATCH for partial update (stock)
router.delete('/:id', hasPermiso('inventario_eliminar'), inventarioController.deleteProducto);

module.exports = router;
