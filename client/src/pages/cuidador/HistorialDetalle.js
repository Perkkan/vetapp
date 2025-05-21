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

const HistorialDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [historial, setHistorial] = useState(null);

  useEffect(() => {
    // TODO: Implementar la llamada a la API para obtener los detalles del historial
    // Por ahora usamos datos de ejemplo
    setHistorial({
      id: 1,
      paciente: 'Max',
      propietario: 'Juan Pérez',
      fecha: '2024-03-20',
      tipo: 'Paseo',
      estado: 'Completado',
      notas: 'Paciente disfrutó del paseo',
      duracion: '30 minutos',
      ubicacion: 'Parque Central',
      comportamiento: 'Muy sociable con otros perros',
      observaciones: 'Paciente mostró buen nivel de energía'
    });
  }, [id]);

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Completado':
        return 'success';
      case 'En Proceso':
        return 'warning';
      case 'Pendiente':
        return 'error';
      default:
        return 'default';
    }
  };

  if (!historial) {
    return <Typography>Cargando...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Detalles del Historial
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/cuidador/historiales')}
          >
            Volver
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Paciente
            </Typography>
            <Typography variant="body1">{historial.paciente}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Propietario
            </Typography>
            <Typography variant="body1">{historial.propietario}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Fecha
            </Typography>
            <Typography variant="body1">{historial.fecha}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Tipo
            </Typography>
            <Typography variant="body1">{historial.tipo}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Estado
            </Typography>
            <Chip
              label={historial.estado}
              color={getEstadoColor(historial.estado)}
              size="small"
              sx={{ mt: 0.5 }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Duración
            </Typography>
            <Typography variant="body1">{historial.duracion}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Ubicación
            </Typography>
            <Typography variant="body1">{historial.ubicacion}</Typography>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              Comportamiento
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {historial.comportamiento}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              Observaciones
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {historial.observaciones}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              Notas
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {historial.notas}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default HistorialDetalle; 