import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { FaUser, FaLock, FaPaw } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('admin@veterinaria.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Si el usuario ya está autenticado, redirigir al dashboard
  useEffect(() => {
    if (isAuthenticated) {
      console.log('Usuario ya autenticado, redirigiendo...');
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    
    if (!email || !password) {
      setError('Por favor complete todos los campos');
      return;
    }
    
    setIsLoading(true);
    console.log('Iniciando proceso de login con:', { email });
    
    try {
      setSuccessMsg('Intentando iniciar sesión...');
      const result = await login(email, password);
      
      if (result.success) {
        console.log('Login exitoso, redirigiendo...');
        setSuccessMsg('¡Login exitoso! Redirigiendo...');
        
        // La redirección se maneja en AuthContext
      } else {
        console.error('Error al iniciar sesión:', result.message);
        setError(result.message || 'Credenciales inválidas');
      }
    } catch (err) {
      console.error('Error en componente Login:', err);
      setError('Error en el servidor. Intente nuevamente más tarde.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Autocompletar credenciales para facilitar pruebas
  const fillTestCredentials = () => {
    setEmail('admin@veterinaria.com');
    setPassword('admin123');
    setSuccessMsg('Credenciales de prueba cargadas. Haga clic en "Iniciar sesión"');
  };
  
  return (
    <Container fluid className="vh-100 d-flex align-items-center justify-content-center bg-light">
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6} xl={4}>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <FaPaw size={40} className="text-primary mb-2" />
                <h2 className="fw-bold">Sistema Veterinario</h2>
                <p className="text-muted">Inicie sesión para continuar</p>
              </div>
              
              {error && (
                <Alert variant="danger">{error}</Alert>
              )}
              
              {successMsg && (
                <Alert variant="success">{successMsg}</Alert>
              )}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Correo electrónico</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FaUser />
                    </span>
                    <Form.Control
                      type="email"
                      placeholder="Ingrese su correo"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label>Contraseña</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FaLock />
                    </span>
                    <Form.Control
                      type="password"
                      placeholder="Ingrese su contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </Form.Group>
                
                <div className="d-grid mb-3">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={isLoading}
                    className="py-2"
                  >
                    {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                  </Button>
                </div>
                
                <div className="text-center">
                  <small className="text-muted">
                    Modo de desarrollo activado
                  </small>
                </div>
              </Form>
            </Card.Body>
          </Card>
          
          <div className="text-center mt-3">
            <p className="text-muted">Para fines de prueba, use:</p>
            <p className="text-muted small mb-1">
              Correo: admin@veterinaria.com<br />
              Contraseña: admin123
            </p>
            <Button 
              variant="link" 
              size="sm" 
              className="text-decoration-none p-0" 
              onClick={fillTestCredentials}
            >
              Usar credenciales de prueba
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Login; 