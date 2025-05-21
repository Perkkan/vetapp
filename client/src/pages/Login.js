import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Divider,
  Chip
} from '@mui/material';
import { Pets as PetsIcon, Lock as LockIcon } from '@mui/icons-material';
import { useAuth } from '../components/AuthProvider';
import logo from '../assets/logo.png'; // Asegúrate de tener un logo en esta ubicación

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, user, error: authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Si ya hay un usuario autenticado, redirigir al dashboard
  useEffect(() => {
    if (user) {
      // Redireccionar a la página anterior o al dashboard
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación básica
    if (!email.trim() || !password.trim()) {
      setFormError('Por favor, complete todos los campos');
      return;
    }
    
    // Validación de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError('Por favor, ingrese un email válido');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setFormError('');
      
      const result = await login({ email, password });
      
      if (!result.success) {
        setFormError(result.message || 'Credenciales incorrectas');
      }
    } catch (err) {
      setFormError('Error al iniciar sesión. Intente nuevamente.');
      console.error('Error de inicio de sesión:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          py: 2
        }}
      >
        <Paper 
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 2
          }}
        >
          <Box sx={{ mb: 2, textAlign: 'center' }}>
            <img 
              src={logo} 
              alt="Logo Veterinaria" 
              style={{ 
                maxWidth: '180px', 
                marginBottom: '1rem' 
              }}
            />
            <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold' }}>
              Iniciar Sesión
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sistema de Gestión Veterinaria
            </Typography>
          </Box>
          
          {(formError || authError) && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {formError || authError}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Correo Electrónico"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.2 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
            
            <Grid container>
              <Grid item xs>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => alert('Funcionalidad en desarrollo')}
                  disabled={isSubmitting}
                  sx={{ fontSize: '0.8rem' }}
                >
                  ¿Olvidó su contraseña?
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
          © {new Date().getFullYear()} Sistema de Gestión Veterinaria. Todos los derechos reservados.
        </Typography>
      </Box>
    </Container>
  );
};

export default Login; 