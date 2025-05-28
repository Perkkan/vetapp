const express = require('express');
const router = express.Router();
const clinicasController = require('../controllers/clinicasController');
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

// Apply verifyToken middleware to all clinicas routes by default
// verifyToken is applied globally at the start of this router.
// Specific authorization middlewares (hasPermiso, hasRole, sameClinica) are applied per route.
router.use(verifyToken);

// Define routes for clinicas
router.get('/',
    hasPermiso('clinicas_ver'),
    clinicasController.getAllClinicas
);

router.get('/:id',
    hasPermiso('clinicas_ver'),
    [
        param('id').isInt({ min: 1 }).withMessage('El ID de la clínica debe ser un entero positivo')
    ],
    handleValidationErrors,
    clinicasController.getClinicaById
);

router.post('/',
    hasPermiso('clinicas_crear'), // Authorization middleware
    [ // Validation array
        body('nombre').notEmpty().withMessage('El nombre es requerido').bail().isString().withMessage('El nombre debe ser una cadena de texto').bail().trim().isLength({ max: 100 }).withMessage('El nombre no debe exceder los 100 caracteres'),
        body('direccion').notEmpty().withMessage('La dirección es requerida').bail().isString().withMessage('La dirección debe ser una cadena de texto').bail().trim(),
        body('telefono').notEmpty().withMessage('El teléfono es requerido').bail().isString().withMessage('El teléfono debe ser una cadena de texto').bail().trim().isLength({ max: 20 }).withMessage('El teléfono no debe exceder los 20 caracteres'),
        body('email').optional({ checkFalsy: true }).isEmail().withMessage('Debe ser un email válido').bail().normalizeEmail().isLength({ max: 100 }).withMessage('El email no debe exceder los 100 caracteres'),
        body('admin_id').optional({ checkFalsy: true }).isInt({ min: 1 }).withMessage('El ID de administrador debe ser un entero positivo'),
        body('logo_url').optional({ checkFalsy: true }).isURL().withMessage('La URL del logo debe ser válida').bail().isLength({ max: 255 }).withMessage('La URL del logo no debe exceder los 255 caracteres'),
        body('activo').optional().isBoolean().withMessage('El estado activo debe ser un valor booleano (true/false)')
    ],
    handleValidationErrors, // Validation error handler
    clinicasController.createClinica
);

router.put('/:id',
    [hasPermiso('clinicas_editar'), sameClinica], // Authorization middlewares
    [ // Validation array
        param('id').isInt({ min: 1 }).withMessage('El ID de la clínica debe ser un entero positivo'),
        body('nombre').optional().isString().withMessage('El nombre debe ser una cadena de texto').bail().trim().isLength({ max: 100 }).withMessage('El nombre no debe exceder los 100 caracteres'),
        body('direccion').optional().isString().withMessage('La dirección debe ser una cadena de texto').bail().trim(),
        body('telefono').optional().isString().withMessage('El teléfono debe ser una cadena de texto').bail().trim().isLength({ max: 20 }).withMessage('El teléfono no debe exceder los 20 caracteres'),
        body('email').optional({ checkFalsy: true }).isEmail().withMessage('Debe ser un email válido').bail().normalizeEmail().isLength({ max: 100 }).withMessage('El email no debe exceder los 100 caracteres'),
        body('admin_id').optional({ checkFalsy: true }).isInt({ min: 1 }).withMessage('El ID de administrador debe ser un entero positivo'),
        body('logo_url').optional({ checkFalsy: true }).isURL().withMessage('La URL del logo debe ser válida').bail().isLength({ max: 255 }).withMessage('La URL del logo no debe exceder los 255 caracteres'),
        body('activo').optional().isBoolean().withMessage('El estado activo debe ser un valor booleano (true/false)')
    ],
    handleValidationErrors, // Validation error handler
    clinicasController.updateClinica
);

router.delete('/:id',
    hasPermiso('clinicas_eliminar'), // Authorization middleware
    [ // Validation array
        param('id').isInt({ min: 1 }).withMessage('El ID de la clínica debe ser un entero positivo')
    ],
    handleValidationErrors, // Validation error handler
    clinicasController.deleteClinica
);

// Special routes
// For 'administradores-disponibles', an admin might need to see this for their clinic, or superadmin for any.
// No specific validation requested for these, but params could be validated if needed.
router.get('/administradores-disponibles/:clinica_id?',
    hasRole(['superadmin', 'admin']),
    // Optional: param('clinica_id').optional().isInt({ min: 1 }) if validation is desired
    clinicasController.getAdministradoresDisponibles
);

// 'clinicas_acceder' permission is for the 'cambiarClinicaActiva' functionality.
// No specific validation requested for body, but could be added:
// body('userId').notEmpty().isInt(), body('clinicaId').notEmpty().isInt()
router.post('/cambiar-activa',
    hasPermiso('clinicas_acceder'),
    clinicasController.cambiarClinicaActiva
);

module.exports = router;
