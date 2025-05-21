import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Badge, Modal, Alert, Spinner, Tabs, Tab } from 'react-bootstrap';
import { FaFlask, FaEdit, FaPlus, FaSearch, FaCheck, FaUserMd, FaClock, FaFileMedical, FaSave, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

// URL base de la API
const API_URL = 'http://localhost:5001';

const Laboratory = () => {
  const navigate = useNavigate();
  const { id: pacienteId } = useParams();
  
  // Estados para gestionar la interfaz
  const [activeTab, setActiveTab] = useState('todos');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Estados para los estudios de laboratorio
  const [estudios, setEstudios] = useState([]);
  const [filtroEstudios, setFiltroEstudios] = useState('');
  const [estudioSeleccionado, setEstudioSeleccionado] = useState(null);
  const [showEstudioForm, setShowEstudioForm] = useState(false);
  const [showDetalleEstudio, setShowDetalleEstudio] = useState(false);
  
  // Estado para el formulario de nuevo estudio
  const [nuevoEstudio, setNuevoEstudio] = useState({
    id_clinica: 1, // Por defecto es la clínica 1
    paciente_id: pacienteId || null,
    tipo: '',
    resultados: '',
    observaciones: '',
    veterinario_id: 1, // Por defecto es el usuario 1
    estado: 'pendiente'
  });
  
  // Estados para pacientes (cuando se crea un estudio sin paciente específico)
  const [pacientes, setPacientes] = useState([]);
  const [showBuscarPaciente, setShowBuscarPaciente] = useState(false);
  const [filtroPacientes, setFiltroPacientes] = useState('');
  
  // Cargar datos iniciales
  useEffect(() => {
    cargarEstudios();
    cargarPacientes();
  }, [pacienteId]);
  
  // Función para cargar los estudios de laboratorio desde la API
  const cargarEstudios = async () => {
    setLoading(true);
    setError(null);
    try {
      let response;
      
      if (pacienteId) {
        // Si tenemos un pacienteId, cargamos solo los estudios de ese paciente
        response = await axios.get(`${API_URL}/api/laboratorio/paciente/${pacienteId}`);
      } else {
        // Si no, cargamos todos los estudios
        response = await axios.get(`${API_URL}/api/laboratorio`);
      }
      
      setEstudios(response.data);
    } catch (err) {
      console.error('Error al cargar estudios de laboratorio:', err);
      setError('Error al cargar los estudios de laboratorio. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };
  
  // Función para cargar pacientes desde la API
  const cargarPacientes = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/pacientes`);
      setPacientes(response.data);
    } catch (err) {
      console.error('Error al cargar pacientes:', err);
    }
  };
  
  // Función para crear un nuevo estudio de laboratorio
  const crearEstudio = async () => {
    if (!nuevoEstudio.paciente_id) {
      setError('Debe seleccionar un paciente');
      return;
    }
    
    if (!nuevoEstudio.tipo) {
      setError('El tipo de estudio es obligatorio');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/api/laboratorio`, nuevoEstudio);
      
      setSuccess('Estudio de laboratorio registrado correctamente');
      setShowEstudioForm(false);
      setNuevoEstudio({
        id_clinica: 1,
        paciente_id: pacienteId || null,
        tipo: '',
        resultados: '',
        observaciones: '',
        veterinario_id: 1,
        estado: 'pendiente'
      });
      
      // Recargar los estudios
      cargarEstudios();
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error al crear estudio de laboratorio:', err);
      setError('Error al registrar el estudio. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };
  
  // Función para actualizar un estudio de laboratorio
  const actualizarEstudio = async () => {
    if (!estudioSeleccionado.id) {
      setError('No se ha seleccionado ningún estudio para actualizar');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(
        `${API_URL}/api/laboratorio/${estudioSeleccionado.id}`, 
        estudioSeleccionado
      );
      
      setSuccess('Estudio de laboratorio actualizado correctamente');
      setShowDetalleEstudio(false);
      
      // Recargar los estudios
      cargarEstudios();
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error al actualizar estudio de laboratorio:', err);
      setError('Error al actualizar el estudio. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };
  
  // Función para seleccionar un paciente
  const seleccionarPaciente = (paciente) => {
    setNuevoEstudio({
      ...nuevoEstudio,
      paciente_id: paciente.id
    });
    setShowBuscarPaciente(false);
  };
  
  // Filtrar estudios según el término de búsqueda y el estado
  const estudiosFiltrados = estudios.filter(estudio => {
    const matchesBusqueda = 
      estudio.tipo.toLowerCase().includes(filtroEstudios.toLowerCase()) ||
      (estudio.paciente_nombre && estudio.paciente_nombre.toLowerCase().includes(filtroEstudios.toLowerCase()));
    
    const matchesEstado = 
      activeTab === 'todos' || 
      (activeTab === 'pendientes' && estudio.estado === 'pendiente') ||
      (activeTab === 'completados' && estudio.estado === 'completado');
    
    return matchesBusqueda && matchesEstado;
  });
  
  // Filtrar pacientes según el término de búsqueda
  const pacientesFiltrados = pacientes.filter(paciente => 
    paciente.nombre.toLowerCase().includes(filtroPacientes.toLowerCase())
  );
  
  // Obtener el nombre del paciente seleccionado
  const nombrePacienteSeleccionado = () => {
    if (nuevoEstudio.paciente_id) {
      const paciente = pacientes.find(p => p.id === nuevoEstudio.paciente_id);
      return paciente ? paciente.nombre : 'Paciente seleccionado';
    }
    return 'Seleccionar paciente';
  };

  return (
    <Container fluid className="mt-4">
      <h2 className="mb-4"><FaFlask /> Laboratorio Clínico</h2>
      
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert variant="success" onClose={() => setSuccess(null)} dismissible>
          {success}
        </Alert>
      )}
      
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <Tabs activeKey={activeTab} onSelect={k => setActiveTab(k)} className="mb-0">
            <Tab eventKey="todos" title="Todos los estudios" />
            <Tab eventKey="pendientes" title="Pendientes" />
            <Tab eventKey="completados" title="Completados" />
          </Tabs>
          
          <Button variant="success" onClick={() => {
            setNuevoEstudio({
              id_clinica: 1,
              paciente_id: pacienteId || null,
              tipo: '',
              resultados: '',
              observaciones: '',
              veterinario_id: 1,
              estado: 'pendiente'
            });
            setShowEstudioForm(true);
          }}>
            <FaPlus /> Nuevo Estudio
          </Button>
        </Card.Header>
        
        <Card.Body>
          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              placeholder="Buscar por tipo de estudio o paciente..."
              value={filtroEstudios}
              onChange={e => setFiltroEstudios(e.target.value)}
            />
          </Form.Group>
          
          {loading ? (
            <div className="text-center my-4">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <div className="table-responsive">
              <Table striped hover>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Fecha</th>
                    <th>Paciente</th>
                    <th>Tipo de Estudio</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {estudiosFiltrados.length > 0 ? (
                    estudiosFiltrados.map(estudio => (
                      <tr key={estudio.id}>
                        <td>{estudio.id}</td>
                        <td>{new Date(estudio.fecha).toLocaleDateString()}</td>
                        <td>{estudio.paciente_nombre}</td>
                        <td>{estudio.tipo}</td>
                        <td>
                          <Badge bg={estudio.estado === 'completado' ? 'success' : 'warning'}>
                            {estudio.estado}
                          </Badge>
                        </td>
                        <td>
                          <Button 
                            variant="info" 
                            size="sm"
                            className="me-1"
                            onClick={() => {
                              setEstudioSeleccionado(estudio);
                              setShowDetalleEstudio(true);
                            }}
                          >
                            <FaSearch /> Ver
                          </Button>
                          <Button 
                            variant="primary" 
                            size="sm"
                            onClick={() => {
                              setEstudioSeleccionado(estudio);
                              setShowDetalleEstudio(true);
                            }}
                          >
                            <FaEdit /> Editar
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center">No hay estudios de laboratorio registrados</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
      
      {/* Modal para crear nuevo estudio */}
      <Modal show={showEstudioForm} onHide={() => setShowEstudioForm(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Nuevo Estudio de Laboratorio</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Paciente</Form.Label>
              <div className="d-flex">
                <Form.Control
                  type="text"
                  value={nombrePacienteSeleccionado()}
                  readOnly
                  className="me-2"
                />
                <Button variant="secondary" onClick={() => setShowBuscarPaciente(true)}>
                  <FaSearch /> Buscar
                </Button>
              </div>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Tipo de Estudio</Form.Label>
              <Form.Control as="select" 
                value={nuevoEstudio.tipo}
                onChange={e => setNuevoEstudio({...nuevoEstudio, tipo: e.target.value})}
              >
                <option value="">Seleccione un tipo...</option>
                <option value="Hemograma">Hemograma</option>
                <option value="Bioquímica Sanguínea">Bioquímica Sanguínea</option>
                <option value="Análisis de Orina">Análisis de Orina</option>
                <option value="Coprológico">Coprológico</option>
                <option value="Serología">Serología</option>
                <option value="Citología">Citología</option>
                <option value="Radiografía">Radiografía</option>
                <option value="Ecografía">Ecografía</option>
                <option value="Otro">Otro</option>
              </Form.Control>
            </Form.Group>
            
            {nuevoEstudio.tipo === 'Otro' && (
              <Form.Group className="mb-3">
                <Form.Label>Especifique el tipo</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Especifique el tipo de estudio"
                  value={nuevoEstudio.tipo_otro || ''}
                  onChange={e => setNuevoEstudio({...nuevoEstudio, tipo_otro: e.target.value, tipo: e.target.value})}
                />
              </Form.Group>
            )}
            
            <Form.Group className="mb-3">
              <Form.Label>Resultados</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Resultados del estudio (puede completarse después)"
                value={nuevoEstudio.resultados || ''}
                onChange={e => setNuevoEstudio({...nuevoEstudio, resultados: e.target.value})}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Observaciones</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Observaciones adicionales"
                value={nuevoEstudio.observaciones || ''}
                onChange={e => setNuevoEstudio({...nuevoEstudio, observaciones: e.target.value})}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Estado</Form.Label>
              <Form.Control as="select"
                value={nuevoEstudio.estado}
                onChange={e => setNuevoEstudio({...nuevoEstudio, estado: e.target.value})}
              >
                <option value="pendiente">Pendiente</option>
                <option value="completado">Completado</option>
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEstudioForm(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={crearEstudio} disabled={loading}>
            {loading ? <Spinner size="sm" animation="border" /> : <><FaSave /> Guardar Estudio</>}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Modal para buscar paciente */}
      <Modal show={showBuscarPaciente} onHide={() => setShowBuscarPaciente(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Buscar Paciente</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              placeholder="Buscar por nombre del paciente..."
              value={filtroPacientes}
              onChange={e => setFiltroPacientes(e.target.value)}
            />
          </Form.Group>
          
          <div className="table-responsive">
            <Table striped hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Especie</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pacientesFiltrados.length > 0 ? (
                  pacientesFiltrados.map(paciente => (
                    <tr key={paciente.id}>
                      <td>{paciente.id}</td>
                      <td>{paciente.nombre}</td>
                      <td>{paciente.especie}</td>
                      <td>
                        <Button variant="primary" size="sm" onClick={() => seleccionarPaciente(paciente)}>
                          <FaCheck /> Seleccionar
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center">No se encontraron pacientes</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBuscarPaciente(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Modal para ver/editar estudio */}
      <Modal show={showDetalleEstudio} onHide={() => setShowDetalleEstudio(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {estudioSeleccionado?.tipo} - {estudioSeleccionado?.paciente_nombre}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {estudioSeleccionado && (
            <Form>
              <Row>
                <Col md={6}>
                  <p><strong>Fecha:</strong> {new Date(estudioSeleccionado.fecha).toLocaleString()}</p>
                  <p><strong>Paciente:</strong> {estudioSeleccionado.paciente_nombre}</p>
                  <p><strong>Tipo:</strong> {estudioSeleccionado.tipo}</p>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Estado</Form.Label>
                    <Form.Control as="select"
                      value={estudioSeleccionado.estado}
                      onChange={e => setEstudioSeleccionado({
                        ...estudioSeleccionado, 
                        estado: e.target.value
                      })}
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="completado">Completado</option>
                    </Form.Control>
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3">
                <Form.Label>Resultados</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={estudioSeleccionado.resultados || ''}
                  onChange={e => setEstudioSeleccionado({
                    ...estudioSeleccionado, 
                    resultados: e.target.value
                  })}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Observaciones</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={estudioSeleccionado.observaciones || ''}
                  onChange={e => setEstudioSeleccionado({
                    ...estudioSeleccionado, 
                    observaciones: e.target.value
                  })}
                />
              </Form.Group>
              
              {estudioSeleccionado.veterinario_nombre && (
                <p><strong>Veterinario:</strong> {estudioSeleccionado.veterinario_nombre}</p>
              )}
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetalleEstudio(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={actualizarEstudio} disabled={loading}>
            {loading ? <Spinner size="sm" animation="border" /> : <><FaSave /> Guardar Cambios</>}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Laboratory; 