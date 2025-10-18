const axios = require('axios');
require('dotenv').config();

const GOHIGHLEVEL_API_KEY = process.env.GOHIGHLEVEL_API_KEY;
const GOHIGHLEVEL_API_URL = 'https://rest.gohighlevel.com/v1';

// Get all contacts
exports.getContacts = async (req, res) => {
  try {
    const response = await axios.get(`${GOHIGHLEVEL_API_URL}/contacts/`, {
      headers: {
        'Authorization': `Bearer ${GOHIGHLEVEL_API_KEY}`
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching contacts from GoHighLevel:', error);
    res.status(500).json({ message: 'Error fetching contacts from GoHighLevel' });
  }
};

// Create a new contact
exports.createContact = async (req, res) => {
  try {
    const response = await axios.post(`${GOHIGHLEVEL_API_URL}/contacts/`, req.body, {
      headers: {
        'Authorization': `Bearer ${GOHIGHLEVEL_API_KEY}`
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error creating contact in GoHighLevel:', error);
    res.status(500).json({ message: 'Error creating contact in GoHighLevel' });
  }
};

// Update a contact
exports.updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.put(`${GOHIGHLEVEL_API_URL}/contacts/${id}`, req.body, {
      headers: {
        'Authorization': `Bearer ${GOHIGHLEVEL_API_KEY}`
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error updating contact in GoHighLevel:', error);
    res.status(500).json({ message: 'Error updating contact in GoHighLevel' });
  }
};

// Delete a contact
exports.deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    await axios.delete(`${GOHIGHLEVEL_API_URL}/contacts/${id}`, {
      headers: {
        'Authorization': `Bearer ${GOHIGHLEVEL_API_KEY}`
      }
    });
    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact in GoHighLevel:', error);
    res.status(500).json({ message: 'Error deleting contact in GoHighLevel' });
  }
};

// Get all appointments
exports.getAppointments = async (req, res) => {
  try {
    const response = await axios.get(`${GOHIGHLEVEL_API_URL}/appointments/`, {
      headers: {
        'Authorization': `Bearer ${GOHIGHLEVEL_API_KEY}`
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching appointments from GoHighLevel:', error);
    res.status(500).json({ message: 'Error fetching appointments from GoHighLevel' });
  }
};

// Create a new appointment
exports.createAppointment = async (req, res) => {
  try {
    const response = await axios.post(`${GOHIGHLEVEL_API_URL}/appointments/`, req.body, {
      headers: {
        'Authorization': `Bearer ${GOHIGHLEVEL_API_KEY}`
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error creating appointment in GoHighLevel:', error);
    res.status(500).json({ message: 'Error creating appointment in GoHighLevel' });
  }
};

// Update an appointment
exports.updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.put(`${GOHIGHLEVEL_API_URL}/appointments/${id}`, req.body, {
      headers: {
        'Authorization': `Bearer ${GOHIGHLEVEL_API_KEY}`
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error updating appointment in GoHighLevel:', error);
    res.status(500).json({ message: 'Error updating appointment in GoHighLevel' });
  }
};

// Delete an appointment
exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    await axios.delete(`${GOHIGHLEVEL_API_URL}/appointments/${id}`, {
      headers: {
        'Authorization': `Bearer ${GOHIGHLEVEL_API_KEY}`
      }
    });
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment in GoHighLevel:', error);
    res.status(500).json({ message: 'Error deleting appointment in GoHighLevel' });
  }
};
