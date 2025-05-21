import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, InputGroup, Row, Col, Modal, Alert, Spinner, Badge } from 'react-bootstrap';
import { FaSearch, FaPlusCircle, FaEdit, FaTrashAlt, FaUserMd, FaPhone, FaEnvelope, FaIdCard, FaCalendarAlt } from 'react-icons/fa';

// Datos de ejemplo para veterinarios
const sampleVeterinarians = [
  {
    id: 1,
    nombre: 'Dr. Juan Martínez',
    especialidad: 'Medicina General',
    cedula: 'MV-12345',
    telefono: '555-1234',
    email: 'juan.martinez@veterinaria.com',
    horario: 'Lunes a Viernes: 8:00 - 14:00',
    estado: 'activo',
    fecha_ingreso: '2020-06-15'
  },
  {
    id: 2,
    nombre: 'Dra. Ana Rodríguez',
    especialidad: 'Cirugía',
    cedula: 'MV-23456',
    telefono: '555-5678',
    email: 'ana.rodriguez@veterinaria.com',
    horario: 'Lunes a Viernes: 14:00 - 20:00',
    estado: 'activo',
    fecha_ingreso: '2019-03-10'
  },
  {
    id: 3,
    nombre: 'Dr. Carlos López',
    especialidad: 'Dermatología',
    cedula: 'MV-34567',
    telefono: '555-9012',
    email: 'carlos.lopez@veterinaria.com',
    horario: 'Martes y Jueves: 9:00 - 18:00',
    estado: 'activo',
    fecha_ingreso: '2021-09-22'
  },
  {
    id: 4,
    nombre: 'Dra. María Fernández',
    especialidad: 'Cardiología',
    cedula: 'MV-45678',
    telefono: '555-3456',
    email: 'maria.fernandez@veterinaria.com',
    horario: 'Lunes, Miércoles y Viernes: 10:00 - 16:00',
    estado: 'inactivo',
    fecha_ingreso: '2018-11-05'
  },
  {
    id: 5,
    nombre: 'Dr. Roberto Sánchez',
    especialidad: 'Oftalmología',
    cedula: 'MV-56789',
    telefono: '555-7890',
    email: 'roberto.sanchez@veterinaria.com',
    horario: 'Sábados: 8:00 - 14:00',
    estado: 'activo',
    fecha_ingreso: '2022-01-15'
  }
];

// Lista de especialidades
const especialidades = [
  'Medicina General',
  'Cirugía',
  'Dermatología',
  'Cardiología',
  'Oftalmología',
  'Oncología',
  'Traumatología',
  'Odontología',
  'Neurología',
  'Nutrición'
];

const Veterinarians = () => {
  const [veterinarians, setVeterinarians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEspecialidad, setFilterEspecialidad] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentVeterinarian, setCurrentVeterinarian] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    especialidad: '',
    cedula: '',
    telefono: '',
    email: '',
    horario: '',
    estado: 'activo',
    fecha_ingreso: new Date().toISOString().split('T')[0]
  });
  const [successMessage, setSuccessMessage] = useState('');

  // Cargar datos iniciales
  useEffect(() => {
    // Simulamos la carga desde una API
    setLoading(true);
    
    // Cargar datos de ejemplo
    setTimeout(() => {
      setVeterinarians(sampleVeterinarians);
      setLoading(false);
    }, 1000);
  }, []);

  // Filtrar veterinarios según especialidad y término de búsqueda
  const filteredVeterinarians = veterinarians.filter(vet => {
    // Filtrar por especialidad
    const matchesEspecialidad = filterEspecialidad === '' || vet.especialidad === filterEspecialidad;
    
    // Filtrar por término de búsqueda
    const searchFields = [
      vet.nombre,
      vet.cedula,
      vet.email,
      vet.telefono
    ].map(field => field.toLowerCase());
    
    const matchesSearch = searchTerm === '' || 
                         searchFields.some(field => field.includes(searchTerm.toLowerCase()));
    
    return matchesEspecialidad && matchesSearch;
  });

  // Ordenar veterinarios por nombre
  const sortedVeterinarians = [...filteredVeterinarians].sort((a, b) => {
    return a.nombre.localeCompare(b.nombre);
  });

  // Manejar el cambio en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Abrir modal para editar veterinario
  const handleEditClick = (veterinarian) => {
    setCurrentVeterinarian(veterinarian);
    setFormData({
      nombre: veterinarian.nombre,
      especialidad: veterinarian.especialidad,
      cedula: veterinarian.cedula,
      telefono: veterinarian.telefono,
      email: veterinarian.email,
      horario: veterinarian.horario,
      estado: veterinarian.estado,
      fecha_ingreso: veterinarian.fecha_ingreso
    });
    setShowEditModal(true);
  };

  // Abrir modal para eliminar veterinario
  const handleDeleteClick = (veterinarian) => {
    setCurrentVeterinarian(veterinarian);
    setShowDeleteModal(true);
  };

  // Manejar guardado de nuevo veterinario
  const handleSaveVeterinarian = () => {
    // Validación básica
    if (!formData.nombre || !formData.especialidad || !formData.cedula) {
      setError('Por favor complete los campos requeridos: Nombre, Especialidad y Cédula Profesional');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      setError('Por favor ingrese un correo electrónico válido');
      return;
    }

    try {
      // Modo desarrollo: no se realiza conexión con la API
      console.log('MODO DESARROLLO: Creando veterinario sin API', formData);
      
      if (showAddModal) {
        // Crear nuevo veterinario simulado localmente
        const newId = Math.max(...veterinarians.map(v => v.id), 0) + 1;
        
        // Crear nuevo veterinario
        const newVeterinarian = {
          id: newId,
          ...formData
        };

        // Actualizar la lista de veterinarios
        setVeterinarians([...veterinarians, newVeterinarian]);
        
        // Mostrar mensaje de éxito
        setSuccessMessage('Veterinario creado correctamente (Modo Desarrollo)');
        setTimeout(() => setSuccessMessage(''), 3000);
        
        // Cerrar modal y limpiar formulario
        setShowAddModal(false);
      } else if (showEditModal) {
        // Actualizar veterinario existente
        const updatedVeterinarians = veterinarians.map(veterinarian => {
          if (veterinarian.id === currentVeterinarian.id) {
            return {
              ...veterinarian,
              ...formData
            };
          }
          return veterinarian;
        });

        setVeterinarians(updatedVeterinarians);
        
        // Mostrar mensaje de éxito
        setSuccessMessage('Veterinario actualizado correctamente (Modo Desarrollo)');
        setTimeout(() => setSuccessMessage(''), 3000);
        
        // Cerrar modal
        setShowEditModal(false);
      }
    } catch (err) {
      console.error('Error al procesar veterinario:', err);
      setError('Error al procesar datos del veterinario: ' + err.message);
    }
    
    // Limpiar estado
    setCurrentVeterinarian(null);
    setFormData({
      nombre: '',
      especialidad: '',
      cedula: '',
      telefono: '',
      email: '',
      horario: '',
      estado: 'activo',
      fecha_ingreso: new Date().toISOString().split('T')[0]
    });
  };

  // Manejar eliminación de veterinario
  const handleDeleteVeterinarian = () => {
    // Eliminar veterinario
    const updatedVeterinarians = veterinarians.filter(veterinarian => veterinarian.id !== currentVeterinarian.id);
    setVeterinarians(updatedVeterinarians);
    
    // Cerrar modal
    setShowDeleteModal(false);
    setCurrentVeterinarian(null);
  };

  // Obtener color de estado para las badges
  const getStatusColor = (status) => {
    switch (status) {
      case 'activo':
        return 'success';
      case 'inactivo':
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
    <div className="p-4">
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">
              <FaUserMd className="me-2" /> Veterinarios
            </h2>
            <Button 
              variant="primary" 
              onClick={() => {
                setFormData({
                  nombre: '',
                  especialidad: '',
                  cedula: '',
                  telefono: '',
                  email: '',
                  horario: '',
                  estado: 'activo',
                  fecha_ingreso: new Date().toISOString().split('T')[0]
                });
                setError('');
                setShowAddModal(true);
              }}
            >
              <FaPlusCircle className="me-2" /> Nuevo Veterinario
            </Button>
          </div>
          
          {/* Mensaje de éxito */}
          {successMessage && (
            <Alert variant="success" className="mb-3">
              {successMessage}
            </Alert>
          )}
          
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Cargando veterinarios...</p>
            </div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : (
            <>
              <Row className="mb-4">
                <Col xs={12} md={6} className="mb-3 mb-md-0">
                  <InputGroup>
                    <InputGroup.Text>
                      <FaSearch />
                    </InputGroup.Text>
                    <Form.Control
                      placeholder="Buscar por nombre, cédula, email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Select
                    value={filterEspecialidad}
                    onChange={(e) => setFilterEspecialidad(e.target.value)}
                  >
                    <option value="">Todas las especialidades</option>
                    {especialidades.map((esp, index) => (
                      <option key={index} value={esp}>{esp}</option>
                    ))}
                  </Form.Select>
                </Col>
              </Row>

              <Table responsive striped hover>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Especialidad</th>
                    <th>Cédula</th>
                    <th>Contacto</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedVeterinarians.length > 0 ? (
                    sortedVeterinarians.map(vet => (
                      <tr key={vet.id}>
                        <td>{vet.nombre}</td>
                        <td>{vet.especialidad}</td>
                        <td>{vet.cedula}</td>
                        <td>
                          <div><FaPhone className="me-1" /> {vet.telefono}</div>
                          <div><FaEnvelope className="me-1" /> {vet.email}</div>
                        </td>
                        <td>
                          <Badge bg={getStatusColor(vet.estado)}>
                            {vet.estado === 'activo' ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </td>
                        <td>
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="me-2 mb-1"
                            onClick={() => handleEditClick(vet)}
                          >
                            <FaEdit /> Editar
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDeleteClick(vet)}
                          >
                            <FaTrashAlt /> Eliminar
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-3">
                        No se encontraron veterinarios.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </>
          )}
        </Card.Body>
      </Card>

      {/* Modal para agregar/editar veterinario */}
      <Modal 
        show={showAddModal || showEditModal} 
        onHide={() => {
          setShowAddModal(false);
          setShowEditModal(false);
          setError('');
        }}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {showAddModal ? (
              <>
                <FaPlusCircle className="me-2" />
                Nuevo Veterinario
              </>
            ) : (
              <>
                <FaEdit className="me-2" />
                Editar Veterinario
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
                  <Form.Label>Nombre completo*</Form.Label>
                  <Form.Control
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Especialidad*</Form.Label>
                  <Form.Select
                    name="especialidad"
                    value={formData.especialidad}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccionar especialidad</option>
                    {especialidades.map((esp, index) => (
                      <option key={index} value={esp}>{esp}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Cédula profesional*</Form.Label>
                  <Form.Control
                    type="text"
                    name="cedula"
                    value={formData.cedula}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha de ingreso</Form.Label>
                  <Form.Control
                    type="date"
                    name="fecha_ingreso"
                    value={formData.fecha_ingreso}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control
                    type="text"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Horario</Form.Label>
              <Form.Control
                type="text"
                name="horario"
                value={formData.horario}
                onChange={handleChange}
                placeholder="Ej: Lunes a Viernes: 8:00 - 14:00"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Estado</Form.Label>
              <Form.Select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </Form.Select>
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
            onClick={handleSaveVeterinarian}
          >
            {showAddModal ? 'Crear Veterinario' : 'Actualizar Veterinario'}
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
          <p>¿Está seguro de que desea eliminar al veterinario <strong>{currentVeterinarian?.nombre}</strong>?</p>
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
            onClick={handleDeleteVeterinarian}
          >
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Veterinarians; 