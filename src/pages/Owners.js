import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, InputGroup, Row, Col, Modal, Alert, Spinner } from 'react-bootstrap';
import { FaSearch, FaPlusCircle, FaEdit, FaTrashAlt, FaUserAlt, FaPaw } from 'react-icons/fa';

// Datos de ejemplo para propietarios
const sampleOwners = [
  {
    id: 201,
    nombre: 'Juan Pérez',
    telefono: '555-1234',
    email: 'juan.perez@mail.com',
    direccion: 'Calle Principal 123',
    ciudad: 'Madrid',
    codigo_postal: '28001',
    pacientes: [
      { id: 101, nombre: 'Firulais', especie: 'Perro', raza: 'Labrador' }
    ]
  },
  {
    id: 202,
    nombre: 'María González',
    telefono: '555-5678',
    email: 'maria.gonzalez@mail.com',
    direccion: 'Avenida Central 456',
    ciudad: 'Barcelona',
    codigo_postal: '08001',
    pacientes: [
      { id: 102, nombre: 'Michu', especie: 'Gato', raza: 'Siamés' }
    ]
  },
  {
    id: 203,
    nombre: 'Carlos López',
    telefono: '555-9012',
    email: 'carlos.lopez@mail.com',
    direccion: 'Plaza Mayor 789',
    ciudad: 'Valencia',
    codigo_postal: '46001',
    pacientes: [
      { id: 103, nombre: 'Rocky', especie: 'Perro', raza: 'Bulldog' }
    ]
  },
  {
    id: 204,
    nombre: 'Roberto Sánchez',
    telefono: '555-9876',
    email: 'roberto.sanchez@mail.com',
    direccion: 'Calle Nueva 321',
    ciudad: 'Sevilla',
    codigo_postal: '41001',
    pacientes: [
      { id: 104, nombre: 'Luna', especie: 'Perro', raza: 'Pastor Alemán' }
    ]
  },
  {
    id: 205,
    nombre: 'Carla Moreno',
    telefono: '555-4321',
    email: 'carla.moreno@mail.com',
    direccion: 'Avenida del Parque 654',
    ciudad: 'Zaragoza',
    codigo_postal: '50001',
    pacientes: [
      { id: 105, nombre: 'Simba', especie: 'Gato', raza: 'Persa' }
    ]
  }
];

const Owners = () => {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentOwner, setCurrentOwner] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    direccion: '',
    ciudad: '',
    codigo_postal: ''
  });

  // Cargar datos de propietarios
  useEffect(() => {
    // Simulamos la carga desde una API
    setLoading(true);
    setTimeout(() => {
      setOwners(sampleOwners);
      setLoading(false);
    }, 1000);
  }, []);

  // Filtrar propietarios según término de búsqueda
  const filteredOwners = owners.filter(owner => {
    const searchFields = [
      owner.nombre,
      owner.telefono,
      owner.email,
      owner.direccion,
      owner.ciudad
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

  // Abrir modal para editar propietario
  const handleEditClick = (owner) => {
    setCurrentOwner(owner);
    setFormData({
      nombre: owner.nombre,
      telefono: owner.telefono,
      email: owner.email,
      direccion: owner.direccion,
      ciudad: owner.ciudad,
      codigo_postal: owner.codigo_postal
    });
    setShowEditModal(true);
  };

  // Abrir modal para eliminar propietario
  const handleDeleteClick = (owner) => {
    setCurrentOwner(owner);
    setShowDeleteModal(true);
  };

  // Manejar guardado de nuevo propietario
  const handleSaveNewOwner = () => {
    // Validación básica
    if (!formData.nombre || !formData.telefono) {
      setError('Por favor complete los campos requeridos: Nombre y Teléfono');
      return;
    }

    // Generar un ID único para el nuevo propietario
    const newId = Math.max(...owners.map(p => p.id), 0) + 1;
    
    // Crear nuevo propietario
    const newOwner = {
      id: newId,
      ...formData,
      pacientes: [] // Inicialmente sin pacientes
    };

    // Actualizar la lista de propietarios
    setOwners([...owners, newOwner]);
    
    // Cerrar modal y limpiar formulario
    setShowAddModal(false);
    setFormData({
      nombre: '',
      telefono: '',
      email: '',
      direccion: '',
      ciudad: '',
      codigo_postal: ''
    });
    setError('');
  };

  // Manejar actualización de propietario
  const handleUpdateOwner = () => {
    // Validación básica
    if (!formData.nombre || !formData.telefono) {
      setError('Por favor complete los campos requeridos: Nombre y Teléfono');
      return;
    }

    // Actualizar propietario en la lista
    const updatedOwners = owners.map(owner => {
      if (owner.id === currentOwner.id) {
        return {
          ...owner,
          ...formData
        };
      }
      return owner;
    });

    setOwners(updatedOwners);
    
    // Cerrar modal y limpiar
    setShowEditModal(false);
    setCurrentOwner(null);
    setError('');
  };

  // Manejar eliminación de propietario
  const handleDeleteOwner = () => {
    // Verificar si tiene mascotas antes de eliminar
    if (currentOwner.pacientes && currentOwner.pacientes.length > 0) {
      setError(`No se puede eliminar al propietario porque tiene ${currentOwner.pacientes.length} mascota(s) asociada(s).`);
      return;
    }

    // Eliminar propietario de la lista
    const updatedOwners = owners.filter(owner => owner.id !== currentOwner.id);
    setOwners(updatedOwners);
    
    // Cerrar modal
    setShowDeleteModal(false);
    setCurrentOwner(null);
    setError('');
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestión de Propietarios</h2>
        <Button 
          variant="primary"
          onClick={() => setShowAddModal(true)}
          className="d-flex align-items-center"
        >
          <FaPlusCircle className="me-2" />
          Nuevo Propietario
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
                  placeholder="Buscar propietarios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={6} className="text-md-end mt-3 mt-md-0">
              <span className="text-muted">
                Mostrando {filteredOwners.length} de {owners.length} propietarios
              </span>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Lista de propietarios */}
      <Card className="shadow-sm">
        <Card.Body>
          {loading ? (
            <div className="text-center my-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Cargando propietarios...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Teléfono</th>
                    <th>Email</th>
                    <th>Dirección</th>
                    <th>Mascotas</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOwners.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center">No se encontraron propietarios</td>
                    </tr>
                  ) : (
                    filteredOwners.map(owner => (
                      <tr key={owner.id}>
                        <td>{owner.id}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <FaUserAlt className="me-2 text-primary" />
                            <span>{owner.nombre}</span>
                          </div>
                        </td>
                        <td>{owner.telefono}</td>
                        <td>{owner.email}</td>
                        <td>{owner.direccion}, {owner.ciudad}</td>
                        <td>
                          {owner.pacientes && owner.pacientes.length > 0 ? (
                            <div className="d-flex align-items-center">
                              <FaPaw className="me-1 text-success" />
                              <span>{owner.pacientes.length} mascota(s)</span>
                            </div>
                          ) : (
                            <span className="text-muted">Sin mascotas</span>
                          )}
                        </td>
                        <td>
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="me-1"
                            onClick={() => handleEditClick(owner)}
                          >
                            <FaEdit />
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDeleteClick(owner)}
                          >
                            <FaTrashAlt />
                          </Button>
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

      {/* Modal para agregar nuevo propietario */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaPlusCircle className="me-2" />
            Agregar Nuevo Propietario
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre Completo*</Form.Label>
              <Form.Control 
                type="text" 
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Teléfono*</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    required
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
              <Form.Label>Dirección</Form.Label>
              <Form.Control 
                type="text" 
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
              />
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ciudad</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="ciudad"
                    value={formData.ciudad}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Código Postal</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="codigo_postal"
                    value={formData.codigo_postal}
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
          <Button variant="primary" onClick={handleSaveNewOwner}>
            Guardar Propietario
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para editar propietario */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaEdit className="me-2" />
            Editar Propietario: {currentOwner?.nombre}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre Completo*</Form.Label>
              <Form.Control 
                type="text" 
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Teléfono*</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    required
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
              <Form.Label>Dirección</Form.Label>
              <Form.Control 
                type="text" 
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
              />
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ciudad</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="ciudad"
                    value={formData.ciudad}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Código Postal</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="codigo_postal"
                    value={formData.codigo_postal}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            {currentOwner && currentOwner.pacientes && currentOwner.pacientes.length > 0 && (
              <div className="mt-3">
                <h6>Mascotas Asociadas</h6>
                <ul className="list-group">
                  {currentOwner.pacientes.map(pet => (
                    <li key={pet.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <FaPaw className="me-2 text-primary" />
                        <span>{pet.nombre}</span>
                        <span className="text-muted ms-2">({pet.especie} - {pet.raza})</span>
                      </div>
                      <span className="badge bg-primary rounded-pill">{pet.id}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="text-muted small mb-3 mt-3">* Campos obligatorios</div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleUpdateOwner}>
            Actualizar Propietario
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de confirmación para eliminar */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error ? (
            <Alert variant="danger">{error}</Alert>
          ) : (
            <>
              <p>¿Está seguro de que desea eliminar al propietario <strong>{currentOwner?.nombre}</strong>?</p>
              <p className="text-danger">Esta acción no se puede deshacer.</p>
              {currentOwner && currentOwner.pacientes && currentOwner.pacientes.length > 0 && (
                <Alert variant="warning">
                  No se puede eliminar este propietario porque tiene mascotas asociadas. 
                  Por favor, reasigne o elimine las mascotas primero.
                </Alert>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setShowDeleteModal(false);
            setError('');
          }}>
            Cancelar
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteOwner}
            disabled={currentOwner && currentOwner.pacientes && currentOwner.pacientes.length > 0}
          >
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Owners; 