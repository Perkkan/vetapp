import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Modal, Form } from 'react-bootstrap';

const GoHighLevel = () => {
  const [contacts, setContacts] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [contactFormAction, setContactFormAction] = useState('create');
  const [appointmentFormAction, setAppointmentFormAction] = useState('create');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [contactsRes, appointmentsRes] = await Promise.all([
        axios.get('/api/gohighlevel/contacts'),
        axios.get('/api/gohighlevel/appointments')
      ]);
      setContacts(contactsRes.data.contacts || []);
      setAppointments(appointmentsRes.data.appointments || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data from GoHighLevel');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleShowContactModal = (action, contact = null) => {
    setContactFormAction(action);
    setSelectedContact(contact);
    setShowContactModal(true);
  };

  const handleCloseContactModal = () => {
    setShowContactModal(false);
    setSelectedContact(null);
  };

  const handleShowAppointmentModal = (action, appointment = null) => {
    setAppointmentFormAction(action);
    setSelectedAppointment(appointment);
    setShowAppointmentModal(true);
  };

  const handleCloseAppointmentModal = () => {
    setShowAppointmentModal(false);
    setSelectedAppointment(null);
  };

  const handleContactFormSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const contactData = Object.fromEntries(formData.entries());

    try {
      if (contactFormAction === 'create') {
        await axios.post('/api/gohighlevel/contacts', contactData);
      } else {
        await axios.put(`/api/gohighlevel/contacts/${selectedContact.id}`, contactData);
      }
      fetchData();
      handleCloseContactModal();
    } catch (error) {
      console.error('Error submitting contact form:', error);
    }
  };

  const handleDeleteContact = async (id) => {
    try {
      await axios.delete(`/api/gohighlevel/contacts/${id}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  const handleAppointmentFormSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const appointmentData = Object.fromEntries(formData.entries());

    try {
      if (appointmentFormAction === 'create') {
        await axios.post('/api/gohighlevel/appointments', appointmentData);
      } else {
        await axios.put(`/api/gohighlevel/appointments/${selectedAppointment.id}`, appointmentData);
      }
      fetchData();
      handleCloseAppointmentModal();
    } catch (error) {
      console.error('Error submitting appointment form:', error);
    }
  };

  const handleDeleteAppointment = async (id) => {
    try {
      await axios.delete(`/api/gohighlevel/appointments/${id}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>GoHighLevel Integration</h2>

      <h3>Contacts</h3>
      <Button variant="primary" onClick={() => handleShowContactModal('create')}>
        Create Contact
      </Button>
      <ul>
        {contacts.map(contact => (
          <li key={contact.id}>
            {contact.firstName} {contact.lastName}
            <Button variant="info" size="sm" onClick={() => handleShowContactModal('update', contact)}>
              Edit
            </Button>
            <Button variant="danger" size="sm" onClick={() => handleDeleteContact(contact.id)}>
              Delete
            </Button>
          </li>
        ))}
      </ul>

      <h3>Appointments</h3>
      <Button variant="primary" onClick={() => handleShowAppointmentModal('create')}>
        Create Appointment
      </Button>
      <ul>
        {appointments.map(appointment => (
          <li key={appointment.id}>
            {appointment.title} at {appointment.startTime}
            <Button variant="info" size="sm" onClick={() => handleShowAppointmentModal('update', appointment)}>
              Edit
            </Button>
            <Button variant="danger" size="sm" onClick={() => handleDeleteAppointment(appointment.id)}>
              Delete
            </Button>
          </li>
        ))}
      </ul>

      <Modal show={showContactModal} onHide={handleCloseContactModal}>
        <Modal.Header closeButton>
          <Modal.Title>{contactFormAction === 'create' ? 'Create' : 'Update'} Contact</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleContactFormSubmit}>
            <Form.Group>
              <Form.Label>First Name</Form.Label>
              <Form.Control type="text" name="firstName" defaultValue={selectedContact?.firstName} required />
            </Form.Group>
            <Form.Group>
              <Form.Label>Last Name</Form.Label>
              <Form.Control type="text" name="lastName" defaultValue={selectedContact?.lastName} required />
            </Form.Group>
            <Form.Group>
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" name="email" defaultValue={selectedContact?.email} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Phone</Form.Label>
              <Form.Control type="text" name="phone" defaultValue={selectedContact?.phone} />
            </Form.Group>
            <Button variant="primary" type="submit">
              Save
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={showAppointmentModal} onHide={handleCloseAppointmentModal}>
        <Modal.Header closeButton>
          <Modal.Title>{appointmentFormAction === 'create' ? 'Create' : 'Update'} Appointment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAppointmentFormSubmit}>
            <Form.Group>
              <Form.Label>Title</Form.Label>
              <Form.Control type="text" name="title" defaultValue={selectedAppointment?.title} required />
            </Form.Group>
            <Form.Group>
              <Form.Label>Start Time</Form.Label>
              <Form.Control type="datetime-local" name="startTime" defaultValue={selectedAppointment?.startTime} required />
            </Form.Group>
            <Form.Group>
              <Form.Label>End Time</Form.Label>
              <Form.Control type="datetime-local" name="endTime" defaultValue={selectedAppointment?.endTime} required />
            </Form.Group>
            <Form.Group>
              <Form.Label>Contact</Form.Label>
              <Form.Control as="select" name="contactId" defaultValue={selectedAppointment?.contactId} required>
                <option value="">Select a contact</option>
                {contacts.map(contact => (
                  <option key={contact.id} value={contact.id}>
                    {contact.firstName} {contact.lastName}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Button variant="primary" type="submit">
              Save
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default GoHighLevel;
