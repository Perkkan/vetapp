const express = require('express');
const router = express.Router();
const gohighlevelController = require('../controllers/gohighlevelController');

// Define routes
router.get('/contacts', gohighlevelController.getContacts);
router.post('/contacts', gohighlevelController.createContact);
router.put('/contacts/:id', gohighlevelController.updateContact);
router.delete('/contacts/:id', gohighlevelController.deleteContact);

router.get('/appointments', gohighlevelController.getAppointments);
router.post('/appointments', gohighlevelController.createAppointment);
router.put('/appointments/:id', gohighlevelController.updateAppointment);
router.delete('/appointments/:id', gohighlevelController.deleteAppointment);

module.exports = router;
