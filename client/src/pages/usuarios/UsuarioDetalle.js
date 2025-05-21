import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Chip,
  Divider,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

const UsuarioDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    // TODO: Implementar la llamada a la API para obtener los detalles del usuario
    // Por ahora usamos datos de ejemplo
    setUsuario({
      id: 1,
      nombre: 'Juan Pérez',
      email: 'juan@example.com',
      rol: 'Administrador',
      estado: 'Activo',
      telefono: '123456789',
      direccion: 'Calle Principal 123',
      ultimoAcceso: '2024-03-20',
      fechaCreacion: '2024-01-01'
    });
  }, [id]);

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Activo':
        return 'success';
      case 'Inactivo':
        return 'error';
      case 'Pendiente':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (!usuario) {
    return <Typography>Cargando...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Detalles del Usuario
          </Typography>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/usuarios/editar/${id}`)}
          >
            Editar
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Nombre
            </Typography>
            <Typography variant="body1">{usuario.nombre}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Email
            </Typography>
            <Typography variant="body1">{usuario.email}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Rol
            </Typography>
            <Typography variant="body1">{usuario.rol}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Estado
            </Typography>
            <Chip
              label={usuario.estado}
              color={getEstadoColor(usuario.estado)}
              size="small"
              sx={{ mt: 0.5 }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Teléfono
            </Typography>
            <Typography variant="body1">{usuario.telefono}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Dirección
            </Typography>
            <Typography variant="body1">{usuario.direccion}</Typography>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Último Acceso
            </Typography>
            <Typography variant="body1">{usuario.ultimoAcceso}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Fecha de Creación
            </Typography>
            <Typography variant="body1">{usuario.fechaCreacion}</Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default UsuarioDetalle; 