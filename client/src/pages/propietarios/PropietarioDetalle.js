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
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

const PropietarioDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [propietario, setPropietario] = useState(null);

  useEffect(() => {
    // TODO: Implementar la llamada a la API para obtener los detalles del propietario
    // Por ahora usamos datos de ejemplo
    setPropietario({
      id: 1,
      nombre: 'Juan Pérez',
      email: 'juan@example.com',
      telefono: '123456789',
      direccion: 'Calle Principal 123',
      estado: 'Activo',
      notas: 'Cliente frecuente',
      fechaRegistro: '2024-01-01',
      mascotas: [
        { id: 1, nombre: 'Max', especie: 'Perro', raza: 'Labrador' },
        { id: 2, nombre: 'Luna', especie: 'Gato', raza: 'Siamés' }
      ]
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

  if (!propietario) {
    return <Typography>Cargando...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Detalles del Propietario
          </Typography>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/propietarios/editar/${id}`)}
          >
            Editar
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Nombre
            </Typography>
            <Typography variant="body1">{propietario.nombre}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Email
            </Typography>
            <Typography variant="body1">{propietario.email}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Teléfono
            </Typography>
            <Typography variant="body1">{propietario.telefono}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Estado
            </Typography>
            <Chip
              label={propietario.estado}
              color={getEstadoColor(propietario.estado)}
              size="small"
              sx={{ mt: 0.5 }}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              Dirección
            </Typography>
            <Typography variant="body1">{propietario.direccion}</Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              Notas
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {propietario.notas}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              Fecha de Registro
            </Typography>
            <Typography variant="body1">{propietario.fechaRegistro}</Typography>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Mascotas Registradas
            </Typography>
            <List>
              {propietario.mascotas.map((mascota) => (
                <ListItem
                  key={mascota.id}
                  button
                  onClick={() => navigate(`/pacientes/${mascota.id}`)}
                >
                  <ListItemText
                    primary={mascota.nombre}
                    secondary={`${mascota.especie} - ${mascota.raza}`}
                  />
                </ListItem>
              ))}
            </List>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default PropietarioDetalle; 