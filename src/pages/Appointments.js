import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, InputGroup, Row, Col, Modal, Alert, Spinner, Badge } from 'react-bootstrap';
import { FaSearch, FaPlusCircle, FaEdit, FaTrashAlt, FaCalendarAlt, FaPaw, FaClock, FaUserAlt } from 'react-icons/fa';

// Datos de ejemplo para citas
const sampleAppointments = [
  {
    id: 1,
    fecha: '2024-04-05',
    hora: '09:30',
    paciente_id: 101,
    paciente_nombre: 'Firulais',
    especie: 'Perro',
    raza: 'Labrador',
    propietario_id: 201,
    propietario_nombre: 'Juan Pérez',
    propietario_telefono: '555-1234',
    motivo: 'Vacunación',
    veterinario_id: 1,
    veterinario_nombre: 'Dr. Martínez',
    estado: 'pendiente',
    notas: 'Vacuna anual antirrábica'
  },
  {
    id: 2,
    fecha: '2024-04-05',
    hora: '10:30',
    paciente_id: 102,
    paciente_nombre: 'Michu',
    especie: 'Gato',
    raza: 'Siamés',
    propietario_id: 202,
    propietario_nombre: 'María González',
    propietario_telefono: '555-5678',
    motivo: 'Control',
    veterinario_id: 2,
    veterinario_nombre: 'Dra. Rodríguez',
    estado: 'pendiente',
    notas: 'Control mensual por problema renal'
  },
  {
    id: 3,
    fecha: '2024-04-05',
    hora: '11:30',
    paciente_id: 103,
    paciente_nombre: 'Rocky',
    especie: 'Perro',
    raza: 'Bulldog',
    propietario_id: 203,
    propietario_nombre: 'Carlos López',
    propietario_telefono: '555-9012',
    motivo: 'Revisión',
    veterinario_id: 1,
    veterinario_nombre: 'Dr. Martínez',
    estado: 'confirmada',
    notas: 'Seguimiento de tratamiento para piel'
  },
  {
    id: 4,
    fecha: '2024-04-06',
    hora: '09:00',
    paciente_id: 104,
    paciente_nombre: 'Luna',
    especie: 'Perro',
    raza: 'Pastor Alemán',
    propietario_id: 204,
    propietario_nombre: 'Roberto Sánchez',
    propietario_telefono: '555-9876',
    motivo: 'Cirugía',
    veterinario_id: 2,
    veterinario_nombre: 'Dra. Rodríguez',
    estado: 'confirmada',
    notas: 'Esterilización programada'
  },
  {
    id: 5,
    fecha: '2024-04-06',
    hora: '14:00',
    paciente_id: 105,
    paciente_nombre: 'Simba',
    especie: 'Gato',
    raza: 'Persa',
    propietario_id: 205,
    propietario_nombre: 'Carla Moreno',
    propietario_telefono: '555-4321',
    motivo: 'Vacunación',
    veterinario_id: 1,
    veterinario_nombre: 'Dr. Martínez',
    estado: 'completada',
    notas: 'Vacuna triple felina'
  }
];

// Datos de ejemplo para pacientes
const samplePatients = [
  { id: 101, nombre: 'Firulais', especie: 'Perro', raza: 'Labrador', propietario_id: 201, propietario_nombre: 'Juan Pérez', propietario_telefono: '555-1234' },
  { id: 102, nombre: 'Michu', especie: 'Gato', raza: 'Siamés', propietario_id: 202, propietario_nombre: 'María González', propietario_telefono: '555-5678' },
  { id: 103, nombre: 'Rocky', especie: 'Perro', raza: 'Bulldog', propietario_id: 203, propietario_nombre: 'Carlos López', propietario_telefono: '555-9012' },
  { id: 104, nombre: 'Luna', especie: 'Perro', raza: 'Pastor Alemán', propietario_id: 204, propietario_nombre: 'Roberto Sánchez', propietario_telefono: '555-9876' },
  { id: 105, nombre: 'Simba', especie: 'Gato', raza: 'Persa', propietario_id: 205, propietario_nombre: 'Carla Moreno', propietario_telefono: '555-4321' }
];

// Datos de ejemplo para veterinarios
const sampleVeterinarians = [
  { id: 1, nombre: 'Dr. Martínez' },
  { id: 2, nombre: 'Dra. Rodríguez' }
];

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]); // Hoy por defecto
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [patients, setPatients] = useState([]);
  const [veterinarians, setVeterinarians] = useState([]);
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    hora: '09:00',
    paciente_id: '',
    motivo: '',
    veterinario_id: '',
    estado: 'pendiente',
    notas: ''
  });

  // Cargar datos iniciales
  useEffect(() => {
    // Simulamos la carga desde una API
    setLoading(true);
    
    // Cargar datos de ejemplo
    setTimeout(() => {
      setAppointments(sampleAppointments);
      setPatients(samplePatients);
      setVeterinarians(sampleVeterinarians);
      setLoading(false);
    }, 1000);
  }, []);

  // Filtrar citas según fecha y término de búsqueda
  const filteredAppointments = appointments.filter(appointment => {
    // Filtrar por fecha
    const matchesDate = appointment.fecha === filterDate;
    
    // Filtrar por término de búsqueda
    const searchFields = [
      appointment.paciente_nombre,
      appointment.propietario_nombre,
      appointment.veterinario_nombre,
      appointment.motivo
    ].map(field => field.toLowerCase());
    
    const matchesSearch = searchTerm === '' || 
                         searchFields.some(field => field.includes(searchTerm.toLowerCase()));
    
    return matchesDate && matchesSearch;
  });

  // Ordenar citas por hora
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    return a.hora.localeCompare(b.hora);
  });

  // Manejar el cambio en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Si selecciona un paciente, completar automáticamente los datos del propietario
    if (name === 'paciente_id') {
      const selectedPatient = patients.find(p => p.id === parseInt(value));
      if (selectedPatient) {
        setFormData(prev => ({
          ...prev,
          paciente_id: selectedPatient.id
        }));
      }
    }
  };

  // Abrir modal para editar cita
  const handleEditClick = (appointment) => {
    setCurrentAppointment(appointment);
    setFormData({
      fecha: appointment.fecha,
      hora: appointment.hora,
      paciente_id: appointment.paciente_id,
      motivo: appointment.motivo,
      veterinario_id: appointment.veterinario_id,
      estado: appointment.estado,
      notas: appointment.notas
    });
    setShowEditModal(true);
  };

  // Abrir modal para eliminar cita
  const handleDeleteClick = (appointment) => {
    setCurrentAppointment(appointment);
    setShowDeleteModal(true);
  };

  // Manejar guardado de nueva cita
  const handleSaveAppointment = () => {
    // Validación básica
    if (!formData.fecha || !formData.hora || !formData.paciente_id || !formData.veterinario_id) {
      setError('Por favor complete los campos requeridos: Fecha, Hora, Paciente y Veterinario');
      return;
    }

    // Validar que no haya otra cita a la misma hora con el mismo veterinario
    const existingAppointment = appointments.find(
      app => app.fecha === formData.fecha && 
             app.hora === formData.hora && 
             app.veterinario_id === parseInt(formData.veterinario_id) &&
             (currentAppointment ? app.id !== currentAppointment.id : true)
    );

    if (existingAppointment) {
      setError(`Ya existe una cita para ${formData.fecha} a las ${formData.hora} con este veterinario`);
      return;
    }

    if (showAddModal) {
      // Crear nueva cita
      const newId = Math.max(...appointments.map(a => a.id), 0) + 1;
      
      // Obtener datos del paciente seleccionado
      const selectedPatient = patients.find(p => p.id === parseInt(formData.paciente_id));
      const selectedVeterinarian = veterinarians.find(v => v.id === parseInt(formData.veterinario_id));
      
      // Crear nueva cita
      const newAppointment = {
        id: newId,
        ...formData,
        paciente_id: parseInt(formData.paciente_id),
        paciente_nombre: selectedPatient ? selectedPatient.nombre : '',
        especie: selectedPatient ? selectedPatient.especie : '',
        raza: selectedPatient ? selectedPatient.raza : '',
        propietario_id: selectedPatient ? selectedPatient.propietario_id : 0,
        propietario_nombre: selectedPatient ? selectedPatient.propietario_nombre : '',
        propietario_telefono: selectedPatient ? selectedPatient.propietario_telefono : '',
        veterinario_id: parseInt(formData.veterinario_id),
        veterinario_nombre: selectedVeterinarian ? selectedVeterinarian.nombre : ''
      };

      // Actualizar la lista de citas
      setAppointments([...appointments, newAppointment]);
      
      // Cerrar modal y limpiar formulario
      setShowAddModal(false);
    } else if (showEditModal) {
      // Actualizar cita existente
      const selectedVeterinarian = veterinarians.find(v => v.id === parseInt(formData.veterinario_id));
      
      const updatedAppointments = appointments.map(appointment => {
        if (appointment.id === currentAppointment.id) {
          return {
            ...appointment,
            ...formData,
            paciente_id: parseInt(formData.paciente_id),
            veterinario_id: parseInt(formData.veterinario_id),
            veterinario_nombre: selectedVeterinarian ? selectedVeterinarian.nombre : appointment.veterinario_nombre
          };
        }
        return appointment;
      });

      setAppointments(updatedAppointments);
      
      // Cerrar modal
      setShowEditModal(false);
    }
    
    // Limpiar estado
    setCurrentAppointment(null);
    setFormData({
      fecha: new Date().toISOString().split('T')[0],
      hora: '09:00',
      paciente_id: '',
      motivo: '',
      veterinario_id: '',
      estado: 'pendiente',
      notas: ''
    });
    setError('');
  };

  // Manejar eliminación de cita
  const handleDeleteAppointment = () => {
    // Eliminar cita
    const updatedAppointments = appointments.filter(appointment => appointment.id !== currentAppointment.id);
    setAppointments(updatedAppointments);
    
    // Cerrar modal
    setShowDeleteModal(false);
    setCurrentAppointment(null);
  };

  // Obtener color de estado para las badges
  const getStatusColor = (status) => {
    switch (status) {
      case 'pendiente':
        return 'warning';
      case 'confirmada':
        return 'primary';
      case 'completada':
        return 'success';
      case 'cancelada':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  // Formatear fecha para mostrar
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestión de Citas</h2>
        <Button 
          variant="primary"
          onClick={() => setShowAddModal(true)}
          className="d-flex align-items-center"
        >
          <FaPlusCircle className="me-2" />
          Nueva Cita
        </Button>
      </div>

      {/* Filtros */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3 mb-md-0">
                <Form.Label>Fecha</Form.Label>
                <Form.Control
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={8}>
              <Form.Group>
                <Form.Label>Buscar</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <FaSearch />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Buscar por paciente, propietario, veterinario o motivo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Lista de citas */}
      <Card className="shadow-sm">
        <Card.Header className="bg-light">
          <Row className="align-items-center">
            <Col>
              <h5 className="mb-0">
                <FaCalendarAlt className="me-2 text-primary" />
                Citas para el día {formatDate(filterDate)}
              </h5>
            </Col>
            <Col xs="auto">
              <span className="text-muted">
                Mostrando {sortedAppointments.length} cita(s)
              </span>
            </Col>
          </Row>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center my-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Cargando citas...</p>
            </div>
          ) : sortedAppointments.length === 0 ? (
            <div className="text-center py-5">
              <FaCalendarAlt size={40} className="text-muted mb-3" />
              <h5 className="text-muted">No hay citas programadas para esta fecha</h5>
              <Button 
                variant="primary" 
                className="mt-3"
                onClick={() => setShowAddModal(true)}
              >
                Agregar Cita
              </Button>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th width="10%">Hora</th>
                    <th width="20%">Paciente</th>
                    <th width="20%">Propietario</th>
                    <th width="15%">Veterinario</th>
                    <th width="15%">Motivo</th>
                    <th width="10%">Estado</th>
                    <th width="10%">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedAppointments.map(appointment => (
                    <tr key={appointment.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <FaClock className="me-2 text-primary" />
                          <strong>{appointment.hora}</strong>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FaPaw className="me-2 text-success" />
                          <div>
                            <div>{appointment.paciente_nombre}</div>
                            <small className="text-muted">{appointment.especie} - {appointment.raza}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FaUserAlt className="me-2 text-info" />
                          <div>
                            <div>{appointment.propietario_nombre}</div>
                            <small className="text-muted">{appointment.propietario_telefono}</small>
                          </div>
                        </div>
                      </td>
                      <td>{appointment.veterinario_nombre}</td>
                      <td>{appointment.motivo}</td>
                      <td>
                        <Badge bg={getStatusColor(appointment.estado)}>
                          {appointment.estado.charAt(0).toUpperCase() + appointment.estado.slice(1)}
                        </Badge>
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-1"
                          onClick={() => handleEditClick(appointment)}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteClick(appointment)}
                          disabled={appointment.estado === 'completada'}
                        >
                          <FaTrashAlt />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal para agregar/editar cita */}
      <Modal 
        show={showAddModal || showEditModal} 
        onHide={() => {
          setShowAddModal(false);
          setShowEditModal(false);
          setError('');
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {showAddModal ? (
              <>
                <FaPlusCircle className="me-2" />
                Nueva Cita
              </>
            ) : (
              <>
                <FaEdit className="me-2" />
                Editar Cita
              </>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha*</Form.Label>
                  <Form.Control
                    type="date"
                    name="fecha"
                    value={formData.fecha}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Hora*</Form.Label>
                  <Form.Control
                    type="time"
                    name="hora"
                    value={formData.hora}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Paciente*</Form.Label>
              <Form.Select
                name="paciente_id"
                value={formData.paciente_id}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar paciente</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.nombre} ({patient.propietario_nombre})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Veterinario*</Form.Label>
              <Form.Select
                name="veterinario_id"
                value={formData.veterinario_id}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar veterinario</option>
                {veterinarians.map(vet => (
                  <option key={vet.id} value={vet.id}>
                    {vet.nombre}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Motivo de la cita*</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="motivo"
                value={formData.motivo}
                onChange={handleChange}
                required
              />
            </Form.Group>

            {showEditModal && (
              <Form.Group className="mb-3">
                <Form.Label>Estado</Form.Label>
                <Form.Select
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="confirmada">Confirmada</option>
                  <option value="completada">Completada</option>
                  <option value="cancelada">Cancelada</option>
                </Form.Select>
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Notas adicionales</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="notas"
                value={formData.notas}
                onChange={handleChange}
              />
            </Form.Group>

            <div className="text-muted small mb-3">* Campos obligatorios</div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => {
              setShowAddModal(false);
              setShowEditModal(false);
              setError('');
            }}
          >
            Cancelar
          </Button>
          <Button 
            variant="primary"
            onClick={handleSaveAppointment}
          >
            {showAddModal ? 'Crear Cita' : 'Actualizar Cita'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de confirmación para eliminar */}
      <Modal 
        show={showDeleteModal} 
        onHide={() => setShowDeleteModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>¿Está seguro de que desea eliminar la cita del {currentAppointment && formatDate(currentAppointment.fecha)} a las {currentAppointment?.hora} para {currentAppointment?.paciente_nombre}?</p>
          <p className="text-danger">Esta acción no se puede deshacer.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowDeleteModal(false)}
          >
            Cancelar
          </Button>
          <Button 
            variant="danger"
            onClick={handleDeleteAppointment}
          >
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Appointments; 