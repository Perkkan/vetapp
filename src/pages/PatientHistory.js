import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, Row, Col, Card, Form, Button, Table, 
  Tabs, Tab, Modal, Alert, Spinner, Badge 
} from 'react-bootstrap';
import { 
  FaArrowLeft, FaPen, FaPlus, FaFileAlt, 
  FaCalendarAlt, FaHospital, FaSyringe, FaPrint 
} from 'react-icons/fa';
import axios from 'axios';

const PatientHistory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [historialList, setHistorialList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('historial');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);

  // Estado para formulario de nuevo registro
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    tipo: 'Consulta',
    diagnostico: '',
    tratamiento: '',
    observaciones: '',
    veterinario: ''
  });

  // Datos de muestra para el historial
  const sampleHistorialData = [
    {
      id: 1,
      paciente_id: Number(id),
      fecha: '2023-05-10',
      tipo: 'Consulta',
      diagnostico: 'Dermatitis alérgica',
      tratamiento: 'Antibióticos y crema tópica',
      observaciones: 'Aplicar dos veces al día, revisión en 7 días',
      veterinario: 'Dra. Rodríguez',
      fecha_creacion: '2023-05-10T10:15:00'
    },
    {
      id: 2,
      paciente_id: Number(id),
      fecha: '2023-05-17',
      tipo: 'Revisión',
      diagnostico: 'Mejoría en condición cutánea',
      tratamiento: 'Continuar con medicación por 5 días más',
      observaciones: 'Ha mejorado notablemente',
      veterinario: 'Dra. Rodríguez',
      fecha_creacion: '2023-05-17T11:30:00'
    },
    {
      id: 3,
      paciente_id: Number(id),
      fecha: '2023-06-05',
      tipo: 'Vacunación',
      diagnostico: 'Animal sano',
      tratamiento: 'Vacuna polivalente',
      observaciones: 'Próxima dosis en un año',
      veterinario: 'Dr. Martínez',
      fecha_creacion: '2023-06-05T09:45:00'
    },
    {
      id: 4,
      paciente_id: Number(id),
      fecha: '2023-07-20',
      tipo: 'Hospitalización',
      diagnostico: 'Gastroenteritis aguda',
      tratamiento: 'Fluidoterapia, antieméticos, protectores gástricos',
      observaciones: 'Paciente requirió hospitalización por 2 días debido a deshidratación severa',
      veterinario: 'Dr. Martínez',
      fecha_creacion: '2023-07-20T16:20:00'
    }
  ];

  // Datos de muestra para el paciente
  const samplePatientData = {
    id: Number(id),
    nombre: 'Firulais',
    especie: 'Perro',
    raza: 'Labrador',
    sexo: 'Macho',
    edad: 5,
    edad_unidad: 'años',
    peso: 28.5,
    propietario_id: 101,
    propietario_nombre: 'Juan Pérez',
    propietario_telefono: '555-1234',
    propietario_email: 'juan@example.com',
    ultima_visita: '2023-07-20'
  };

  // Cargar datos del paciente y su historial
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      
      try {
        // En una aplicación real, estas serían llamadas a la API
        // const patientResponse = await axios.get(`http://localhost:5000/api/pacientes/${id}`);
        // const historialResponse = await axios.get(`http://localhost:5000/api/historiales/paciente/${id}`);
        
        // Simulación de carga de datos
        setTimeout(() => {
          setPatient(samplePatientData);
          setHistorialList(sampleHistorialData);
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar los datos del paciente y su historial.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Añadir nuevo registro al historial
  const handleAddRecord = () => {
    // Validación básica
    if (!formData.diagnostico || !formData.tratamiento) {
      setError('Por favor complete los campos de diagnóstico y tratamiento.');
      return;
    }

    // Crear nuevo registro
    const newRecord = {
      id: Math.max(...historialList.map(item => item.id), 0) + 1,
      paciente_id: Number(id),
      ...formData,
      fecha_creacion: new Date().toISOString()
    };

    // Actualizar la lista
    setHistorialList([newRecord, ...historialList]);
    
    // Cerrar modal y limpiar formulario
    setShowAddModal(false);
    setFormData({
      fecha: new Date().toISOString().split('T')[0],
      tipo: 'Consulta',
      diagnostico: '',
      tratamiento: '',
      observaciones: '',
      veterinario: ''
    });
    setError('');
  };

  // Ver detalles de un registro
  const handleViewRecord = (record) => {
    setCurrentRecord(record);
    setShowViewModal(true);
  };

  // Obtener color de badge según tipo de registro
  const getBadgeColor = (tipo) => {
    switch (tipo) {
      case 'Consulta': return 'primary';
      case 'Revisión': return 'info';
      case 'Vacunación': return 'success';
      case 'Hospitalización': return 'danger';
      case 'Cirugía': return 'warning';
      default: return 'secondary';
    }
  };

  // Obtener icono según tipo de registro
  const getTypeIcon = (tipo) => {
    switch (tipo) {
      case 'Consulta': return <FaFileAlt className="me-1" />;
      case 'Revisión': return <FaPen className="me-1" />;
      case 'Vacunación': return <FaSyringe className="me-1" />;
      case 'Hospitalización': return <FaHospital className="me-1" />;
      case 'Cirugía': return <FaSyringe className="me-1" />;
      default: return <FaFileAlt className="me-1" />;
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Si está cargando, mostrar spinner
  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      </Container>
    );
  }

  // Si hay un error, mostrarlo
  if (error && !patient) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          {error}
        </Alert>
        <Button variant="primary" onClick={() => navigate('/pacientes')}>
          <FaArrowLeft className="me-2" /> Volver a Pacientes
        </Button>
      </Container>
    );
  }

  return (
    <Container fluid className="mt-4">
      <Row className="mb-4">
        <Col>
          <Button variant="outline-primary" onClick={() => navigate('/pacientes')}>
            <FaArrowLeft className="me-2" /> Volver a Pacientes
          </Button>
        </Col>
      </Row>

      {patient && (
        <>
          {/* Datos del paciente */}
          <Row className="mb-4">
            <Col>
              <Card>
                <Card.Header as="h5">Información del Paciente</Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={8}>
                      <h2>{patient.nombre}</h2>
                      <p className="mb-1">
                        <strong>Especie:</strong> {patient.especie} | <strong>Raza:</strong> {patient.raza}
                      </p>
                      <p className="mb-1">
                        <strong>Sexo:</strong> {patient.sexo} | <strong>Edad:</strong> {patient.edad} {patient.edad_unidad} | <strong>Peso:</strong> {patient.peso} kg
                      </p>
                      <hr />
                      <p className="mb-1">
                        <strong>Propietario:</strong> {patient.propietario_nombre}
                      </p>
                      <p className="mb-1">
                        <strong>Teléfono:</strong> {patient.propietario_telefono}
                      </p>
                      {patient.propietario_email && (
                        <p className="mb-1">
                          <strong>Email:</strong> {patient.propietario_email}
                        </p>
                      )}
                    </Col>
                    <Col md={4} className="d-flex flex-column justify-content-center align-items-end">
                      <p className="text-muted mb-1">
                        <strong>Última visita:</strong>
                      </p>
                      <h4>
                        <Badge bg="info">
                          <FaCalendarAlt className="me-1" />
                          {formatDate(patient.ultima_visita)}
                        </Badge>
                      </h4>
                      <Button 
                        variant="success" 
                        className="mt-3"
                        onClick={() => setShowAddModal(true)}
                      >
                        <FaPlus className="me-1" /> Nuevo Registro
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Pestañas para diferentes vistas */}
          <Row>
            <Col>
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-3"
              >
                <Tab eventKey="historial" title="Historial Completo">
                  <Card>
                    <Card.Body>
                      {historialList.length > 0 ? (
                        <Table responsive hover>
                          <thead>
                            <tr>
                              <th>Fecha</th>
                              <th>Tipo</th>
                              <th>Diagnóstico</th>
                              <th>Tratamiento</th>
                              <th>Veterinario</th>
                              <th>Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {historialList.map(record => (
                              <tr key={record.id}>
                                <td>{formatDate(record.fecha)}</td>
                                <td>
                                  <Badge bg={getBadgeColor(record.tipo)}>
                                    {getTypeIcon(record.tipo)} {record.tipo}
                                  </Badge>
                                </td>
                                <td>{record.diagnostico}</td>
                                <td>{record.tratamiento}</td>
                                <td>{record.veterinario}</td>
                                <td>
                                  <Button 
                                    variant="outline-primary" 
                                    size="sm"
                                    onClick={() => handleViewRecord(record)}
                                  >
                                    Ver Detalles
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      ) : (
                        <Alert variant="info">
                          No hay registros en el historial para este paciente.
                        </Alert>
                      )}
                    </Card.Body>
                  </Card>
                </Tab>
                <Tab eventKey="consultas" title="Consultas">
                  <Card>
                    <Card.Body>
                      {historialList.filter(r => r.tipo === 'Consulta' || r.tipo === 'Revisión').length > 0 ? (
                        <Table responsive hover>
                          <thead>
                            <tr>
                              <th>Fecha</th>
                              <th>Tipo</th>
                              <th>Diagnóstico</th>
                              <th>Tratamiento</th>
                              <th>Veterinario</th>
                              <th>Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {historialList
                              .filter(r => r.tipo === 'Consulta' || r.tipo === 'Revisión')
                              .map(record => (
                                <tr key={record.id}>
                                  <td>{formatDate(record.fecha)}</td>
                                  <td>
                                    <Badge bg={getBadgeColor(record.tipo)}>
                                      {getTypeIcon(record.tipo)} {record.tipo}
                                    </Badge>
                                  </td>
                                  <td>{record.diagnostico}</td>
                                  <td>{record.tratamiento}</td>
                                  <td>{record.veterinario}</td>
                                  <td>
                                    <Button 
                                      variant="outline-primary" 
                                      size="sm"
                                      onClick={() => handleViewRecord(record)}
                                    >
                                      Ver Detalles
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </Table>
                      ) : (
                        <Alert variant="info">
                          No hay consultas registradas para este paciente.
                        </Alert>
                      )}
                    </Card.Body>
                  </Card>
                </Tab>
                <Tab eventKey="vacunas" title="Vacunas">
                  <Card>
                    <Card.Body>
                      {historialList.filter(r => r.tipo === 'Vacunación').length > 0 ? (
                        <Table responsive hover>
                          <thead>
                            <tr>
                              <th>Fecha</th>
                              <th>Vacuna</th>
                              <th>Observaciones</th>
                              <th>Veterinario</th>
                              <th>Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {historialList
                              .filter(r => r.tipo === 'Vacunación')
                              .map(record => (
                                <tr key={record.id}>
                                  <td>{formatDate(record.fecha)}</td>
                                  <td>{record.tratamiento}</td>
                                  <td>{record.observaciones}</td>
                                  <td>{record.veterinario}</td>
                                  <td>
                                    <Button 
                                      variant="outline-primary" 
                                      size="sm"
                                      onClick={() => handleViewRecord(record)}
                                    >
                                      Ver Detalles
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </Table>
                      ) : (
                        <Alert variant="info">
                          No hay vacunas registradas para este paciente.
                        </Alert>
                      )}
                    </Card.Body>
                  </Card>
                </Tab>
                <Tab eventKey="hospitalizaciones" title="Hospitalizaciones">
                  <Card>
                    <Card.Body>
                      {historialList.filter(r => r.tipo === 'Hospitalización' || r.tipo === 'Cirugía').length > 0 ? (
                        <Table responsive hover>
                          <thead>
                            <tr>
                              <th>Fecha</th>
                              <th>Tipo</th>
                              <th>Diagnóstico</th>
                              <th>Tratamiento</th>
                              <th>Veterinario</th>
                              <th>Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {historialList
                              .filter(r => r.tipo === 'Hospitalización' || r.tipo === 'Cirugía')
                              .map(record => (
                                <tr key={record.id}>
                                  <td>{formatDate(record.fecha)}</td>
                                  <td>
                                    <Badge bg={getBadgeColor(record.tipo)}>
                                      {getTypeIcon(record.tipo)} {record.tipo}
                                    </Badge>
                                  </td>
                                  <td>{record.diagnostico}</td>
                                  <td>{record.tratamiento}</td>
                                  <td>{record.veterinario}</td>
                                  <td>
                                    <Button 
                                      variant="outline-primary" 
                                      size="sm"
                                      onClick={() => handleViewRecord(record)}
                                    >
                                      Ver Detalles
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </Table>
                      ) : (
                        <Alert variant="info">
                          No hay hospitalizaciones registradas para este paciente.
                        </Alert>
                      )}
                    </Card.Body>
                  </Card>
                </Tab>
              </Tabs>
            </Col>
          </Row>

          {/* Modal para agregar nuevo registro */}
          <Modal
            show={showAddModal}
            onHide={() => {
              setShowAddModal(false);
              setError('');
            }}
            backdrop="static"
            size="lg"
          >
            <Modal.Header closeButton>
              <Modal.Title>Nuevo Registro Médico</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="fecha">
                      <Form.Label>Fecha</Form.Label>
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
                    <Form.Group controlId="tipo">
                      <Form.Label>Tipo de Registro</Form.Label>
                      <Form.Select
                        name="tipo"
                        value={formData.tipo}
                        onChange={handleChange}
                        required
                      >
                        <option value="Consulta">Consulta</option>
                        <option value="Revisión">Revisión</option>
                        <option value="Vacunación">Vacunación</option>
                        <option value="Hospitalización">Hospitalización</option>
                        <option value="Cirugía">Cirugía</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3" controlId="diagnostico">
                  <Form.Label>Diagnóstico</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="diagnostico"
                    value={formData.diagnostico}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="tratamiento">
                  <Form.Label>Tratamiento</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="tratamiento"
                    value={formData.tratamiento}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="observaciones">
                  <Form.Label>Observaciones</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="observaciones"
                    value={formData.observaciones}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="veterinario">
                  <Form.Label>Veterinario</Form.Label>
                  <Form.Control
                    type="text"
                    name="veterinario"
                    value={formData.veterinario}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleAddRecord}>
                Guardar Registro
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Modal para ver detalles de un registro */}
          <Modal
            show={showViewModal}
            onHide={() => setShowViewModal(false)}
            size="lg"
          >
            <Modal.Header closeButton>
              <Modal.Title>
                <Badge bg={currentRecord ? getBadgeColor(currentRecord.tipo) : 'primary'} className="me-2">
                  {currentRecord && getTypeIcon(currentRecord.tipo)} {currentRecord?.tipo}
                </Badge>
                {currentRecord ? formatDate(currentRecord.fecha) : ''}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {currentRecord && (
                <Card>
                  <Card.Body>
                    <Row className="mb-3">
                      <Col md={6}>
                        <h5>Diagnóstico</h5>
                        <p>{currentRecord.diagnostico}</p>
                      </Col>
                      <Col md={6}>
                        <h5>Veterinario</h5>
                        <p>{currentRecord.veterinario}</p>
                      </Col>
                    </Row>
                    <Row className="mb-3">
                      <Col md={12}>
                        <h5>Tratamiento</h5>
                        <p>{currentRecord.tratamiento}</p>
                      </Col>
                    </Row>
                    {currentRecord.observaciones && (
                      <Row className="mb-3">
                        <Col md={12}>
                          <h5>Observaciones</h5>
                          <p>{currentRecord.observaciones}</p>
                        </Col>
                      </Row>
                    )}
                    <Row>
                      <Col className="text-end">
                        <small className="text-muted">
                          Creado el: {new Date(currentRecord.fecha_creacion).toLocaleString('es-ES')}
                        </small>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowViewModal(false)}>
                Cerrar
              </Button>
              <Button variant="primary">
                <FaPrint className="me-1" /> Imprimir
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </Container>
  );
};

export default PatientHistory; 