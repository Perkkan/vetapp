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
  ListItemAvatar,
  Avatar,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';

const ClinicaDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [clinica, setClinica] = useState(null);

  useEffect(() => {
    // TODO: Implementar la llamada a la API para obtener los detalles de la clínica
    // Por ahora usamos datos de ejemplo
    setClinica({
      id: 1,
      nombre: 'Clínica Veterinaria Central',
      direccion: 'Calle Principal 123',
      telefono: '123456789',
      horario: 'Lunes a Viernes 9:00 - 20:00',
      estado: 'Activo',
      servicios: ['Consultas', 'Cirugía', 'Emergencias 24h'],
      veterinarios: [
        { id: 1, nombre: 'Dr. Juan Pérez', especialidad: 'Cirugía' },
        { id: 2, nombre: 'Dra. María López', especialidad: 'Medicina General' }
      ],
      equipamiento: [
        'Rayos X',
        'Laboratorio',
        'Quirófano',
        'Sala de Recuperación'
      ]
    });
  }, [id]);

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Activo':
        return 'success';
      case 'Inactivo':
        return 'error';
      case 'Mantenimiento':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (!clinica) {
    return <Typography>Cargando...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            {clinica.nombre}
          </Typography>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/clinicas/editar/${id}`)}
          >
            Editar
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Dirección
            </Typography>
            <Typography variant="body1">{clinica.direccion}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Teléfono
            </Typography>
            <Typography variant="body1">{clinica.telefono}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Horario
            </Typography>
            <Typography variant="body1">{clinica.horario}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Estado
            </Typography>
            <Chip
              label={clinica.estado}
              color={getEstadoColor(clinica.estado)}
              size="small"
              sx={{ mt: 0.5 }}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Servicios
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {clinica.servicios.map((servicio, index) => (
                <Chip
                  key={index}
                  label={servicio}
                  variant="outlined"
                />
              ))}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Equipamiento
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {clinica.equipamiento.map((equipo, index) => (
                <Chip
                  key={index}
                  label={equipo}
                  variant="outlined"
                />
              ))}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Veterinarios
            </Typography>
            <List>
              {clinica.veterinarios.map((veterinario) => (
                <ListItem
                  key={veterinario.id}
                  button
                  onClick={() => navigate(`/veterinarios/${veterinario.id}`)}
                >
                  <ListItemAvatar>
                    <Avatar>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={veterinario.nombre}
                    secondary={veterinario.especialidad}
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

export default ClinicaDetalle; 