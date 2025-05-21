import React from 'react';
import { Box, Typography, Container, Button, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Register = () => {
  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Registro no disponible
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          El registro de nuevos usuarios está temporalmente deshabilitado.
          Por favor, contacta al administrador para obtener una cuenta.
        </Typography>
        <Link component={RouterLink} to="/login">
          <Button variant="contained">
            Volver al inicio de sesión
          </Button>
        </Link>
      </Box>
    </Container>
  );
};

export default Register; 