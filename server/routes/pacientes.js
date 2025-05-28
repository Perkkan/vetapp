const express = require('express');
const router = express.Router();
const pacientesController = require('../controllers/pacientesController');
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

// Apply verifyToken middleware to all paciente routes
router.use(verifyToken);

// Define routes for pacientes with specific permissions
router.get('/', hasPermiso('pacientes_ver'), pacientesController.getAllPacientes);

router.post('/',
    hasPermiso('pacientes_crear'),
    [
        body('nombre').notEmpty().withMessage('El nombre es requerido').bail().isString().withMessage('El nombre debe ser una cadena de texto').bail().trim().isLength({ max: 100 }).withMessage('El nombre no debe exceder los 100 caracteres'),
        body('especie').optional({ checkFalsy: true }).isString().withMessage('La especie debe ser una cadena de texto').bail().trim().isLength({ max: 50 }).withMessage('La especie no debe exceder los 50 caracteres'),
        body('raza').optional({ checkFalsy: true }).isString().withMessage('La raza debe ser una cadena de texto').bail().trim().isLength({ max: 50 }).withMessage('La raza no debe exceder los 50 caracteres'),
        body('fecha_nacimiento').optional({ checkFalsy: true }).isISO8601().withMessage('La fecha de nacimiento debe tener formato ISO8601 (YYYY-MM-DD)'),
        body('sexo').optional({ checkFalsy: true }).isIn(['M', 'H', 'Desconocido']).withMessage('El sexo debe ser M, H o Desconocido'),
        body('propietario_id').notEmpty().withMessage('El ID del propietario es requerido').bail().isInt({ min: 1 }).withMessage('El ID del propietario debe ser un entero positivo'),
        body('peso').optional({ checkFalsy: true }).isDecimal().withMessage('El peso debe ser un valor decimal'),
        // 'estado' en la tabla pacientes de schema.sql es ENUM('Activo', 'Inactivo')
        // El controlador createPaciente no usa 'estado', lo setea a 'Activo' (true) por defecto.
        // Si se quisiera pasar, la validación sería:
        // body('estado').optional({ checkFalsy: true }).isIn(['Activo', 'Inactivo']).withMessage('El estado debe ser Activo o Inactivo'),
        // Para la tabla 'pacientes' en schema.sql, 'notas' y 'chip_id' no existen.
        // El controlador createPaciente usa 'color', 'esterilizado', 'alergias', 'enfermedades_previas', 'clinica_id'.
        // Validando los campos que el controlador SÍ espera:
        body('color').optional({ checkFalsy: true }).isString().trim().isLength({ max: 50 }),
        body('esterilizado').optional().isBoolean(),
        body('alergias').optional({ checkFalsy: true }).isString(),
        body('enfermedades_previas').optional({ checkFalsy: true }).isString(),
        body('clinica_id').notEmpty().withMessage('El ID de la clínica es requerido').bail().isInt({ min: 1 }).withMessage('El ID de la clínica debe ser un entero positivo')
    ],
    handleValidationErrors,
    pacientesController.createPaciente
);

router.get('/:id',
    hasPermiso('pacientes_ver'),
    [
        param('id').isInt({ min: 1 }).withMessage('El ID del paciente debe ser un entero positivo')
    ],
    handleValidationErrors,
    pacientesController.getPacienteById
);

router.put('/:id',
    hasPermiso('pacientes_editar'),
    [
        param('id').isInt({ min: 1 }).withMessage('El ID del paciente debe ser un entero positivo'),
        body('nombre').optional().isString().withMessage('El nombre debe ser una cadena de texto').bail().trim().isLength({ max: 100 }).withMessage('El nombre no debe exceder los 100 caracteres'),
        body('especie').optional().isString().withMessage('La especie debe ser una cadena de texto').bail().trim().isLength({ max: 50 }).withMessage('La especie no debe exceder los 50 caracteres'),
        body('raza').optional().isString().withMessage('La raza debe ser una cadena de texto').bail().trim().isLength({ max: 50 }).withMessage('La raza no debe exceder los 50 caracteres'),
        body('fecha_nacimiento').optional().isISO8601().withMessage('La fecha de nacimiento debe tener formato ISO8601 (YYYY-MM-DD)'),
        body('sexo').optional().isIn(['M', 'H', 'Desconocido']).withMessage('El sexo debe ser M, H o Desconocido'),
        body('propietario_id').optional().isInt({ min: 1 }).withMessage('El ID del propietario debe ser un entero positivo'),
        body('peso').optional().isDecimal().withMessage('El peso debe ser un valor decimal'),
        // El controlador updatePaciente espera 'activo' (boolean) en lugar de 'estado' (string)
        body('activo').optional().isBoolean().withMessage('El estado activo debe ser un valor booleano (true/false)'),
        // Validando los campos que el controlador SÍ espera para update:
        body('color').optional({ checkFalsy: true }).isString().trim().isLength({ max: 50 }),
        body('esterilizado').optional().isBoolean(),
        body('alergias').optional({ checkFalsy: true }).isString(),
        body('enfermedades_previas').optional({ checkFalsy: true }).isString()
        // clinica_id no se suele actualizar en un PUT de paciente si es una FK de contexto,
        // pero si el controlador lo permite, añadir:
        // body('clinica_id').optional().isInt({ min: 1 }).withMessage('El ID de la clínica debe ser un entero positivo')
    ],
    handleValidationErrors,
    pacientesController.updatePaciente
);

router.delete('/:id',
    hasPermiso('pacientes_eliminar'),
    [
        param('id').isInt({ min: 1 }).withMessage('El ID del paciente debe ser un entero positivo')
    ],
    handleValidationErrors,
    pacientesController.deletePaciente
);

router.get('/por-propietario/:propietarioId',
    hasPermiso('pacientes_ver_por_propietario'),
    [
        param('propietarioId').isInt({ min: 1 }).withMessage('El ID del propietario debe ser un entero positivo')
    ],
    handleValidationErrors,
    pacientesController.getPacientesByPropietario
);

module.exports = router;
