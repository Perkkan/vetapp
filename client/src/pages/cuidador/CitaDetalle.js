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

const CitaDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cita, setCita] = useState(null);

  useEffect(() => {
    // TODO: Implementar la llamada a la API para obtener los detalles de la cita
    // Por ahora usamos datos de ejemplo
    setCita({
      id: 1,
      paciente: 'Max',
      propietario: 'Juan Pérez',
      fecha: '2024-03-20',
      hora: '10:00',
      tipo: 'Paseo',
      estado: 'Pendiente',
      notas: 'Paciente requiere paseo corto',
      duracion: '30 minutos',
      ubicacion: 'Parque Central',
      instrucciones: 'Usar correa y traer agua'
    });
  }, [id]);

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Pendiente':
        return 'warning';
      case 'En Proceso':
        return 'info';
      case 'Completada':
        return 'success';
      case 'Cancelada':
        return 'error';
      default:
        return 'default';
    }
  };

  if (!cita) {
    return <Typography>Cargando...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Detalles de la Cita
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/cuidador/citas')}
          >
            Volver
          </Button>
        </Box>

        <Grid container spacing={3}>
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
              Tipo
            </Typography>
            <Typography variant="body1">{cita.tipo}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Estado
            </Typography>
            <Chip
              label={cita.estado}
              color={getEstadoColor(cita.estado)}
              size="small"
              sx={{ mt: 0.5 }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Duración
            </Typography>
            <Typography variant="body1">{cita.duracion}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Ubicación
            </Typography>
            <Typography variant="body1">{cita.ubicacion}</Typography>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              Notas
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {cita.notas}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              Instrucciones
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {cita.instrucciones}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default CitaDetalle; 