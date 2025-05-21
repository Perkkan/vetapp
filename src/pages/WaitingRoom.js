import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Form, Tab, Nav, Alert, Modal } from 'react-bootstrap';
import { FaPlusCircle, FaUserClock, FaUserMd, FaHospital, FaArrowRight, FaTrashAlt } from 'react-icons/fa';
import axios from 'axios';
import { Link } from 'react-router-dom';

const WaitingRoom = () => {
  // Obtener la pestaña inicial desde localStorage si existe
  const getInitialTab = () => {
    const savedTab = localStorage.getItem('waitingRoomTab');
    // Limpiar localStorage después de usarlo
    if (savedTab) {
      localStorage.removeItem('waitingRoomTab');
      return savedTab;
    }
    return 'waiting';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [waitingPatients, setWaitingPatients] = useState([]);
  const [consultationPatients, setConsultationPatients] = useState([]);
  const [hospitalizedPatients, setHospitalizedPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPatient, setNewPatient] = useState({
    paciente_id: '',
    motivo: '',
    prioridad: 'normal'
  });
  
  // Cargar datos de la sala de espera
  const fetchData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Obtener pacientes en espera
      const waitingResponse = await axios.get('http://localhost:5000/api/sala-espera/espera');
      setWaitingPatients(waitingResponse.data);
      
      // Obtener pacientes en consulta
      const consultationResponse = await axios.get('http://localhost:5000/api/sala-espera/consulta');
      setConsultationPatients(consultationResponse.data);
      
      // Obtener pacientes hospitalizados
      const hospitalizedResponse = await axios.get('http://localhost:5000/api/sala-espera/hospitalizados');
      setHospitalizedPatients(hospitalizedResponse.data);
    } catch (err) {
      console.error('Error al cargar los datos:', err);
      setError('Error al cargar los datos. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };
  
  // Cargar datos al montar el componente
  useEffect(() => {
    fetchData();
  }, []);

  // Manejar el cambio de pestaña
  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
  };
  
  // Manejar el envío del formulario para agregar un nuevo paciente
  const handleAddPatient = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await axios.post('http://localhost:5000/api/sala-espera', newPatient);
      
      // Actualizar la lista de pacientes en espera
      setWaitingPatients([...waitingPatients, response.data]);
      
      // Cerrar modal y limpiar formulario
      setShowAddModal(false);
      setNewPatient({
        paciente_id: '',
        motivo: '',
        prioridad: 'normal'
      });
    } catch (err) {
      console.error('Error al agregar paciente:', err);
      setError('Error al agregar paciente. Por favor, intente nuevamente.');
    }
  };
  
  // Mover un paciente a consulta
  const moveToConsultation = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/sala-espera/${id}/consulta`);
      fetchData(); // Recargar los datos
    } catch (err) {
      console.error('Error al mover paciente a consulta:', err);
      setError('Error al mover paciente a consulta. Por favor, intente nuevamente.');
    }
  };
  
  // Mover un paciente a hospitalización
  const moveToHospitalization = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/sala-espera/${id}/hospitalizacion`);
      fetchData(); // Recargar los datos
    } catch (err) {
      console.error('Error al mover paciente a hospitalización:', err);
      setError('Error al mover paciente a hospitalización. Por favor, intente nuevamente.');
    }
  };
  
  // Finalizar atención
  const finishAttention = async (id) => {
    if (window.confirm('¿Está seguro de que desea finalizar la atención de este paciente?')) {
      try {
        await axios.delete(`http://localhost:5000/api/sala-espera/${id}`);
        fetchData(); // Recargar los datos
      } catch (err) {
        console.error('Error al finalizar atención:', err);
        setError('Error al finalizar atención. Por favor, intente nuevamente.');
      }
    }
  };
  
  // Formatear la hora (convertir ISO a formato legible)
  const formatTime = (isoTime) => {
    const date = new Date(isoTime);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };
  
  // Calcular tiempo de espera
  const calculateWaitingTime = (arrivalTime) => {
    const arrivalDate = new Date(arrivalTime);
    const now = new Date();
    const diffMs = now - arrivalDate;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins} minutos`;
    } else {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return `${hours} h ${mins} min`;
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Sala de Espera</h2>
        <Button 
          variant="primary" 
          onClick={() => setShowAddModal(true)}
          className="d-flex align-items-center"
        >
          <FaPlusCircle className="me-2" />
          Agregar Paciente
        </Button>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Cargando datos...</p>
        </div>
      ) : (
        <Tab.Container id="waiting-room-tabs" activeKey={activeTab} onSelect={handleTabChange}>
          <Row>
            <Col md={3}>
              <Nav variant="pills" className="flex-column mb-4">
                <Nav.Item>
                  <Nav.Link eventKey="waiting" className="d-flex justify-content-between align-items-center">
                    <span>
                      <FaUserClock className="me-2" />
                      En Espera
                    </span>
                    <span className="badge bg-primary rounded-pill">{waitingPatients.length}</span>
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="consultation" className="d-flex justify-content-between align-items-center">
                    <span>
                      <FaUserMd className="me-2" />
                      En Consulta
                    </span>
                    <span className="badge bg-success rounded-pill">{consultationPatients.length}</span>
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="hospitalized" className="d-flex justify-content-between align-items-center">
                    <span>
                      <FaHospital className="me-2" />
                      Hospitalizados
                    </span>
                    <span className="badge bg-warning rounded-pill">{hospitalizedPatients.length}</span>
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Col>
            
            <Col md={9}>
              <Tab.Content>
                {/* Pestaña de pacientes en espera */}
                <Tab.Pane eventKey="waiting">
                  <Card>
                    <Card.Header className="bg-primary text-white">
                      <h5 className="mb-0">Pacientes en Espera</h5>
                    </Card.Header>
                    <Card.Body>
                      {waitingPatients.length === 0 ? (
                        <p className="text-center text-muted my-3">No hay pacientes en espera</p>
                      ) : (
                        waitingPatients.map(patient => (
                          <div 
                            key={patient.id}
                            className={`waiting-list-item mb-3 ${patient.prioridad === 'alta' ? 'high-priority' : ''}`}
                          >
                            <Row>
                              <Col md={8}>
                                <h5 className="mb-1">{patient.paciente_nombre}</h5>
                                <p className="mb-1 small">{patient.especie} - {patient.raza}</p>
                                <p className="mb-1 small">{patient.propietario_nombre} ({patient.propietario_telefono})</p>
                                <div className="d-flex text-muted small">
                                  <div className="me-3">
                                    <strong>Motivo:</strong> {patient.motivo}
                                  </div>
                                  <div>
                                    <strong>Llegada:</strong> {formatTime(patient.hora_llegada)} ({calculateWaitingTime(patient.hora_llegada)})
                                  </div>
                                </div>
                                {patient.prioridad === 'alta' && (
                                  <span className="badge bg-danger me-1">Prioridad Alta</span>
                                )}
                              </Col>
                              <Col md={4} className="d-flex align-items-center justify-content-end">
                                <Button 
                                  variant="outline-success" 
                                  size="sm" 
                                  className="me-2"
                                  onClick={() => moveToConsultation(patient.id)}
                                >
                                  <FaUserMd className="me-1" />
                                  A Consulta
                                </Button>
                                <Button 
                                  variant="outline-danger" 
                                  size="sm"
                                  onClick={() => finishAttention(patient.id)}
                                >
                                  <FaTrashAlt />
                                </Button>
                              </Col>
                            </Row>
                          </div>
                        ))
                      )}
                    </Card.Body>
                  </Card>
                </Tab.Pane>
                
                {/* Pestaña de pacientes en consulta */}
                <Tab.Pane eventKey="consultation">
                  <Card>
                    <Card.Header className="bg-success text-white">
                      <h5 className="mb-0">Pacientes en Consulta</h5>
                    </Card.Header>
                    <Card.Body>
                      {consultationPatients.length === 0 ? (
                        <p className="text-center text-muted my-3">No hay pacientes en consulta</p>
                      ) : (
                        consultationPatients.map(patient => (
                          <div 
                            key={patient.id}
                            className="waiting-list-item consultation-list-item mb-3"
                          >
                            <Row>
                              <Col md={8}>
                                <h5 className="mb-1">{patient.paciente_nombre}</h5>
                                <p className="mb-1 small">{patient.especie} - {patient.raza}</p>
                                <p className="mb-1 small">Veterinario: {patient.veterinario_nombre}</p>
                                <div className="d-flex text-muted small">
                                  <div className="me-3">
                                    <strong>Motivo:</strong> {patient.motivo}
                                  </div>
                                  <div>
                                    <strong>Inicio:</strong> {formatTime(patient.hora_inicio_consulta)} ({calculateWaitingTime(patient.hora_inicio_consulta)})
                                  </div>
                                </div>
                              </Col>
                              <Col md={4} className="d-flex align-items-center justify-content-end">
                                <Button 
                                  variant="outline-warning" 
                                  size="sm" 
                                  className="me-2"
                                  onClick={() => moveToHospitalization(patient.id)}
                                >
                                  <FaHospital className="me-1" />
                                  Hospitalizar
                                </Button>
                                <Button 
                                  variant="outline-danger" 
                                  size="sm"
                                  onClick={() => finishAttention(patient.id)}
                                >
                                  <FaTrashAlt />
                                </Button>
                              </Col>
                            </Row>
                          </div>
                        ))
                      )}
                    </Card.Body>
                  </Card>
                </Tab.Pane>
                
                {/* Pestaña de pacientes hospitalizados */}
                <Tab.Pane eventKey="hospitalized">
                  <Card>
                    <Card.Header className="bg-warning text-white">
                      <h5 className="mb-0">Pacientes Hospitalizados</h5>
                    </Card.Header>
                    <Card.Body>
                      {hospitalizedPatients.length === 0 ? (
                        <p className="text-center text-muted my-3">No hay pacientes hospitalizados</p>
                      ) : (
                        hospitalizedPatients.map(patient => (
                          <div 
                            key={patient.id}
                            className="waiting-list-item hospitalization-list-item mb-3"
                          >
                            <Row>
                              <Col md={8}>
                                <h5 className="mb-1">{patient.paciente_nombre}</h5>
                                <p className="mb-1 small">{patient.especie} - {patient.raza}</p>
                                <p className="mb-1 small">Veterinario: {patient.veterinario_nombre}</p>
                                <div className="d-flex text-muted small mb-1">
                                  <div className="me-3">
                                    <strong>Motivo:</strong> {patient.motivo_hospitalizacion}
                                  </div>
                                  <div>
                                    <strong>Estado:</strong> {patient.estado_paciente}
                                  </div>
                                </div>
                                <div className="text-muted small">
                                  <strong>Ingreso:</strong> {formatTime(patient.hora_hospitalizacion)} ({calculateWaitingTime(patient.hora_hospitalizacion)})
                                </div>
                              </Col>
                              <Col md={4} className="d-flex align-items-center justify-content-end">
                                <Link 
                                  to={`/hospitalizacion/${patient.id}`} 
                                  className="btn btn-outline-primary btn-sm me-2"
                                >
                                  <FaArrowRight className="me-1" />
                                  Ver detalles
                                </Link>
                                <Button 
                                  variant="outline-danger" 
                                  size="sm"
                                  onClick={() => finishAttention(patient.id)}
                                >
                                  <FaTrashAlt />
                                </Button>
                              </Col>
                            </Row>
                          </div>
                        ))
                      )}
                    </Card.Body>
                  </Card>
                </Tab.Pane>
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      )}
      
      {/* Modal para agregar paciente */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Paciente a Sala de Espera</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddPatient}>
            <Form.Group className="mb-3">
              <Form.Label>ID de Paciente</Form.Label>
              <Form.Control 
                type="number" 
                placeholder="Ingrese ID del paciente" 
                value={newPatient.paciente_id}
                onChange={(e) => setNewPatient({...newPatient, paciente_id: e.target.value})}
                required
              />
              <Form.Text className="text-muted">
                Para fines de demo, puede ingresar cualquier número
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Motivo de Consulta</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3}
                placeholder="Describa el motivo de la consulta" 
                value={newPatient.motivo}
                onChange={(e) => setNewPatient({...newPatient, motivo: e.target.value})}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Prioridad</Form.Label>
              <Form.Select
                value={newPatient.prioridad}
                onChange={(e) => setNewPatient({...newPatient, prioridad: e.target.value})}
              >
                <option value="normal">Normal</option>
                <option value="alta">Alta</option>
              </Form.Select>
            </Form.Group>
            
            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={() => setShowAddModal(false)}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit">
                Agregar Paciente
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default WaitingRoom; 