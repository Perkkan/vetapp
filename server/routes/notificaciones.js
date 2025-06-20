const express = require('express');
const router = express.Router();
const notificacionesController = require('../controllers/notificacionesController');
const { verifyToken, hasRole } = require('../middleware/auth');

// Aplicar middleware de autenticación a todas las rutas
router.use(verifyToken);

// Obtener notificaciones del usuario actual con paginación
router.get('/', notificacionesController.getNotificaciones);

// Obtener conteo de notificaciones no leídas
router.get('/no-leidas/count', notificacionesController.getUnreadCount);

// Marcar una notificación como leída
router.put('/:id/leer', notificacionesController.markAsRead);

// Marcar todas las notificaciones como leídas
router.put('/leer-todas', notificacionesController.markAllAsRead);

// Eliminar una notificación
// Users should be able to delete their own notifications. Controller should enforce this.
router.delete('/:id', notificacionesController.deleteNotificacion);

// Crear una nueva notificación (para administradores)
router.post('/', hasRole(['admin', 'superadmin']), notificacionesController.createNotificacion);

// Obtener notificaciones por tipo
router.get('/tipo/:tipo', notificacionesController.getNotificacionesByTipo);

module.exports = router; 