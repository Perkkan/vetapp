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

const CitaDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cita, setCita] = useState(null);

  useEffect(() => {
    // TODO: Implementar la llamada a la API para obtener los detalles de la cita
    // Por ahora usamos datos de ejemplo
    setCita({
      id: 1,
      fecha: '2024-03-20',
      hora: '10:00',
      paciente: 'Max',
      propietario: 'Juan Pérez',
      veterinario: 'Dr. García',
      estado: 'Pendiente',
      notas: 'Consulta de rutina'
    });
  }, [id]);

  if (!cita) {
    return <Typography>Cargando...</Typography>;
  }

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Pendiente':
        return 'warning';
      case 'Confirmada':
        return 'info';
      case 'Completada':
        return 'success';
      case 'Cancelada':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Detalles de la Cita
          </Typography>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/citas/editar/${id}`)}
          >
            Editar
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Fecha
            </Typography>
            <Typography variant="body1">{cita.fecha}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Hora
            </Typography>
            <Typography variant="body1">{cita.hora}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Paciente
            </Typography>
            <Typography variant="body1">{cita.paciente}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Propietario
            </Typography>
            <Typography variant="body1">{cita.propietario}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Veterinario
            </Typography>
            <Typography variant="body1">{cita.veterinario}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Estado
            </Typography>
            <Chip
              label={cita.estado}
              color={getEstadoColor(cita.estado)}
              sx={{ mt: 1 }}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              Notas
            </Typography>
            <Typography variant="body1">{cita.notas}</Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default CitaDetalle; 