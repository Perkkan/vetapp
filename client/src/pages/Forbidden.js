import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container, Paper, SvgIcon } from '@mui/material';
import { useAuth } from '../components/AuthProvider';

// Icono de acceso prohibido
const ForbiddenIcon = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8 0-1.85.63-3.55 1.69-4.9L16.9 18.31C15.55 19.37 13.85 20 12 20zm6.31-3.1L7.1 5.69C8.45 4.63 10.15 4 12 4c4.42 0 8 3.58 8 8 0 1.85-.63 3.55-1.69 4.9z" />
  </SvgIcon>
);

const Forbidden = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          py: 4
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 2,
            textAlign: 'center'
          }}
        >
          <ForbiddenIcon color="error" sx={{ fontSize: 100, mb: 2 }} />
          
          <Typography component="h1" variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>
            Acceso Denegado
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: 600, mb: 3 }}>
            Lo sentimos, no tienes permiso para acceder a esta página. 
            {user ? (
              ` Tu rol actual es "${user.rol}" y puede que necesites permisos adicionales.`
            ) : (
              ' Debes iniciar sesión para acceder a esta funcionalidad.'
            )}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button 
              variant="outlined" 
              onClick={handleGoBack}
              sx={{ minWidth: 150 }}
            >
              Volver atrás
            </Button>
            
            <Button 
              variant="contained" 
              onClick={handleGoToDashboard}
              sx={{ minWidth: 150 }}
            >
              Ir al Dashboard
            </Button>
            
            {!user && (
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => navigate('/login')}
                sx={{ minWidth: 150 }}
              >
                Iniciar Sesión
              </Button>
            )}
            
            {user && (
              <Button 
                variant="outlined" 
                color="error"
                onClick={logout}
                sx={{ minWidth: 150 }}
              >
                Cerrar Sesión
              </Button>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Forbidden; 