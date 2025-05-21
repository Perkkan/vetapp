import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Form, InputGroup, Badge, Button, Spinner, Alert, Modal, Tabs, Tab } from 'react-bootstrap';
import { FaSearch, FaEye, FaClipboardCheck, FaUserMd, FaCalendarAlt, FaClock, FaPen, FaPaw, FaHospital, FaFileMedical, FaRegSave } from 'react-icons/fa';
import axios from 'axios';

const Consultations = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeConsultations, setActiveConsultations] = useState([]);
  const [filteredConsultations, setFilteredConsultations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [formData, setFormData] = useState({
    diagnostico: '',
    tratamiento: '',
    observaciones: '',
    necesita_hospitalizacion: false
  });
  const [activeTab, setActiveTab] = useState('active');
  const [completedConsultations, setCompletedConsultations] = useState([]);
  const [filteredCompletedConsultations, setFilteredCompletedConsultations] = useState([]);

  // Cargar datos de consultas activas
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Consultas activas
        const activeResponse = await axios.get('http://localhost:5000/api/sala-espera/consulta');
        setActiveConsultations(activeResponse.data);
        setFilteredConsultations(activeResponse.data);
        
        // Simulamos consultas completadas (en un sistema real, habría un endpoint para esto)
        // Esta es solo información de muestra
        const completedData = [
          {
            id: 101,
            paciente_id: 101,
            paciente_nombre: "Firulais",
            especie: "Perro",
            raza: "Labrador",
            motivo: "Vacunación anual",
            hora_inicio_consulta: new Date(Date.now() - 24*60*60000).toISOString(),
            hora_fin_consulta: new Date(Date.now() - 24*60*60000 + 30*60000).toISOString(),
            veterinario_id: 1,
            veterinario_nombre: "Dr. Martínez",
            diagnostico: "Animal sano",
            tratamiento: "Vacuna polivalente",
            observaciones: "Próxima vacunación en un año"
          },
          {
            id: 102,
            paciente_id: 102,
            paciente_nombre: "Michu",
            especie: "Gato",
            raza: "Siamés",
            motivo: "Conjuntivitis",
            hora_inicio_consulta: new Date(Date.now() - 48*60*60000).toISOString(),
            hora_fin_consulta: new Date(Date.now() - 48*60*60000 + 45*60000).toISOString(),
            veterinario_id: 2,
            veterinario_nombre: "Dra. Rodríguez",
            diagnostico: "Conjuntivitis leve",
            tratamiento: "Colirio oftálmico",
            observaciones: "Aplicar tres veces al día durante una semana"
          }
        ];
        
        setCompletedConsultations(completedData);
        setFilteredCompletedConsultations(completedData);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar los datos de consultas. Por favor, intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Actualizar datos cada minuto
    const interval = setInterval(() => {
      fetchData();
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Filtrar consultas cuando cambia el término de búsqueda
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredConsultations([...activeConsultations]);
      setFilteredCompletedConsultations([...completedConsultations]);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    
    // Filtrar consultas activas
    const filteredActive = activeConsultations.filter(consulta => 
      consulta.paciente_nombre.toLowerCase().includes(term) ||
      consulta.motivo?.toLowerCase().includes(term) ||
      consulta.veterinario_nombre?.toLowerCase().includes(term) ||
      consulta.especie?.toLowerCase().includes(term) ||
      consulta.raza?.toLowerCase().includes(term)
    );
    
    // Filtrar consultas completadas
    const filteredCompleted = completedConsultations.filter(consulta => 
      consulta.paciente_nombre.toLowerCase().includes(term) ||
      consulta.motivo?.toLowerCase().includes(term) ||
      consulta.veterinario_nombre?.toLowerCase().includes(term) ||
      consulta.diagnostico?.toLowerCase().includes(term) ||
      consulta.tratamiento?.toLowerCase().includes(term) ||
      consulta.especie?.toLowerCase().includes(term) ||
      consulta.raza?.toLowerCase().includes(term)
    );
    
    setFilteredConsultations(filteredActive);
    setFilteredCompletedConsultations(filteredCompleted);
  }, [searchTerm, activeConsultations, completedConsultations]);

  // Manejar cambio en la búsqueda
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Manejar cambio de tab
  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  // Ver detalle de una consulta
  const handleViewDetail = (consulta) => {
    setSelectedConsultation(consulta);
    setShowConsultationModal(true);
  };

  // Finalizar consulta
  const handleFinishConsultation = (consulta) => {
    setSelectedConsultation(consulta);
    setFormData({
      diagnostico: '',
      tratamiento: '',
      observaciones: '',
      necesita_hospitalizacion: false
    });
    setShowFinishModal(true);
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Guardar resultados de consulta
  const handleSaveConsultation = async () => {
    if (!formData.diagnostico || !formData.tratamiento) {
      alert('Por favor complete al menos el diagnóstico y tratamiento.');
      return;
    }
    
    try {
      // En un sistema real, se enviaría la información al API
      if (formData.necesita_hospitalizacion) {
        await axios.put(`http://localhost:5000/api/sala-espera/${selectedConsultation.id}/hospitalizacion`);
      } else {
        // Finalizar la consulta
        await axios.delete(`http://localhost:5000/api/sala-espera/${selectedConsultation.id}`);
        
        // Registrar en historial médico (simulado)
        const historialData = {
          paciente_id: selectedConsultation.paciente_id,
          tipo: 'Consulta',
          fecha: new Date().toISOString(),
          diagnostico: formData.diagnostico,
          tratamiento: formData.tratamiento,
          observaciones: formData.observaciones,
          veterinario: selectedConsultation.veterinario_nombre
        };
        
        console.log('Registrando en historial:', historialData);
        // En un sistema real: await axios.post(`http://localhost:5000/api/historiales`, historialData);
      }
      
      // Actualizar UI: Remover de activas y añadir a completadas si no se hospitaliza
      if (!formData.necesita_hospitalizacion) {
        const finishedConsultation = {
          ...selectedConsultation,
          hora_fin_consulta: new Date().toISOString(),
          diagnostico: formData.diagnostico,
          tratamiento: formData.tratamiento,
          observaciones: formData.observaciones
        };
        
        setActiveConsultations(prev => prev.filter(c => c.id !== selectedConsultation.id));
        setCompletedConsultations(prev => [finishedConsultation, ...prev]);
      } else {
        setActiveConsultations(prev => prev.filter(c => c.id !== selectedConsultation.id));
      }
      
      setShowFinishModal(false);
      setSelectedConsultation(null);
      
    } catch (err) {
      console.error('Error al finalizar consulta:', err);
      setError('Error al finalizar la consulta. Por favor, intente nuevamente.');
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calcular duración de consulta
  const calculateDuration = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diffMs = end - start;
    const diffMins = Math.round(diffMs / 60000);
    
    return `${diffMins} minutos`;
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

  return (
    <Container fluid className="mt-4">
      <Card>
        <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
          <h3 className="mb-0">
            <FaUserMd className="me-2" />
            Consultas Médicas
          </h3>
        </Card.Header>
        <Card.Body>
          <Row className="mb-3">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Buscar por paciente, motivo, veterinario..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </InputGroup>
            </Col>
          </Row>

          {error && (
            <Alert variant="danger">
              {error}
            </Alert>
          )}

          <Tabs
            activeKey={activeTab}
            onSelect={handleTabChange}
            className="mb-3"
          >
            <Tab eventKey="active" title="Consultas en Progreso">
              {filteredConsultations.length === 0 ? (
                <Alert variant="info">
                  No hay consultas en progreso en este momento.
                </Alert>
              ) : (
                <Table responsive hover className="align-middle">
                  <thead className="table-light">
                    <tr>
                      <th><FaPaw className="me-1" /> Paciente</th>
                      <th>Motivo</th>
                      <th><FaClock className="me-1" /> Inicio</th>
                      <th><FaUserMd className="me-1" /> Veterinario</th>
                      <th className="text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredConsultations.map(consulta => (
                      <tr key={consulta.id}>
                        <td>
                          <div>
                            <strong>{consulta.paciente_nombre}</strong>
                            <div className="small text-muted">
                              {consulta.especie} - {consulta.raza}
                            </div>
                          </div>
                        </td>
                        <td>{consulta.motivo || 'No especificado'}</td>
                        <td>
                          <div>
                            {formatDate(consulta.hora_inicio_consulta)}
                            <div className="small text-muted">
                              Duración: {calculateDuration(consulta.hora_inicio_consulta)}
                            </div>
                          </div>
                        </td>
                        <td>{consulta.veterinario_nombre}</td>
                        <td className="text-center">
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            className="me-2"
                            onClick={() => handleViewDetail(consulta)}
                            title="Ver detalles"
                          >
                            <FaEye />
                          </Button>
                          <Button 
                            variant="outline-success" 
                            size="sm"
                            onClick={() => handleFinishConsultation(consulta)}
                            title="Finalizar consulta"
                          >
                            <FaClipboardCheck />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Tab>
            <Tab eventKey="completed" title="Consultas Completadas">
              {filteredCompletedConsultations.length === 0 ? (
                <Alert variant="info">
                  No hay consultas completadas que coincidan con la búsqueda.
                </Alert>
              ) : (
                <Table responsive hover className="align-middle">
                  <thead className="table-light">
                    <tr>
                      <th><FaPaw className="me-1" /> Paciente</th>
                      <th>Diagnóstico</th>
                      <th>Tratamiento</th>
                      <th><FaCalendarAlt className="me-1" /> Fecha</th>
                      <th>Duración</th>
                      <th><FaUserMd className="me-1" /> Veterinario</th>
                      <th className="text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCompletedConsultations.map(consulta => (
                      <tr key={consulta.id}>
                        <td>
                          <div>
                            <strong>{consulta.paciente_nombre}</strong>
                            <div className="small text-muted">
                              {consulta.especie} - {consulta.raza}
                            </div>
                          </div>
                        </td>
                        <td>{consulta.diagnostico}</td>
                        <td>{consulta.tratamiento}</td>
                        <td>{formatDate(consulta.hora_inicio_consulta)}</td>
                        <td>{calculateDuration(consulta.hora_inicio_consulta, consulta.hora_fin_consulta)}</td>
                        <td>{consulta.veterinario_nombre}</td>
                        <td className="text-center">
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => handleViewDetail(consulta)}
                            title="Ver detalles"
                          >
                            <FaEye />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>

      {/* Modal para ver detalles de consulta */}
      <Modal 
        show={showConsultationModal} 
        onHide={() => setShowConsultationModal(false)}
        size="lg"
      >
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <FaUserMd className="me-2" />
            Detalles de la Consulta
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedConsultation && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <h5 className="border-bottom pb-2">Información del Paciente</h5>
                  <p><strong>Nombre:</strong> {selectedConsultation.paciente_nombre}</p>
                  <p><strong>Especie / Raza:</strong> {selectedConsultation.especie} / {selectedConsultation.raza}</p>
                  <p><strong>ID:</strong> {selectedConsultation.paciente_id}</p>
                </Col>
                <Col md={6}>
                  <h5 className="border-bottom pb-2">Información de la Consulta</h5>
                  <p><strong>Veterinario:</strong> {selectedConsultation.veterinario_nombre}</p>
                  <p><strong>Motivo:</strong> {selectedConsultation.motivo}</p>
                  <p><strong>Fecha de inicio:</strong> {formatDate(selectedConsultation.hora_inicio_consulta)}</p>
                  {selectedConsultation.hora_fin_consulta && (
                    <p><strong>Fecha de finalización:</strong> {formatDate(selectedConsultation.hora_fin_consulta)}</p>
                  )}
                  {selectedConsultation.diagnostico && (
                    <>
                      <h5 className="border-bottom pb-2 mt-4">Resultado de la Consulta</h5>
                      <p><strong>Diagnóstico:</strong> {selectedConsultation.diagnostico}</p>
                      <p><strong>Tratamiento:</strong> {selectedConsultation.tratamiento}</p>
                      {selectedConsultation.observaciones && (
                        <p><strong>Observaciones:</strong> {selectedConsultation.observaciones}</p>
                      )}
                    </>
                  )}
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConsultationModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para finalizar consulta */}
      <Modal 
        show={showFinishModal} 
        onHide={() => setShowFinishModal(false)}
        size="lg"
      >
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>
            <FaClipboardCheck className="me-2" />
            Finalizar Consulta
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedConsultation && (
            <Form>
              <Row className="mb-3">
                <Col md={12}>
                  <Alert variant="info">
                    <strong>Paciente:</strong> {selectedConsultation.paciente_nombre} ({selectedConsultation.especie} - {selectedConsultation.raza})<br />
                    <strong>Motivo:</strong> {selectedConsultation.motivo}<br />
                    <strong>Veterinario:</strong> {selectedConsultation.veterinario_nombre}
                  </Alert>
                </Col>
              </Row>
              
              <Form.Group className="mb-3">
                <Form.Label><FaPen className="me-2" /> Diagnóstico</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={3}
                  name="diagnostico"
                  value={formData.diagnostico}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label><FaFileMedical className="me-2" /> Tratamiento</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={3}
                  name="tratamiento"
                  value={formData.tratamiento}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label><FaPen className="me-2" /> Observaciones</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={2}
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleInputChange}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Check 
                  type="checkbox"
                  id="necesita-hospitalizacion"
                  label="Requiere hospitalización"
                  name="necesita_hospitalizacion"
                  checked={formData.necesita_hospitalizacion}
                  onChange={handleInputChange}
                />
                {formData.necesita_hospitalizacion && (
                  <Alert variant="warning" className="mt-2">
                    <FaHospital className="me-2" />
                    El paciente será transferido al módulo de hospitalización automáticamente al guardar.
                  </Alert>
                )}
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowFinishModal(false)}>
            Cancelar
          </Button>
          <Button variant="success" onClick={handleSaveConsultation}>
            <FaRegSave className="me-2" />
            Guardar y Finalizar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Consultations; 