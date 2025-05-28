const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const { verifyToken, hasRole, hasPermiso, sameClinica } = require('../middleware/auth');
const { body, param, validationResult } = require('express-validator');

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Apply verifyToken middleware to all usuarios routes
router.use(verifyToken);

// Define routes for usuarios

// Get all users (potentially filtered by clinica_id in query)
router.get('/', hasPermiso('usuarios_ver'), usuariosController.getAllUsuarios);

// Get users by rol (e.g., /?rol=veterinario)
// query 'rol' validation can be added if strict validation is needed for query params
router.get('/rol', hasPermiso('usuarios_ver'), usuariosController.getUsuariosByRol);


// Create user
router.post('/',
    hasPermiso('usuarios_crear'),
    [
        body('nombre').notEmpty().withMessage('El nombre es requerido').bail().isString().withMessage('El nombre debe ser una cadena de texto').bail().trim().isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
        body('email').notEmpty().withMessage('El email es requerido').bail().isEmail().withMessage('Debe ser un email válido').bail().normalizeEmail().isLength({ max: 100 }).withMessage('El email no debe exceder los 100 caracteres'),
        body('password').notEmpty().withMessage('La contraseña es requerida').bail().isString().withMessage('La contraseña debe ser una cadena de texto').bail().isLength({ min: 8, max: 100 }).withMessage('La contraseña debe tener entre 8 y 100 caracteres'),
        body('rol_id').notEmpty().withMessage('El ID del rol es requerido').bail().isInt({ min: 1 }).withMessage('El ID del rol debe ser un entero positivo'),
        body('clinica_id').optional({ checkFalsy: true }).isInt({ min: 1 }).withMessage('El ID de la clínica debe ser un entero positivo'),
        body('telefono').optional({ checkFalsy: true }).isString().withMessage('El teléfono debe ser una cadena de texto').bail().trim().isLength({ max: 20 }).withMessage('El teléfono no debe exceder los 20 caracteres'),
        body('direccion').optional({ checkFalsy: true }).isString().withMessage('La dirección debe ser una cadena de texto').bail().trim(),
        body('activo').optional().isBoolean().withMessage('El estado activo debe ser un valor booleano')
    ],
    handleValidationErrors,
    usuariosController.createUsuario
);


// Get user by ID
router.get('/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('El ID de usuario debe ser un entero positivo')
    ],
    handleValidationErrors,
    (req, res, next) => { // Middleware de autorización después de validación de param
        if (req.user.id === parseInt(req.params.id)) {
            return usuariosController.getUsuarioById(req, res);
        }
        return hasPermiso('usuarios_ver')(req, res, next);
    },
    usuariosController.getUsuarioById
);

// Update user
router.put('/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('El ID de usuario debe ser un entero positivo'),
        body('nombre').optional().isString().withMessage('El nombre debe ser una cadena de texto').bail().trim().isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
        body('email').optional().isEmail().withMessage('Debe ser un email válido').bail().normalizeEmail().isLength({ max: 100 }).withMessage('El email no debe exceder los 100 caracteres'),
        body('rol_id').optional().isInt({ min: 1 }).withMessage('El ID del rol debe ser un entero positivo'),
        body('clinica_id').optional({ checkFalsy: true }).isInt({ min: 1 }).withMessage('El ID de la clínica debe ser un entero positivo'),
        body('telefono').optional({ checkFalsy: true }).isString().withMessage('El teléfono debe ser una cadena de texto').bail().trim().isLength({ max: 20 }).withMessage('El teléfono no debe exceder los 20 caracteres'),
        body('direccion').optional({ checkFalsy: true }).isString().withMessage('La dirección debe ser una cadena de texto').bail().trim(),
        body('activo').optional().isBoolean().withMessage('El estado activo debe ser un valor booleano')
    ],
    handleValidationErrors,
    (req, res, next) => { // Middleware de autorización después de validación
        if (req.user.id === parseInt(req.params.id)) {
            if (req.body.rol_id || req.body.clinica_id !== undefined || req.body.activo !== undefined) {
                // Si intenta modificar campos sensibles, necesita permiso 'usuarios_editar'
                return hasPermiso('usuarios_editar')(req, res, next);
            }
            return usuariosController.updateUsuario(req, res); // Usuario actualizando su propio perfil (campos no sensibles)
        }
        return hasPermiso('usuarios_editar')(req, res, next); // Admin actualizando cualquier campo
    },
    usuariosController.updateUsuario
);

// User can change their own password.
router.post('/:id/cambiar-password',
    [
        param('id').isInt({ min: 1 }).withMessage('El ID de usuario debe ser un entero positivo'),
        body('password_actual').notEmpty().withMessage('La contraseña actual es requerida').bail().isString().withMessage('La contraseña actual debe ser una cadena de texto'),
        body('password_nueva').notEmpty().withMessage('La nueva contraseña es requerida').bail().isString().withMessage('La nueva contraseña debe ser una cadena de texto').bail().isLength({ min: 8, max: 100 }).withMessage('La nueva contraseña debe tener entre 8 y 100 caracteres')
    ],
    handleValidationErrors,
    (req, res, next) => { // Middleware de autorización después de validación
        // El controller ya verifica si el usuario existe.
        // La lógica de si el usuario autenticado puede cambiar la contraseña de este :id
        // debe estar en el controller o en un middleware de autorización específico si es complejo.
        // Por ahora, la autorización original se mantiene:
        if (req.user.id !== parseInt(req.params.id)) {
            return res.status(403).json({ message: "Solo puedes cambiar tu propia contraseña por esta vía." });
        }
        next();
    },
    usuariosController.cambiarPassword
);

// Delete user
router.delete('/:id',
    hasPermiso('usuarios_eliminar'), // Permiso primero
    [
        param('id').isInt({ min: 1 }).withMessage('El ID de usuario debe ser un entero positivo')
    ],
    handleValidationErrors,
    usuariosController.deleteUsuario
);

module.exports = router;
