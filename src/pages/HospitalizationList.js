import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Form, InputGroup, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaEye, FaCheck, FaHospital, FaCalendarAlt, FaClock, FaUserMd } from 'react-icons/fa';
import axios from 'axios';

const HospitalizationList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pacientes, setPacientes] = useState([]);
  const [filteredPacientes, setFilteredPacientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar datos de pacientes hospitalizados
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      
      try {
        const response = await axios.get('http://localhost:5000/api/sala-espera/hospitalizados');
        setPacientes(response.data);
        setFilteredPacientes(response.data);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar los datos de hospitalizaciones. Por favor, intente nuevamente.');
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

  // Filtrar pacientes cuando cambia el término de búsqueda
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPacientes([...pacientes]);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = pacientes.filter(paciente => 
      paciente.paciente_nombre.toLowerCase().includes(term) ||
      paciente.motivo_hospitalizacion?.toLowerCase().includes(term) ||
      paciente.estado_paciente?.toLowerCase().includes(term) ||
      paciente.veterinario_nombre?.toLowerCase().includes(term)
    );
    
    setFilteredPacientes(filtered);
  }, [searchTerm, pacientes]);

  // Manejar cambio en la búsqueda
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Ver detalle de un paciente hospitalizado
  const handleViewDetail = (id) => {
    navigate(`/hospitalizacion/${id}`);
  };

  // Dar de alta a un paciente
  const handleDischarge = async (id) => {
    if (!window.confirm('¿Está seguro que desea dar de alta a este paciente?')) {
      return;
    }
    
    try {
      await axios.delete(`http://localhost:5000/api/sala-espera/${id}`);
      
      // Actualizar la lista tras el alta
      setPacientes(prevPacientes => prevPacientes.filter(p => p.id !== id));
      setFilteredPacientes(prevFiltered => prevFiltered.filter(p => p.id !== id));
      
    } catch (err) {
      console.error('Error al dar de alta al paciente:', err);
      setError('Error al dar de alta al paciente. Por favor, intente nuevamente.');
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Calcular tiempo de hospitalización
  const calculateHospitalizationTime = (startDate) => {
    if (!startDate) return 'Desconocido';
    
    const start = new Date(startDate);
    const now = new Date();
    const diffMs = now - start;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      return `${diffHours} horas`;
    } else {
      const days = Math.floor(diffHours / 24);
      const hours = diffHours % 24;
      return `${days} día${days > 1 ? 's' : ''} y ${hours} horas`;
    }
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
            <FaHospital className="me-2" />
            Pacientes Hospitalizados
          </h3>
          <Badge bg="light" text="dark" className="px-3 py-2 rounded-pill">
            {filteredPacientes.length} paciente{filteredPacientes.length !== 1 ? 's' : ''}
          </Badge>
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
                  placeholder="Buscar por paciente, motivo, estado o veterinario..."
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

          {filteredPacientes.length === 0 ? (
            <Alert variant="info">
              No hay pacientes hospitalizados en este momento.
            </Alert>
          ) : (
            <Table responsive hover className="align-middle">
              <thead className="table-light">
                <tr>
                  <th><FaHospital className="me-1" /> ID</th>
                  <th>Paciente</th>
                  <th><FaClock className="me-1" /> Ingreso</th>
                  <th>Motivo</th>
                  <th>Estado</th>
                  <th><FaCalendarAlt className="me-1" /> Alta Prevista</th>
                  <th><FaUserMd className="me-1" /> Veterinario</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredPacientes.map(paciente => (
                  <tr key={paciente.id}>
                    <td>#{paciente.id}</td>
                    <td>
                      <div>
                        <strong>{paciente.paciente_nombre}</strong>
                        <div className="small text-muted">
                          {paciente.especie} - {paciente.raza}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        {formatDate(paciente.hora_hospitalizacion)}
                        <div className="small text-muted">
                          {calculateHospitalizationTime(paciente.hora_hospitalizacion)}
                        </div>
                      </div>
                    </td>
                    <td>
                      {paciente.motivo_hospitalizacion || 'No especificado'}
                    </td>
                    <td>
                      <Badge bg={
                        paciente.estado_paciente === 'Estable' ? 'success' :
                        paciente.estado_paciente === 'En tratamiento' ? 'info' :
                        paciente.estado_paciente === 'En observación' ? 'warning' :
                        paciente.estado_paciente === 'Crítico' ? 'danger' :
                        paciente.estado_paciente === 'En recuperación' ? 'primary' :
                        'secondary'
                      }>
                        {paciente.estado_paciente || 'No especificado'}
                      </Badge>
                    </td>
                    <td>{formatDate(paciente.fecha_prevista_alta)}</td>
                    <td>{paciente.veterinario_nombre}</td>
                    <td className="text-center">
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        className="me-2"
                        onClick={() => handleViewDetail(paciente.id)}
                        title="Ver detalles"
                      >
                        <FaEye />
                      </Button>
                      <Button 
                        variant="outline-success" 
                        size="sm"
                        onClick={() => handleDischarge(paciente.id)}
                        title="Dar de alta"
                      >
                        <FaCheck />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default HospitalizationList; 