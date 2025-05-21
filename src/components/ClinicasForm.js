import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Table, Tabs, Tab, Alert } from 'react-bootstrap';
import axios from 'axios';

// Datos de ejemplo para modo offline
const sampleClinicas = [
  {
    id: 1,
    nombre: 'Clínica Veterinaria Principal',
    direccion: 'Calle Principal #123',
    telefono: '555-1234',
    email: 'contacto@clinicaveterinaria.com'
  }
];

const ClinicasForm = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    email: ''
  });

  const [usuarioData, setUsuarioData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmarPassword: '',
    rol: 'ADMINISTRATIVO',
    clinica_id: '',
    telefono: ''
  });

  const [clinicas, setClinicas] = useState([...sampleClinicas]);
  const [usuarios, setUsuarios] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingUsuarioId, setEditingUsuarioId] = useState(null);
  const [activeTab, setActiveTab] = useState('clinicas');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [modoOffline, setModoOffline] = useState(true);

  useEffect(() => {
    fetchClinicas();
    fetchUsuarios();
  }, []);

  const fetchClinicas = async () => {
    try {
      if (modoOffline) {
        console.log('Modo offline: usando datos de muestra para clínicas');
        // Usar datos locales si están almacenados
        const storedClinicas = localStorage.getItem('localClinicas');
        if (storedClinicas) {
          setClinicas(JSON.parse(storedClinicas));
        } else {
          // Si no hay datos almacenados, usar los de muestra
          setClinicas(sampleClinicas);
          localStorage.setItem('localClinicas', JSON.stringify(sampleClinicas));
        }
        return;
      }
      
      // Modo online (intentar conectarse a la API)
      // Obtener token de autenticación
      const token = localStorage.getItem('authToken');
      console.log('Token para petición de clínicas:', token);
      
      console.log('Intentando obtener clínicas desde http://localhost:5001/api/clinicas');
      const response = await axios.get('http://localhost:5001/api/clinicas', {
        headers: {
          Authorization: token,
          'Content-Type': 'application/json'
        }
      });
      console.log('Respuesta de clínicas recibida:', response.data);
      setClinicas(response.data);
    } catch (error) {
      console.error('Error al obtener las clínicas:', error);
      console.error('Mensaje de error:', error.message);
      console.error('Detalles del error:', error.response?.data || 'Sin detalles');
      setErrorMessage(`Error al obtener las clínicas: ${error.message}. Usando datos locales.`);
      
      // Cargar datos de ejemplo si hay un error
      setModoOffline(true);
      const storedClinicas = localStorage.getItem('localClinicas');
      if (storedClinicas) {
        setClinicas(JSON.parse(storedClinicas));
      } else {
        setClinicas(sampleClinicas);
        localStorage.setItem('localClinicas', JSON.stringify(sampleClinicas));
      }
    }
  };

  const fetchUsuarios = async () => {
    try {
      // Obtener token de autenticación
      const token = localStorage.getItem('authToken');
      
      const response = await axios.get('http://localhost:5001/api/usuarios', {
        headers: {
          Authorization: token
        }
      });
      setUsuarios(response.data);
    } catch (error) {
      console.error('Error al obtener los usuarios:', error);
      setErrorMessage('Error al obtener los usuarios');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUsuarioChange = (e) => {
    setUsuarioData({
      ...usuarioData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modoOffline) {
        // Modo offline: guardar localmente
        const nuevasClinicas = [...clinicas];
        
        if (editingId) {
          // Actualizar clínica existente
          const index = nuevasClinicas.findIndex(c => c.id === editingId);
          if (index !== -1) {
            nuevasClinicas[index] = { ...nuevasClinicas[index], ...formData };
          }
        } else {
          // Crear nueva clínica
          const newId = nuevasClinicas.length > 0 
            ? Math.max(...nuevasClinicas.map(c => c.id)) + 1 
            : 1;
          
          nuevasClinicas.push({
            id: newId,
            ...formData
          });
        }
        
        // Guardar en localStorage y actualizar estado
        localStorage.setItem('localClinicas', JSON.stringify(nuevasClinicas));
        setClinicas(nuevasClinicas);
        
        // Limpiar formulario
        setFormData({
          nombre: '',
          direccion: '',
          telefono: '',
          email: ''
        });
        setEditingId(null);
        setSuccessMessage(editingId 
          ? 'Clínica actualizada exitosamente (modo offline)' 
          : 'Clínica registrada exitosamente (modo offline)');
        setTimeout(() => setSuccessMessage(''), 3000);
        return;
      }
      
      // Modo online: usar la API
      // Obtener token de autenticación
      const token = localStorage.getItem('authToken');
      
      if (editingId) {
        await axios.put(`http://localhost:5001/api/clinicas/${editingId}`, formData, {
          headers: {
            Authorization: token
          }
        });
      } else {
        await axios.post('http://localhost:5001/api/clinicas', formData, {
          headers: {
            Authorization: token
          }
        });
      }
      fetchClinicas();
      setFormData({
        nombre: '',
        direccion: '',
        telefono: '',
        email: ''
      });
      setEditingId(null);
      setSuccessMessage(editingId ? 'Clínica actualizada exitosamente' : 'Clínica registrada exitosamente');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage('Error al procesar la solicitud: ' + error.message);
      console.error(error);
      
      // Si hay un error, cambiar a modo offline
      setModoOffline(true);
    }
  };

  const handleUsuarioSubmit = async (e) => {
    e.preventDefault();
    
    // Validar que las contraseñas coincidan
    if (!editingUsuarioId && usuarioData.password !== usuarioData.confirmarPassword) {
      setErrorMessage('Las contraseñas no coinciden');
      return;
    }

    try {
      // Obtener token de autenticación
      const token = localStorage.getItem('authToken');
      
      if (editingUsuarioId) {
        // Si estamos editando, no enviamos la contraseña a menos que se haya modificado
        const datosParaEnviar = { ...usuarioData };
        if (!datosParaEnviar.password) {
          delete datosParaEnviar.password;
        }
        delete datosParaEnviar.confirmarPassword;
        
        await axios.put(`http://localhost:5001/api/usuarios/${editingUsuarioId}`, datosParaEnviar, {
          headers: {
            Authorization: token
          }
        });
        setSuccessMessage('Usuario actualizado exitosamente');
      } else {
        await axios.post('http://localhost:5001/api/usuarios', {
          nombre: usuarioData.nombre,
          email: usuarioData.email,
          password: usuarioData.password,
          tipo_usuario: usuarioData.rol,
          id_clinica: usuarioData.clinica_id,
          telefono: usuarioData.telefono
        }, {
          headers: {
            Authorization: token
          }
        });
        setSuccessMessage('Usuario creado exitosamente');
      }
      
      // Limpiar el formulario y actualizar la lista
      setUsuarioData({
        nombre: '',
        email: '',
        password: '',
        confirmarPassword: '',
        rol: 'ADMINISTRATIVO',
        clinica_id: '',
        telefono: ''
      });
      setEditingUsuarioId(null);
      fetchUsuarios();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage(error.response?.data?.mensaje || 'Error al procesar el usuario');
      console.error('Error al procesar usuario:', error);
    }
  };

  const handleEdit = (clinica) => {
    setFormData({
      nombre: clinica.nombre,
      direccion: clinica.direccion,
      telefono: clinica.telefono,
      email: clinica.email
    });
    setEditingId(clinica.id);
    setActiveTab('clinicas');
  };

  const handleEditUsuario = (usuario) => {
    setUsuarioData({
      nombre: usuario.nombre,
      email: usuario.email,
      password: '',
      confirmarPassword: '',
      rol: usuario.tipo_usuario || usuario.rol,
      clinica_id: usuario.clinica_id || usuario.id_clinica,
      telefono: usuario.telefono || ''
    });
    setEditingUsuarioId(usuario.id);
    setActiveTab('usuarios');
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta clínica?')) {
      try {
        if (modoOffline) {
          // Modo offline: eliminar localmente
          const nuevasClinicas = clinicas.filter(c => c.id !== id);
          localStorage.setItem('localClinicas', JSON.stringify(nuevasClinicas));
          setClinicas(nuevasClinicas);
          setSuccessMessage('Clínica eliminada exitosamente (modo offline)');
          setTimeout(() => setSuccessMessage(''), 3000);
          return;
        }
        
        // Modo online: usar la API
        // Obtener token de autenticación
        const token = localStorage.getItem('authToken');
        
        await axios.delete(`http://localhost:5001/api/clinicas/${id}`, {
          headers: {
            Authorization: token
          }
        });
        fetchClinicas();
        setSuccessMessage('Clínica eliminada exitosamente');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        setErrorMessage('Error al eliminar la clínica: ' + error.message);
        console.error(error);
        
        // Si hay un error, cambiar a modo offline
        setModoOffline(true);
      }
    }
  };

  const handleDeleteUsuario = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      try {
        // Obtener token de autenticación
        const token = localStorage.getItem('authToken');
        
        await axios.delete(`http://localhost:5001/api/usuarios/${id}`, {
          headers: {
            Authorization: token
          }
        });
        fetchUsuarios();
        setSuccessMessage('Usuario eliminado exitosamente');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        setErrorMessage('Error al eliminar el usuario');
        console.error(error);
      }
    }
  };

  const handleCancelUsuario = () => {
    setUsuarioData({
      nombre: '',
      email: '',
      password: '',
      confirmarPassword: '',
      rol: 'ADMINISTRATIVO',
      clinica_id: '',
      telefono: ''
    });
    setEditingUsuarioId(null);
  };

  return (
    <div className="p-4">
      {successMessage && <Alert variant="success" onClose={() => setSuccessMessage('')} dismissible>{successMessage}</Alert>}
      {errorMessage && <Alert variant="danger" onClose={() => setErrorMessage('')} dismissible>{errorMessage}</Alert>}
      
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab eventKey="clinicas" title="Gestión de Clínicas">
          <h3>{editingId ? 'Editar Clínica' : 'Registrar Nueva Clínica'}</h3>
          <Form onSubmit={handleSubmit} className="mb-4">
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre de la Clínica</Form.Label>
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
                  <Form.Label>Dirección</Form.Label>
                  <Form.Control
                    type="text"
                    name="direccion"
                    value={formData.direccion}
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
                    type="tel"
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
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Button variant="primary" type="submit">
              {editingId ? 'Actualizar' : 'Registrar'}
            </Button>
            {editingId && (
              <Button variant="secondary" className="ms-2" onClick={() => {
                setFormData({
                  nombre: '',
                  direccion: '',
                  telefono: '',
                  email: ''
                });
                setEditingId(null);
              }}>
                Cancelar
              </Button>
            )}
          </Form>

          <h3>Lista de Clínicas</h3>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Dirección</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clinicas.map((clinica) => (
                <tr key={clinica.id}>
                  <td>{clinica.id}</td>
                  <td>{clinica.nombre}</td>
                  <td>{clinica.direccion}</td>
                  <td>{clinica.telefono}</td>
                  <td>{clinica.email}</td>
                  <td>
                    <Button variant="warning" size="sm" onClick={() => handleEdit(clinica)} className="me-2">
                      Editar
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(clinica.id)}>
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tab>
        
        <Tab eventKey="usuarios" title="Gestionar Usuarios">
          <h3>{editingUsuarioId ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h3>
          <Form onSubmit={handleUsuarioSubmit} className="mb-4">
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control
                    type="text"
                    name="nombre"
                    value={usuarioData.nombre}
                    onChange={handleUsuarioChange}
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
                    value={usuarioData.email}
                    onChange={handleUsuarioChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Teléfono de contacto</Form.Label>
                  <Form.Control
                    type="tel"
                    name="telefono"
                    value={usuarioData.telefono}
                    onChange={handleUsuarioChange}
                    placeholder="Ingrese número telefónico"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{editingUsuarioId ? 'Nueva Contraseña (dejar en blanco para mantener la actual)' : 'Contraseña'}</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={usuarioData.password}
                    onChange={handleUsuarioChange}
                    required={!editingUsuarioId}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{editingUsuarioId ? 'Confirmar Nueva Contraseña' : 'Confirmar Contraseña'}</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmarPassword"
                    value={usuarioData.confirmarPassword}
                    onChange={handleUsuarioChange}
                    required={!editingUsuarioId}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Rol</Form.Label>
                  <Form.Select
                    name="rol"
                    value={usuarioData.rol}
                    onChange={handleUsuarioChange}
                    required
                  >
                    <option value="ADMINISTRATIVO">Administrativo</option>
                    <option value="VETERINARIO">Veterinario</option>
                    <option value="SUPERUSUARIO">Superusuario</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Clínica</Form.Label>
                  <Form.Select
                    name="clinica_id"
                    value={usuarioData.clinica_id}
                    onChange={handleUsuarioChange}
                    required
                  >
                    <option value="">Seleccionar clínica</option>
                    {clinicas.map((clinica) => (
                      <option key={clinica.id} value={clinica.id}>
                        {clinica.nombre}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Button variant="primary" type="submit">
              {editingUsuarioId ? 'Actualizar Usuario' : 'Crear Usuario'}
            </Button>
            {editingUsuarioId && (
              <Button variant="secondary" className="ms-2" onClick={handleCancelUsuario}>
                Cancelar
              </Button>
            )}
          </Form>
          
          <h3>Lista de Usuarios</h3>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Clínica</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">No hay usuarios registrados</td>
                </tr>
              ) : (
                usuarios.map((usuario) => (
                  <tr key={usuario.id}>
                    <td>{usuario.id}</td>
                    <td>{usuario.nombre}</td>
                    <td>{usuario.email}</td>
                    <td>{usuario.tipo_usuario || usuario.rol}</td>
                    <td>{usuario.clinica_nombre || (usuario.id_clinica && clinicas.find(c => c.id === usuario.id_clinica)?.nombre)}</td>
                    <td>
                      <Button variant="warning" size="sm" onClick={() => handleEditUsuario(usuario)} className="me-2">
                        Editar
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDeleteUsuario(usuario.id)}>
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Tab>
      </Tabs>
    </div>
  );
};

export default ClinicasForm; 