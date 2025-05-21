import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Chip,
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';

const VeterinarioDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [veterinario, setVeterinario] = useState(null);

  useEffect(() => {
    // TODO: Implementar la llamada a la API para obtener los detalles del veterinario
    // Por ahora usamos datos de ejemplo
    setVeterinario({
      id: 1,
      nombre: 'Dr. García',
      especialidad: 'Medicina General',
      email: 'dr.garcia@veterinaria.com',
      telefono: '123-456-7890',
      estado: 'Activo',
      notas: 'Veterinario con 10 años de experiencia'
    });
  }, [id]);

  if (!veterinario) {
    return <Typography>Cargando...</Typography>;
  }

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Activo':
        return 'success';
      case 'Inactivo':
        return 'error';
      case 'Vacaciones':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Detalles del Veterinario
          </Typography>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/veterinarios/editar/${id}`)}
          >
            Editar
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Nombre
            </Typography>
            <Typography variant="body1">{veterinario.nombre}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Especialidad
            </Typography>
            <Typography variant="body1">{veterinario.especialidad}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Email
            </Typography>
            <Typography variant="body1">{veterinario.email}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Teléfono
            </Typography>
            <Typography variant="body1">{veterinario.telefono}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Estado
            </Typography>
            <Chip
              label={veterinario.estado}
              color={getEstadoColor(veterinario.estado)}
              sx={{ mt: 1 }}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              Notas
            </Typography>
            <Typography variant="body1">{veterinario.notas}</Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default VeterinarioDetalle; 