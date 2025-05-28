const express = require('express');
const router = express.Router();
// const citasController = require('../controllers/citasController'); // Does not exist
const { verifyToken, hasPermiso } = require('../middleware/auth');

router.use(verifyToken);

const notImplemented = (req, res) => {
    res.status(501).json({ message: 'Not Implemented: Controller for citas is missing.' });
};

router.get('/', hasPermiso('citas_ver'), notImplemented);
router.post('/', hasPermiso('citas_crear'), notImplemented);
router.get('/:id', hasPermiso('citas_ver'), notImplemented);
router.put('/:id', hasPermiso('citas_editar'), notImplemented);
router.delete('/:id', hasPermiso('citas_eliminar'), notImplemented);

module.exports = router;
