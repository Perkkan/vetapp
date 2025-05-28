const express = require('express');
const router = express.Router();
const propietariosController = require('../controllers/propietariosController');
const { verifyToken, hasPermiso } = require('../middleware/auth');
const { body, param, validationResult } = require('express-validator');

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

router.use(verifyToken);

// Rutas para propietarios
router.get('/', hasPermiso('propietarios_ver'), propietariosController.getAllPropietarios);

router.post('/',
    hasPermiso('propietarios_crear'),
    [
        body('nombre').notEmpty().withMessage('El nombre es requerido').bail().isString().withMessage('El nombre debe ser una cadena de texto').bail().trim().isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
        body('email').optional({ checkFalsy: true }).isEmail().withMessage('Debe ser un email válido').bail().normalizeEmail().isLength({ max: 100 }).withMessage('El email no debe exceder los 100 caracteres'),
        body('telefono').optional({ checkFalsy: true }).isString().withMessage('El teléfono debe ser una cadena de texto').bail().trim().isLength({ max: 20 }).withMessage('El teléfono no debe exceder los 20 caracteres'),
        body('direccion').optional({ checkFalsy: true }).isString().withMessage('La dirección debe ser una cadena de texto').bail().trim(),
        body('nif').optional({ checkFalsy: true }).isString().withMessage('El NIF debe ser una cadena de texto').bail().trim().isLength({ max: 20 }).withMessage('El NIF no debe exceder los 20 caracteres'),
        body('notas').optional({ checkFalsy: true }).isString().withMessage('Las notas deben ser una cadena de texto').bail().trim(),
        // Aunque clinica_id y usuario_id no están en la tabla propietarios de schema.sql, 
        // el controlador los usa. Validarlos si se espera que lleguen en el body.
        body('clinica_id').notEmpty().withMessage('El ID de la clínica es requerido').bail().isInt({ min: 1 }).withMessage('El ID de la clínica debe ser un entero positivo'),
        body('usuario_id').optional({ checkFalsy: true }).isInt({ min: 1 }).withMessage('El ID de usuario debe ser un entero positivo')
    ],
    handleValidationErrors,
    propietariosController.createPropietario
);

router.get('/:id',
    hasPermiso('propietarios_ver'),
    [
        param('id').isInt({ min: 1 }).withMessage('El ID del propietario debe ser un entero positivo')
    ],
    handleValidationErrors,
    propietariosController.getPropietarioById
);

router.put('/:id',
    hasPermiso('propietarios_editar'),
    [
        param('id').isInt({ min: 1 }).withMessage('El ID del propietario debe ser un entero positivo'),
        body('nombre').optional().isString().withMessage('El nombre debe ser una cadena de texto').bail().trim().isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
        body('email').optional().isEmail().withMessage('Debe ser un email válido').bail().normalizeEmail().isLength({ max: 100 }).withMessage('El email no debe exceder los 100 caracteres'),
        body('telefono').optional().isString().withMessage('El teléfono debe ser una cadena de texto').bail().trim().isLength({ max: 20 }).withMessage('El teléfono no debe exceder los 20 caracteres'),
        body('direccion').optional().isString().withMessage('La dirección debe ser una cadena de texto').bail().trim(),
        body('nif').optional().isString().withMessage('El NIF debe ser una cadena de texto').bail().trim().isLength({ max: 20 }).withMessage('El NIF no debe exceder los 20 caracteres'),
        body('notas').optional().isString().withMessage('Las notas deben ser una cadena de texto').bail().trim(),
        body('usuario_id').optional({ checkFalsy: true }).isInt({ min: 1 }).withMessage('El ID de usuario debe ser un entero positivo'),
        body('activo').optional().isBoolean().withMessage('El estado activo debe ser un valor booleano (true/false)')
        // clinica_id no se suele actualizar en un PUT de propietario si es una FK de contexto,
        // pero si el controlador lo permite, añadir:
        // body('clinica_id').optional().isInt({ min: 1 }).withMessage('El ID de la clínica debe ser un entero positivo')
    ],
    handleValidationErrors,
    propietariosController.updatePropietario
);

router.delete('/:id',
    hasPermiso('propietarios_eliminar'),
    [
        param('id').isInt({ min: 1 }).withMessage('El ID del propietario debe ser un entero positivo')
    ],
    handleValidationErrors,
    propietariosController.deletePropietario
);

module.exports = router;
