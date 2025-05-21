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
  CircularProgress,
  Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import PetsIcon from '@mui/icons-material/Pets';
import { pacientesService, historialesService } from '../../services/api';

const PacienteDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState(null);
  const [historiales, setHistoriales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPacienteData = async () => {
      try {
        setLoading(true);
        const pacienteResponse = await pacientesService.getPacienteById(id);
        setPaciente(pacienteResponse.data);
        
        // Obtener historiales del paciente
        const historialesResponse = await historialesService.getHistorialesByPaciente(id);
        setHistoriales(historialesResponse.data);
      } catch (err) {
        console.error('Error al cargar datos del paciente:', err);
        setError('No se pudieron cargar los datos del paciente');
      } finally {
        setLoading(false);
      }
    };

    fetchPacienteData();
  }, [id]);

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Activo':
        return 'success';
      case 'En Tratamiento':
        return 'warning';
      case 'Crítico':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/D';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!paciente) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">No se encontró el paciente solicitado</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
              <PetsIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Typography variant="h4" component="h1">
              {paciente.nombre}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/pacientes/editar/${id}`)}
          >
            Editar
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Especie
            </Typography>
            <Typography variant="body1">{paciente.especie}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Raza
            </Typography>
            <Typography variant="body1">{paciente.raza}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Edad
            </Typography>
            <Typography variant="body1">{paciente.edad}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Peso
            </Typography>
            <Typography variant="body1">{paciente.peso}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Estado
            </Typography>
            <Chip
              label={paciente.estado}
              color={getEstadoColor(paciente.estado)}
              size="small"
              sx={{ mt: 0.5 }}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Propietario
            </Typography>
            <Box
              sx={{ cursor: 'pointer' }}
              onClick={() => navigate(`/propietarios/${paciente.propietario_id}`)}
            >
              <Typography variant="body1">{paciente.propietario_nombre || 'No asignado'}</Typography>
              <Typography variant="body2" color="text.secondary">
                Tel: {paciente.propietario_telefono || 'N/D'}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Historial Médico
              </Typography>
              <Button 
                variant="outlined" 
                color="primary"
                onClick={() => navigate(`/historiales/nuevo?paciente=${paciente.id}`)}
              >
                Nuevo historial
              </Button>
            </Box>
            <List>
              {historiales.length > 0 ? (
                historiales.map((historial) => (
                  <ListItem
                    key={historial.id}
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                    }}
                    button
                    onClick={() => navigate(`/historiales/${historial.id}`)}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="subtitle1">
                            {historial.diagnostico}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(historial.fecha)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2">Tratamiento: {historial.tratamiento}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Atendido por: {historial.veterinario_nombre || 'No asignado'}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No hay registros médicos para este paciente
                </Typography>
              )}
            </List>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default PacienteDetalle; 