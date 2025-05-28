const express = require('express');
const router = express.Router();
const permisosController = require('../controllers/permisosController');
const { verifyToken, hasRole } = require('../middleware/auth');

router.use(verifyToken);

// Proteger estas rutas, quizás solo para superadmin o admin con permisos especiales
router.post('/verificar', hasRole(['superadmin', 'admin']), permisosController.verificarPermiso);
router.get('/usuario/:usuario_id', hasRole(['superadmin', 'admin']), permisosController.getPermisosByUsuario);

module.exports = router;
