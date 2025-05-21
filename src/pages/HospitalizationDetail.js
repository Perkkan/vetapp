import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Form, Button, Alert, Spinner, Nav, Tab } from 'react-bootstrap';
import { FaSave, FaArrowLeft, FaClipboardCheck, FaPills, FaNotesMedical, FaFileMedical } from 'react-icons/fa';
import axios from 'axios';

const HospitalizationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    motivo_hospitalizacion: '',
    estado_paciente: '',
    fecha_prevista_alta: '',
    procedimientos_realizados: '',
    medicacion_actual: '',
    notas_hospitalizacion: ''
  });
  
  // Cargar los datos del paciente
  useEffect(() => {
    const fetchPatientData = async () => {
      setLoading(true);
      setError('');
      
      try {
        const response = await axios.get(`http://localhost:5000/api/sala-espera/hospitalizados/${id}`);
        setPatient(response.data);
        
        // Inicializar el formulario con los datos del paciente
        setFormData({
          motivo_hospitalizacion: response.data.motivo_hospitalizacion || '',
          estado_paciente: response.data.estado_paciente || '',
          fecha_prevista_alta: response.data.fecha_prevista_alta ? new Date(response.data.fecha_prevista_alta).toISOString().split('T')[0] : '',
          procedimientos_realizados: response.data.procedimientos_realizados || '',
          medicacion_actual: response.data.medicacion_actual || '',
          notas_hospitalizacion: response.data.notas_hospitalizacion || ''
        });
      } catch (err) {
        console.error('Error al cargar datos del paciente:', err);
        setError('Error al cargar datos del paciente hospitalizado. Por favor, intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPatientData();
  }, [id]);
  
  // Manejar los cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  // Guardar la actualización
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    
    try {
      await axios.put(`http://localhost:5000/api/sala-espera/${id}/hospitalizacion/actualizar`, formData);
      // Actualizar los datos del paciente después de guardar
      const updatedPatient = { ...patient, ...formData };
      setPatient(updatedPatient);
      
      alert('Información actualizada correctamente');
    } catch (err) {
      console.error('Error al actualizar la información:', err);
      setError('Error al actualizar la información. Por favor, intente nuevamente.');
    } finally {
      setSaving(false);
    }
  };
  
  // Formatear la fecha para mostrar
  const formatDate = (isoDate) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    return date.toLocaleDateString('es-ES');
  };
  
  // Calcular tiempo de hospitalización
  const calculateHospitalizationTime = (startDate) => {
    if (!startDate) return '';
    
    const start = new Date(startDate);
    const now = new Date();
    const diffMs = now - start;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      return `${diffHours} horas`;
    } else {
      const days = Math.floor(diffHours / 24);
      const hours = diffHours % 24;
      return `${days} días y ${hours} horas`;
    }
  };
  
  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Cargando información del paciente...</p>
      </div>
    );
  }
  
  if (!patient) {
    return (
      <Alert variant="danger">
        No se encontró información del paciente con ID {id}
      </Alert>
    );
  }
  
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <Button 
            variant="outline-secondary" 
            className="me-3"
            onClick={() => navigate('/sala-espera')}
          >
            <FaArrowLeft className="me-1" />
            Volver
          </Button>
          <h2 className="mb-0">Ficha de Hospitalización</h2>
        </div>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Row className="mb-4">
        <Col md={12} lg={4} className="mb-4 mb-lg-0">
          <Card className="patient-detail-card shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Información del Paciente</h5>
            </Card.Header>
            <Card.Body>
              <h4>{patient.paciente_nombre}</h4>
              <ul className="list-unstyled">
                <li><strong>Especie:</strong> {patient.especie}</li>
                <li><strong>Raza:</strong> {patient.raza}</li>
                {patient.sexo && <li><strong>Sexo:</strong> {patient.sexo}</li>}
                {patient.peso && <li><strong>Peso:</strong> {patient.peso} kg</li>}
                <li><strong>Propietario:</strong> {patient.propietario_nombre}</li>
                <li><strong>Teléfono:</strong> {patient.propietario_telefono}</li>
                <li><strong>Veterinario:</strong> {patient.veterinario_nombre}</li>
                <li className="mt-2"><strong>Hospitalizado desde:</strong> {formatDate(patient.hora_hospitalizacion)}</li>
                <li><strong>Tiempo hospitalizado:</strong> {calculateHospitalizationTime(patient.hora_hospitalizacion)}</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={12} lg={8}>
          <Card className="shadow-sm">
            <Card.Header className="bg-light">
              <Tab.Container defaultActiveKey="general">
                <Nav variant="tabs">
                  <Nav.Item>
                    <Nav.Link eventKey="general" className="d-flex align-items-center">
                      <FaClipboardCheck className="me-1" />
                      Estado General
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="treatment" className="d-flex align-items-center">
                      <FaPills className="me-1" />
                      Tratamiento
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="notes" className="d-flex align-items-center">
                      <FaNotesMedical className="me-1" />
                      Notas
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Tab.Container>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Tab.Content>
                  {/* Pestaña de información general */}
                  <Tab.Pane eventKey="general">
                    <h5 className="mb-3">Información General</h5>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Motivo de Hospitalización</Form.Label>
                      <Form.Control 
                        as="textarea" 
                        rows={2}
                        name="motivo_hospitalizacion"
                        value={formData.motivo_hospitalizacion}
                        onChange={handleChange}
                      />
                    </Form.Group>
                    
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Estado del Paciente</Form.Label>
                          <Form.Select
                            name="estado_paciente"
                            value={formData.estado_paciente}
                            onChange={handleChange}
                          >
                            <option value="">Seleccionar estado</option>
                            <option value="Estable">Estable</option>
                            <option value="En tratamiento">En tratamiento</option>
                            <option value="En observación">En observación</option>
                            <option value="Crítico">Crítico</option>
                            <option value="En recuperación">En recuperación</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Fecha Prevista de Alta</Form.Label>
                          <Form.Control 
                            type="date"
                            name="fecha_prevista_alta"
                            value={formData.fecha_prevista_alta}
                            onChange={handleChange}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Tab.Pane>
                  
                  {/* Pestaña de tratamiento */}
                  <Tab.Pane eventKey="treatment">
                    <h5 className="mb-3">Tratamiento y Procedimientos</h5>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Procedimientos Realizados</Form.Label>
                      <Form.Control 
                        as="textarea" 
                        rows={4}
                        name="procedimientos_realizados"
                        value={formData.procedimientos_realizados}
                        onChange={handleChange}
                        placeholder="Detalle los procedimientos realizados durante la hospitalización"
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Medicación Actual</Form.Label>
                      <Form.Control 
                        as="textarea" 
                        rows={4}
                        name="medicacion_actual"
                        value={formData.medicacion_actual}
                        onChange={handleChange}
                        placeholder="Detallar medicamentos, dosis y frecuencia"
                      />
                    </Form.Group>
                  </Tab.Pane>
                  
                  {/* Pestaña de notas */}
                  <Tab.Pane eventKey="notes">
                    <h5 className="mb-3">Notas de Hospitalización</h5>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Notas y Observaciones</Form.Label>
                      <Form.Control 
                        as="textarea" 
                        rows={8}
                        name="notas_hospitalizacion"
                        value={formData.notas_hospitalizacion}
                        onChange={handleChange}
                        placeholder="Observaciones adicionales, evolución del paciente, instrucciones especiales, etc."
                      />
                    </Form.Group>
                  </Tab.Pane>
                </Tab.Content>
                
                <div className="d-flex justify-content-end mt-3">
                  <Button 
                    variant="primary" 
                    type="submit"
                    disabled={saving}
                    className="d-flex align-items-center"
                  >
                    {saving ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <FaSave className="me-2" />
                        Guardar Cambios
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default HospitalizationDetail; 