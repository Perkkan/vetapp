const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

// Ruta de login
router.post('/login', authController.login);

// Ruta para validar token
router.get('/validate-token', verifyToken, authController.validateToken);

// Ruta para registrar usuario (protegida, solo para admins)
router.post('/register', verifyToken, authController.register);

// Ruta para obtener permisos del usuario actual
router.get('/permisos', verifyToken, authController.getUserPermisos);

// Ruta para cambiar contraseña
router.post('/cambiar-password', verifyToken, authController.changePassword);

// Rutas para recuperación de contraseña
router.post('/request-reset', authController.requestPasswordReset);
router.post('/reset-password', authController.resetPassword);

module.exports = router; 