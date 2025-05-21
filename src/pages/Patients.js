import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, InputGroup, Row, Col, Modal, Alert, Spinner } from 'react-bootstrap';
import { FaSearch, FaPlusCircle, FaEdit, FaTrashAlt, FaIdCard, FaPaw, FaFileAlt } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Datos de ejemplo para pacientes (como no tenemos API real para pacientes)
const samplePatients = [
  {
    id: 101,
    nombre: 'Firulais',
    especie: 'Perro',
    raza: 'Labrador',
    sexo: 'Macho',
    edad: 3,
    edad_unidad: 'años',
    peso: 28.5,
    propietario_nombre: 'Juan Pérez',
    propietario_id: 201,
    propietario_telefono: '555-1234',
    ultima_visita: '2023-12-15'
  },
  {
    id: 102,
    nombre: 'Michu',
    especie: 'Gato',
    raza: 'Siamés',
    sexo: 'Hembra',
    edad: 2,
    edad_unidad: 'años',
    peso: 3.8,
    propietario_nombre: 'María González',
    propietario_id: 202,
    propietario_telefono: '555-5678',
    ultima_visita: '2024-01-10'
  },
  {
    id: 103,
    nombre: 'Rocky',
    especie: 'Perro',
    raza: 'Bulldog',
    sexo: 'Macho',
    edad: 5,
    edad_unidad: 'años',
    peso: 22.3,
    propietario_nombre: 'Carlos López',
    propietario_id: 203,
    propietario_telefono: '555-9012',
    ultima_visita: '2024-02-05'
  },
  {
    id: 104,
    nombre: 'Luna',
    especie: 'Perro',
    raza: 'Pastor Alemán',
    sexo: 'Hembra',
    edad: 4,
    edad_unidad: 'años',
    peso: 28.5,
    propietario_nombre: 'Roberto Sánchez',
    propietario_id: 204,
    propietario_telefono: '555-9876',
    ultima_visita: '2024-03-01'
  },
  {
    id: 105,
    nombre: 'Simba',
    especie: 'Gato',
    raza: 'Persa',
    sexo: 'Macho',
    edad: 1,
    edad_unidad: 'años',
    peso: 4.2,
    propietario_nombre: 'Carla Moreno',
    propietario_id: 205,
    propietario_telefono: '555-4321',
    ultima_visita: '2024-02-20'
  }
];

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    especie: '',
    raza: '',
    sexo: 'Macho',
    edad: '',
    edad_unidad: 'años',
    peso: '',
    propietario_nombre: '',
    propietario_telefono: ''
  });
  const navigate = useNavigate();

  // Cargar datos de pacientes
  useEffect(() => {
    // Simulamos la carga desde una API
    setLoading(true);
    setTimeout(() => {
      setPatients(samplePatients);
      setLoading(false);
    }, 1000);
  }, []);

  // Filtrar pacientes según término de búsqueda
  const filteredPatients = patients.filter(patient => {
    const searchFields = [
      patient.nombre,
      patient.especie,
      patient.raza,
      patient.propietario_nombre,
      patient.propietario_telefono
    ].map(field => field.toLowerCase());
    
    return searchFields.some(field => field.includes(searchTerm.toLowerCase()));
  });

  // Manejar el cambio en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Abrir modal para editar paciente
  const handleEditClick = (patient) => {
    setCurrentPatient(patient);
    setFormData({
      nombre: patient.nombre,
      especie: patient.especie,
      raza: patient.raza,
      sexo: patient.sexo,
      edad: patient.edad,
      edad_unidad: patient.edad_unidad,
      peso: patient.peso,
      propietario_nombre: patient.propietario_nombre,
      propietario_telefono: patient.propietario_telefono
    });
    setShowEditModal(true);
  };

  // Abrir modal para eliminar paciente
  const handleDeleteClick = (patient) => {
    setCurrentPatient(patient);
    setShowDeleteModal(true);
  };

  // Ver historial médico del paciente
  const handleViewHistory = (patientId) => {
    navigate(`/pacientes/historial/${patientId}`);
  };

  // Manejar guardado de nuevo paciente
  const handleSaveNewPatient = () => {
    // Validación básica
    if (!formData.nombre || !formData.especie || !formData.propietario_nombre) {
      setError('Por favor complete los campos requeridos: Nombre, Especie y Propietario');
      return;
    }

    // Generar un ID único para el nuevo paciente
    const newId = Math.max(...patients.map(p => p.id), 0) + 1;
    
    // Crear nuevo paciente
    const newPatient = {
      id: newId,
      ...formData,
      propietario_id: newId + 100, // ID ficticio para el propietario
      ultima_visita: new Date().toISOString().split('T')[0]
    };

    // Actualizar la lista de pacientes
    setPatients([...patients, newPatient]);
    
    // Cerrar modal y limpiar formulario
    setShowAddModal(false);
    setFormData({
      nombre: '',
      especie: '',
      raza: '',
      sexo: 'Macho',
      edad: '',
      edad_unidad: 'años',
      peso: '',
      propietario_nombre: '',
      propietario_telefono: ''
    });
    setError('');
  };

  // Manejar actualización de paciente
  const handleUpdatePatient = () => {
    // Validación básica
    if (!formData.nombre || !formData.especie || !formData.propietario_nombre) {
      setError('Por favor complete los campos requeridos: Nombre, Especie y Propietario');
      return;
    }

    // Actualizar paciente en la lista
    const updatedPatients = patients.map(patient => {
      if (patient.id === currentPatient.id) {
        return {
          ...patient,
          ...formData
        };
      }
      return patient;
    });

    setPatients(updatedPatients);
    
    // Cerrar modal y limpiar
    setShowEditModal(false);
    setCurrentPatient(null);
    setError('');
  };

  // Manejar eliminación de paciente
  const handleDeletePatient = () => {
    // Eliminar paciente de la lista
    const updatedPatients = patients.filter(patient => patient.id !== currentPatient.id);
    setPatients(updatedPatients);
    
    // Cerrar modal
    setShowDeleteModal(false);
    setCurrentPatient(null);
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'Sin registro';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestión de Pacientes</h2>
        <Button 
          variant="primary"
          onClick={() => setShowAddModal(true)}
          className="d-flex align-items-center"
        >
          <FaPlusCircle className="me-2" />
          Nuevo Paciente
        </Button>
      </div>

      {/* Barra de búsqueda */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row>
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control 
                  placeholder="Buscar pacientes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={6} className="text-md-end mt-3 mt-md-0">
              <span className="text-muted">
                Mostrando {filteredPatients.length} de {patients.length} pacientes
              </span>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Lista de pacientes */}
      <Card className="shadow-sm">
        <Card.Body>
          {loading ? (
            <div className="text-center my-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Cargando pacientes...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Especie</th>
                    <th>Raza</th>
                    <th>Propietario</th>
                    <th>Contacto</th>
                    <th>Última Visita</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center">No se encontraron pacientes</td>
                    </tr>
                  ) : (
                    filteredPatients.map(patient => (
                      <tr key={patient.id}>
                        <td>{patient.id}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <FaPaw className="me-2 text-primary" />
                            <span>{patient.nombre}</span>
                          </div>
                        </td>
                        <td>{patient.especie}</td>
                        <td>{patient.raza}</td>
                        <td>{patient.propietario_nombre}</td>
                        <td>{patient.propietario_telefono}</td>
                        <td>{formatDate(patient.ultima_visita)}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button 
                              variant="outline-primary" 
                              size="sm" 
                              onClick={() => handleEditClick(patient)}
                            >
                              <FaEdit />
                            </Button>
                            <Button 
                              variant="outline-danger" 
                              size="sm" 
                              onClick={() => handleDeleteClick(patient)}
                            >
                              <FaTrashAlt />
                            </Button>
                            <Button 
                              variant="outline-info" 
                              size="sm" 
                              onClick={() => handleViewHistory(patient.id)}
                            >
                              <FaFileAlt /> Historial
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal para agregar nuevo paciente */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaPlusCircle className="me-2" />
            Agregar Nuevo Paciente
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form>
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre del Paciente*</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Peso (kg)</Form.Label>
                  <Form.Control 
                    type="number" 
                    step="0.1"
                    name="peso"
                    value={formData.peso}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Especie*</Form.Label>
                  <Form.Select
                    name="especie"
                    value={formData.especie}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccionar</option>
                    <option value="Perro">Perro</option>
                    <option value="Gato">Gato</option>
                    <option value="Ave">Ave</option>
                    <option value="Reptil">Reptil</option>
                    <option value="Otro">Otro</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Raza</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="raza"
                    value={formData.raza}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Sexo</Form.Label>
                  <Form.Select
                    name="sexo"
                    value={formData.sexo}
                    onChange={handleChange}
                  >
                    <option value="Macho">Macho</option>
                    <option value="Hembra">Hembra</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Edad</Form.Label>
                  <Row>
                    <Col sm={6}>
                      <Form.Control 
                        type="number" 
                        name="edad"
                        value={formData.edad}
                        onChange={handleChange}
                      />
                    </Col>
                    <Col sm={6}>
                      <Form.Select
                        name="edad_unidad"
                        value={formData.edad_unidad}
                        onChange={handleChange}
                      >
                        <option value="años">Años</option>
                        <option value="meses">Meses</option>
                        <option value="semanas">Semanas</option>
                      </Form.Select>
                    </Col>
                  </Row>
                </Form.Group>
              </Col>
            </Row>

            <hr className="my-4" />

            <h5 className="mb-3">
              <FaIdCard className="me-2" />
              Información del Propietario
            </h5>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre del Propietario*</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="propietario_nombre"
                    value={formData.propietario_nombre}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="propietario_telefono"
                    value={formData.propietario_telefono}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <div className="text-muted small mb-3">* Campos obligatorios</div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSaveNewPatient}>
            Guardar Paciente
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para editar paciente */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaEdit className="me-2" />
            Editar Paciente: {currentPatient?.nombre}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form>
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre del Paciente*</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Peso (kg)</Form.Label>
                  <Form.Control 
                    type="number" 
                    step="0.1"
                    name="peso"
                    value={formData.peso}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Especie*</Form.Label>
                  <Form.Select
                    name="especie"
                    value={formData.especie}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccionar</option>
                    <option value="Perro">Perro</option>
                    <option value="Gato">Gato</option>
                    <option value="Ave">Ave</option>
                    <option value="Reptil">Reptil</option>
                    <option value="Otro">Otro</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Raza</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="raza"
                    value={formData.raza}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Sexo</Form.Label>
                  <Form.Select
                    name="sexo"
                    value={formData.sexo}
                    onChange={handleChange}
                  >
                    <option value="Macho">Macho</option>
                    <option value="Hembra">Hembra</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Edad</Form.Label>
                  <Row>
                    <Col sm={6}>
                      <Form.Control 
                        type="number" 
                        name="edad"
                        value={formData.edad}
                        onChange={handleChange}
                      />
                    </Col>
                    <Col sm={6}>
                      <Form.Select
                        name="edad_unidad"
                        value={formData.edad_unidad}
                        onChange={handleChange}
                      >
                        <option value="años">Años</option>
                        <option value="meses">Meses</option>
                        <option value="semanas">Semanas</option>
                      </Form.Select>
                    </Col>
                  </Row>
                </Form.Group>
              </Col>
            </Row>

            <hr className="my-4" />

            <h5 className="mb-3">
              <FaIdCard className="me-2" />
              Información del Propietario
            </h5>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre del Propietario*</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="propietario_nombre"
                    value={formData.propietario_nombre}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="propietario_telefono"
                    value={formData.propietario_telefono}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <div className="text-muted small mb-3">* Campos obligatorios</div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleUpdatePatient}>
            Actualizar Paciente
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de confirmación para eliminar */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>¿Está seguro de que desea eliminar al paciente <strong>{currentPatient?.nombre}</strong>?</p>
          <p className="text-danger">Esta acción no se puede deshacer.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDeletePatient}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Patients; 