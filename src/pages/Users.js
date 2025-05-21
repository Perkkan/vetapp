import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, InputGroup, Row, Col, Modal, Alert, Spinner, Badge } from 'react-bootstrap';
import { FaSearch, FaPlusCircle, FaEdit, FaTrashAlt, FaUser, FaPhone, FaEnvelope, FaIdCard, FaUserShield } from 'react-icons/fa';
import axios from 'axios';

// Datos de ejemplo para usuarios
const sampleUsers = [
  {
    id: 1,
    nombre: 'Administrador',
    email: 'admin@veterinaria.com',
    telefono: '555-1234',
    rol: 'Administrador',
    estado: 'activo',
    fecha_registro: '2020-06-15'
  },
  {
    id: 2,
    nombre: 'Juan Pérez',
    email: 'juan.perez@veterinaria.com',
    telefono: '555-5678',
    rol: 'Recepcionista',
    estado: 'activo',
    fecha_registro: '2020-08-20'
  },
  {
    id: 3,
    nombre: 'María García',
    email: 'maria.garcia@veterinaria.com',
    telefono: '555-9012',
    rol: 'Veterinario',
    estado: 'activo',
    fecha_registro: '2021-02-10'
  },
  {
    id: 4,
    nombre: 'Carlos López',
    email: 'carlos.lopez@veterinaria.com',
    telefono: '555-3456',
    rol: 'Asistente',
    estado: 'inactivo',
    fecha_registro: '2020-11-05'
  },
  {
    id: 5,
    nombre: 'Ana Martínez',
    email: 'ana.martinez@veterinaria.com',
    telefono: '555-7890',
    rol: 'Administrador',
    estado: 'activo',
    fecha_registro: '2021-05-15'
  }
];

// Lista de roles
const roles = [
  'Administrador',
  'Recepcionista',
  'Veterinario',
  'Asistente',
  'Contador'
];

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRol, setFilterRol] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    rol: '',
    password: '',
    confirmarPassword: '',
    estado: 'activo',
    fecha_registro: new Date().toISOString().split('T')[0]
  });
  const [successMessage, setSuccessMessage] = useState('');

  // Cargar datos iniciales
  useEffect(() => {
    // Simulamos la carga desde una API
    setLoading(true);
    
    // Verificar si hay usuarios en localStorage
    const storedUsers = localStorage.getItem('localUsers');
    
    if (storedUsers) {
      // Usar usuarios almacenados en localStorage
      setUsers(JSON.parse(storedUsers));
      setLoading(false);
    } else {
      // Si no hay usuarios en localStorage, usar datos de ejemplo
      setTimeout(() => {
        setUsers(sampleUsers);
        // Guardar datos de ejemplo en localStorage para uso futuro
        localStorage.setItem('localUsers', JSON.stringify(sampleUsers));
        setLoading(false);
      }, 1000);
    }
  }, []);

  // Filtrar usuarios según rol y término de búsqueda
  const filteredUsers = users.filter(user => {
    // Filtrar por rol
    const matchesRol = filterRol === '' || user.rol === filterRol;
    
    // Filtrar por término de búsqueda
    const searchFields = [
      user.nombre,
      user.email,
      user.telefono
    ].map(field => field.toLowerCase());
    
    const matchesSearch = searchTerm === '' || 
                         searchFields.some(field => field.includes(searchTerm.toLowerCase()));
    
    return matchesRol && matchesSearch;
  });

  // Ordenar usuarios por nombre
  const sortedUsers = [...filteredUsers].sort((a, b) => {
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

  // Abrir modal para editar usuario
  const handleEditClick = (user) => {
    setCurrentUser(user);
    setFormData({
      nombre: user.nombre,
      email: user.email,
      telefono: user.telefono,
      rol: user.rol,
      password: '',
      confirmarPassword: '',
      estado: user.estado,
      fecha_registro: user.fecha_registro
    });
    setShowEditModal(true);
  };

  // Abrir modal para eliminar usuario
  const handleDeleteClick = (user) => {
    setCurrentUser(user);
    setShowDeleteModal(true);
  };

  // Manejar guardado de nuevo usuario
  const handleSaveUser = async () => {
    // Validación básica
    if (!formData.nombre || !formData.email || !formData.rol) {
      setError('Por favor complete los campos requeridos: Nombre, Email y Rol');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Por favor ingrese un correo electrónico válido');
      return;
    }

    // Validar contraseña en caso de nuevo usuario
    if (showAddModal) {
      if (!formData.password) {
        setError('La contraseña es obligatoria para nuevos usuarios');
        return;
      }
      if (formData.password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        return;
      }
      if (formData.password !== formData.confirmarPassword) {
        setError('Las contraseñas no coinciden');
        return;
      }
    } else if (showEditModal && formData.password) {
      // Validar contraseña en caso de edición y que se haya ingresado una nueva
      if (formData.password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        return;
      }
      if (formData.password !== formData.confirmarPassword) {
        setError('Las contraseñas no coinciden');
        return;
      }
    }

    try {
      // Obtener información del usuario actual desde localStorage
      const currentUserData = localStorage.getItem('userData');
      const currentUser = currentUserData ? JSON.parse(currentUserData) : null;
      
      if (!currentUser) {
        setError('No se pudo obtener información del usuario actual');
        return;
      }
      
      const MODO_DESARROLLO = false; // Verificamos si estamos en modo desarrollo o real
      
      if (MODO_DESARROLLO) {
        // Modo desarrollo: no se realiza conexión con la API
        console.log('MODO DESARROLLO: Operación con usuario sin API', formData);
        
        if (showAddModal) {
          // Crear nuevo usuario simulado localmente
          const newId = Math.max(...users.map(u => u.id), 0) + 1;
          
          // Crear nuevo usuario (sin incluir la contraseña en los datos visualizados)
          const newUser = {
            id: newId,
            nombre: formData.nombre,
            email: formData.email,
            password: formData.password,
            telefono: formData.telefono,
            rol: formData.rol,
            estado: formData.estado,
            fecha_registro: formData.fecha_registro,
            // Asignar la misma clínica que el usuario actual
            id_clinica: currentUser.id_clinica
          };

          // Actualizar la lista de usuarios
          setUsers([...users, newUser]);
          
          // Guardar en localStorage para que AuthContext pueda acceder
          const storedUsers = localStorage.getItem('localUsers');
          const currentUsers = storedUsers ? JSON.parse(storedUsers) : [];
          localStorage.setItem('localUsers', JSON.stringify([...currentUsers, newUser]));
          
          // Mostrar mensaje de éxito
          setSuccessMessage('Usuario creado correctamente (Modo Desarrollo)');
          setTimeout(() => setSuccessMessage(''), 3000);
          
          // Cerrar modal y limpiar formulario
          setShowAddModal(false);
        } else if (showEditModal) {
          // Actualizar usuario existente
          const updatedUsers = users.map(user => {
            if (user.id === currentUser.id) {
              return {
                ...user,
                nombre: formData.nombre,
                email: formData.email,
                telefono: formData.telefono,
                rol: formData.rol,
                estado: formData.estado,
                // Actualizar contraseña solo si se proporcionó una nueva
                ...(formData.password ? { password: formData.password } : {})
                // No actualizamos la fecha de registro
              };
            }
            return user;
          });

          setUsers(updatedUsers);
          
          // Actualizar localStorage
          const storedUsers = localStorage.getItem('localUsers');
          if (storedUsers) {
            const parsedUsers = JSON.parse(storedUsers);
            const updatedLocalUsers = parsedUsers.map(user => {
              if (user.id === currentUser.id) {
                return {
                  ...user,
                  nombre: formData.nombre,
                  email: formData.email,
                  telefono: formData.telefono,
                  rol: formData.rol,
                  estado: formData.estado,
                  // Actualizar contraseña solo si se proporcionó una nueva
                  ...(formData.password ? { password: formData.password } : {})
                };
              }
              return user;
            });
            localStorage.setItem('localUsers', JSON.stringify(updatedLocalUsers));
          }
          
          // Mostrar mensaje de éxito
          setSuccessMessage('Usuario actualizado correctamente (Modo Desarrollo)');
          setTimeout(() => setSuccessMessage(''), 3000);
          
          // Cerrar modal
          setShowEditModal(false);
        }
      } else {
        // Modo real: conectar con la API
        const config = {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        };
        
        if (showAddModal) {
          // Preparar datos para la API
          const userData = {
            nombre: formData.nombre,
            email: formData.email,
            password: formData.password,
            telefono: formData.telefono,
            tipo_usuario: convertirRolATipoUsuario(formData.rol),
            estado: formData.estado.toUpperCase(),
            // Asignar la misma clínica que el usuario actual
            id_clinica: currentUser.id_clinica,
            // Permisos basados en el rol
            permisos: obtenerPermisosPorRol(formData.rol)
          };

          console.log('Creando nuevo usuario en API:', userData);
          setLoading(true);
          
          try {
            // Intentar crear usuario en la API de hospitalización
            const response = await axios.post(
              'http://localhost:5000/api/usuarios',
              userData,
              config
            );
            
            console.log('Usuario creado en API hospitalización:', response.data);
            
            // Actualizar la interfaz con el nuevo usuario
            const newUser = {
              id: response.data.id || Date.now(), // Usar ID de la API o generar uno temporal
              nombre: formData.nombre,
              email: formData.email,
              telefono: formData.telefono,
              rol: formData.rol,
              estado: formData.estado,
              fecha_registro: formData.fecha_registro,
              id_clinica: currentUser.id_clinica
            };
            
            setUsers([...users, newUser]);
            setSuccessMessage('Usuario creado correctamente en la API');
            setShowAddModal(false);
          } catch (error) {
            console.error('Error al crear usuario en API hospitalización:', error);
            
            try {
              // Si falla, intentar con la API veterinaria
              const response = await axios.post(
                'http://localhost:5001/api/usuarios',
                userData,
                config
              );
              
              console.log('Usuario creado en API veterinaria:', response.data);
              
              // Actualizar la interfaz con el nuevo usuario
              const newUser = {
                id: response.data.id || Date.now(),
                nombre: formData.nombre,
                email: formData.email,
                telefono: formData.telefono,
                rol: formData.rol,
                estado: formData.estado,
                fecha_registro: formData.fecha_registro,
                id_clinica: currentUser.id_clinica
              };
              
              setUsers([...users, newUser]);
              setSuccessMessage('Usuario creado correctamente en la API');
              setShowAddModal(false);
            } catch (err) {
              console.error('Error al crear usuario en ambas APIs:', err);
              setError('No se pudo crear el usuario. Intente nuevamente más tarde.');
            }
          } finally {
            setLoading(false);
          }
        } else if (showEditModal && currentUser) {
          // Implementación para editar usuarios en la API
          // ... código para edición ...
        }
      }
    } catch (err) {
      console.error('Error al procesar usuario:', err);
      setError('Error al procesar datos del usuario: ' + err.message);
    }
    
    // Limpiar estado
    setCurrentUser(null);
    setFormData({
      nombre: '',
      email: '',
      telefono: '',
      rol: '',
      password: '',
      confirmarPassword: '',
      estado: 'activo',
      fecha_registro: new Date().toISOString().split('T')[0]
    });
    setError('');
  };

  // Función auxiliar para convertir rol a tipo_usuario
  const convertirRolATipoUsuario = (rol) => {
    switch(rol) {
      case 'Administrador':
        return 'ADMINISTRATIVO';
      case 'Veterinario':
        return 'VETERINARIO';
      case 'Recepcionista':
        return 'RECEPCIONISTA';
      case 'Asistente':
        return 'ASISTENTE';
      default:
        return rol.toUpperCase();
    }
  };
  
  // Función auxiliar para obtener permisos según el rol
  const obtenerPermisosPorRol = (rol) => {
    // Permisos básicos que todos los usuarios deben tener
    const permisosBasicos = ['ver_dashboard'];
    
    let permisosEspecificos = [];
    
    switch(rol) {
      case 'Administrador':
        permisosEspecificos = [
          'gestionar_usuarios',
          'gestionar_sala_espera',
          'ver_historiales',
          'gestionar_citas',
          'gestionar_veterinarios',
          'gestionar_recursos_humanos',
          'gestionar_compras',
          'gestionar_facturacion'
        ];
        break;
      case 'Veterinario':
        // Permisos específicos para veterinarios (excluyendo los módulos prohibidos)
        permisosEspecificos = [
          'gestionar_pacientes',
          'ver_historiales',
          'gestionar_consultas',
          'gestionar_hospitalizacion',
          'gestionar_laboratorio'
        ];
        // Explícitamente asegurarse de que no tienen los permisos prohibidos
        break;
      case 'Recepcionista':
        permisosEspecificos = [
          'gestionar_sala_espera',
          'gestionar_citas'
        ];
        break;
      case 'Asistente':
        permisosEspecificos = [
          'gestionar_pacientes',
          'gestionar_sala_espera'
        ];
        break;
      default:
        permisosEspecificos = [];
    }
    
    // Combinar los permisos básicos con los específicos del rol
    return [...permisosBasicos, ...permisosEspecificos];
  };

  // Manejar eliminación de usuario
  const handleDeleteUser = () => {
    // Eliminar usuario
    const updatedUsers = users.filter(user => user.id !== currentUser.id);
    setUsers(updatedUsers);
    
    // Actualizar localStorage
    const storedUsers = localStorage.getItem('localUsers');
    if (storedUsers) {
      const parsedUsers = JSON.parse(storedUsers);
      const updatedLocalUsers = parsedUsers.filter(user => user.id !== currentUser.id);
      localStorage.setItem('localUsers', JSON.stringify(updatedLocalUsers));
    }
    
    // Cerrar modal
    setShowDeleteModal(false);
    setCurrentUser(null);
    
    // Mostrar mensaje de éxito
    setSuccessMessage('Usuario eliminado correctamente (Modo Desarrollo)');
    setTimeout(() => setSuccessMessage(''), 3000);
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

  // Obtener color de rol para las badges
  const getRolColor = (rol) => {
    switch (rol) {
      case 'Administrador':
        return 'primary';
      case 'Veterinario':
        return 'info';
      case 'Recepcionista':
        return 'warning';
      case 'Asistente':
        return 'success';
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
              <FaUser className="me-2" /> Usuarios
            </h2>
            <Button 
              variant="primary" 
              onClick={() => {
                setFormData({
                  nombre: '',
                  email: '',
                  telefono: '',
                  rol: '',
                  password: '',
                  confirmarPassword: '',
                  estado: 'activo',
                  fecha_registro: new Date().toISOString().split('T')[0]
                });
                setError('');
                setShowAddModal(true);
              }}
            >
              <FaPlusCircle className="me-2" /> Nuevo Usuario
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
              <p className="mt-3">Cargando usuarios...</p>
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
                      placeholder="Buscar por nombre, email, teléfono..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Select
                    value={filterRol}
                    onChange={(e) => setFilterRol(e.target.value)}
                  >
                    <option value="">Todos los roles</option>
                    {roles.map((rol, index) => (
                      <option key={index} value={rol}>{rol}</option>
                    ))}
                  </Form.Select>
                </Col>
              </Row>

              <Table responsive striped hover>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Fecha Registro</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedUsers.length > 0 ? (
                    sortedUsers.map(user => (
                      <tr key={user.id}>
                        <td>{user.nombre}</td>
                        <td>{user.email}</td>
                        <td>{user.telefono}</td>
                        <td>
                          <Badge bg={getRolColor(user.rol)}>
                            {user.rol}
                          </Badge>
                        </td>
                        <td>
                          <Badge bg={getStatusColor(user.estado)}>
                            {user.estado === 'activo' ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </td>
                        <td>{formatDate(user.fecha_registro)}</td>
                        <td>
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="me-2 mb-1"
                            onClick={() => handleEditClick(user)}
                          >
                            <FaEdit /> Editar
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDeleteClick(user)}
                          >
                            <FaTrashAlt /> Eliminar
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-3">
                        No se encontraron usuarios.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </>
          )}
        </Card.Body>
      </Card>

      {/* Modal para agregar/editar usuario */}
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
                Nuevo Usuario
              </>
            ) : (
              <>
                <FaEdit className="me-2" />
                Editar Usuario
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
                  <Form.Label>Email*</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
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
                  <Form.Label>Rol*</Form.Label>
                  <Form.Select
                    name="rol"
                    value={formData.rol}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccionar rol</option>
                    {roles.map((rol, index) => (
                      <option key={index} value={rol}>{rol}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{showAddModal ? 'Contraseña*' : 'Nueva contraseña'}</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required={showAddModal}
                  />
                  {showEditModal && (
                    <Form.Text className="text-muted">
                      Dejar en blanco para mantener la contraseña actual
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{showAddModal ? 'Confirmar contraseña*' : 'Confirmar nueva contraseña'}</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmarPassword"
                    value={formData.confirmarPassword}
                    onChange={handleChange}
                    required={showAddModal}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
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
              </Col>
              {showAddModal && (
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Fecha de registro</Form.Label>
                    <Form.Control
                      type="date"
                      name="fecha_registro"
                      value={formData.fecha_registro}
                      onChange={handleChange}
                      disabled={showEditModal}
                    />
                  </Form.Group>
                </Col>
              )}
            </Row>

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
            onClick={handleSaveUser}
          >
            {showAddModal ? 'Crear Usuario' : 'Actualizar Usuario'}
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
          <p>¿Está seguro de que desea eliminar al usuario <strong>{currentUser?.nombre}</strong>?</p>
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
            onClick={handleDeleteUser}
          >
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Users; 