import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Table, Form, 
  InputGroup, Button, Badge, Pagination, Spinner, Alert 
} from 'react-bootstrap';
import { 
  FaSearch, FaFileAlt, FaPaw, FaEye, FaCalendarAlt, FaUserFriends
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const HistoryList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pacientes, setPacientes] = useState([]);
  const [filteredPacientes, setFilteredPacientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Cargar datos de pacientes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      
      try {
        // En una aplicación real, esta sería una llamada a la API
        // const pacientesResponse = await axios.get('http://localhost:5000/api/pacientes');
        
        // Simulamos la carga de datos con un timeout
        setTimeout(() => {
          // Datos de muestra de pacientes
          const pacientesMuestra = [
            { 
              id: 101, 
              nombre: 'Firulais', 
              especie: 'Perro', 
              raza: 'Labrador', 
              propietario_nombre: 'Juan Pérez',
              propietario_telefono: '555-1234',
              ultima_visita: '2023-07-20',
              historial_count: 4
            },
            { 
              id: 102, 
              nombre: 'Michu', 
              especie: 'Gato', 
              raza: 'Siamés', 
              propietario_nombre: 'María González',
              propietario_telefono: '555-5678',
              ultima_visita: '2023-05-20',
              historial_count: 2
            },
            { 
              id: 103, 
              nombre: 'Rocky', 
              especie: 'Perro', 
              raza: 'Bulldog', 
              propietario_nombre: 'Carlos Sánchez',
              propietario_telefono: '555-9012',
              ultima_visita: '2023-06-18',
              historial_count: 1
            },
            { 
              id: 104, 
              nombre: 'Luna', 
              especie: 'Perro', 
              raza: 'Pastor Alemán', 
              propietario_nombre: 'Roberto Sánchez',
              propietario_telefono: '555-9876',
              ultima_visita: '2023-03-15',
              historial_count: 0
            },
            { 
              id: 105, 
              nombre: 'Simba', 
              especie: 'Gato', 
              raza: 'Persa', 
              propietario_nombre: 'Carla Moreno',
              propietario_telefono: '555-4321',
              ultima_visita: '2023-01-10',
              historial_count: 0
            }
          ];
          
          setPacientes(pacientesMuestra);
          setFilteredPacientes(pacientesMuestra);
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar los datos de pacientes. Por favor, intente nuevamente.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filtrar pacientes cuando cambia el término de búsqueda
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPacientes([...pacientes]);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = pacientes.filter(paciente => 
      paciente.nombre.toLowerCase().includes(term) ||
      paciente.especie.toLowerCase().includes(term) ||
      paciente.raza.toLowerCase().includes(term) ||
      paciente.propietario_nombre.toLowerCase().includes(term) ||
      paciente.propietario_telefono.includes(term)
    );
    
    setFilteredPacientes(filtered);
    setCurrentPage(1); // Resetear a la primera página al filtrar
  }, [searchTerm, pacientes]);

  // Manejar cambio en la búsqueda
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Ver historial de un paciente específico
  const handleViewPatientHistory = (pacienteId) => {
    navigate(`/pacientes/historial/${pacienteId}`);
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'Sin registros';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPacientes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPacientes.length / itemsPerPage);

  // Generar ítems de paginación
  const paginationItems = [];
  for (let number = 1; number <= totalPages; number++) {
    paginationItems.push(
      <Pagination.Item 
        key={number} 
        active={number === currentPage}
        onClick={() => setCurrentPage(number)}
      >
        {number}
      </Pagination.Item>
    );
  }

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
        <Card.Header>
          <h3 className="mb-0">Historiales Médicos</h3>
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
                  placeholder="Buscar paciente por nombre, especie, raza o propietario..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </InputGroup>
            </Col>
            <Col md={6} className="text-end">
              <Badge bg="secondary" className="p-2">
                Total: {filteredPacientes.length} pacientes
              </Badge>
            </Col>
          </Row>

          {error && (
            <Alert variant="danger">
              {error}
            </Alert>
          )}

          <Alert variant="info">
            <FaFileAlt className="me-2" />
            Seleccione un paciente para ver su historial médico completo
          </Alert>

          {filteredPacientes.length === 0 ? (
            <Alert variant="warning">
              No se encontraron pacientes con los criterios de búsqueda actuales.
            </Alert>
          ) : (
            <>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th><FaPaw className="me-1" /> Paciente</th>
                    <th>Especie / Raza</th>
                    <th><FaUserFriends className="me-1" /> Propietario</th>
                    <th><FaCalendarAlt className="me-1" /> Última Visita</th>
                    <th>Registros</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map(paciente => (
                    <tr key={paciente.id}>
                      <td>
                        <strong>{paciente.nombre}</strong>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <Badge 
                            bg={paciente.especie === 'Perro' ? 'primary' : 'info'}
                            className="text-white me-2"
                          >
                            {paciente.especie}
                          </Badge>
                          <span>{paciente.raza}</span>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div>{paciente.propietario_nombre}</div>
                          <div className="text-muted small">{paciente.propietario_telefono}</div>
                        </div>
                      </td>
                      <td>{formatDate(paciente.ultima_visita)}</td>
                      <td>
                        <Badge 
                          bg={paciente.historial_count > 0 ? 'success' : 'secondary'}
                          className="text-white"
                        >
                          {paciente.historial_count} {paciente.historial_count === 1 ? 'registro' : 'registros'}
                        </Badge>
                      </td>
                      <td>
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => handleViewPatientHistory(paciente.id)}
                        >
                          <FaEye className="me-1" /> Ver Historial
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <div className="d-flex justify-content-center mt-4">
                <Pagination>
                  <Pagination.First 
                    onClick={() => setCurrentPage(1)} 
                    disabled={currentPage === 1}
                  />
                  <Pagination.Prev 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                    disabled={currentPage === 1}
                  />
                  
                  {paginationItems}
                  
                  <Pagination.Next 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                    disabled={currentPage === totalPages}
                  />
                  <Pagination.Last 
                    onClick={() => setCurrentPage(totalPages)} 
                    disabled={currentPage === totalPages}
                  />
                </Pagination>
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default HistoryList; 