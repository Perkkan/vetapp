import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  LocalHospital as HospitalIcon,
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Pets as PetsIcon,
  Person as PersonIcon,
  InsertDriveFile as FileIcon,
  MedicalServices as MedicalIcon,
  Medication as MedicationIcon,
  Notes as NotesIcon
} from '@mui/icons-material';
import { salaEsperaService } from '../../services/api';

const HospitalizacionDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPacienteHospitalizado();
  }, [id]);

  const fetchPacienteHospitalizado = async () => {
    try {
      setLoading(true);
      const response = await salaEsperaService.getDetalleHospitalizacion(id);
      setPaciente(response.data);
    } catch (err) {
      console.error('Error al cargar detalle de hospitalización:', err);
      setError('Error al cargar la información del paciente hospitalizado');
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = () => {
    navigate(`/hospitalizacion/editar/${id}`);
  };

  const handleDarDeAlta = async () => {
    try {
      await salaEsperaService.finalizarAtencion(id);
      navigate('/hospitalizacion');
    } catch (err) {
      console.error('Error al dar de alta al paciente:', err);
      setError('Error al dar de alta al paciente');
    }
  };

  const handleVolver = () => {
    navigate('/hospitalizacion');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No especificado';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatTiempoHospitalizacion = (horas) => {
    if (!horas && horas !== 0) return 'No disponible';
    
    if (horas < 24) {
      return `${horas} horas`;
    } else {
      const dias = Math.floor(horas / 24);
      const horasRestantes = horas % 24;
      
      if (horasRestantes === 0) {
        return `${dias} día${dias > 1 ? 's' : ''}`;
      } else {
        return `${dias} día${dias > 1 ? 's' : ''} y ${horasRestantes} h`;
      }
    }
  };

  const formatTiempoRestante = (horas) => {
    if (!horas && horas !== 0) return 'No especificado';
    
    if (horas < 0) {
      return <Chip color="error" size="small" label="Pasado" />;
    }
    
    if (horas < 24) {
      return `${Math.max(0, horas)} horas`;
    } else {
      const dias = Math.floor(horas / 24);
      const horasRestantes = horas % 24;
      
      if (horasRestantes === 0) {
        return `${dias} día${dias > 1 ? 's' : ''}`;
      } else {
        return `${dias} día${dias > 1 ? 's' : ''} y ${horasRestantes} h`;
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleVolver}
          sx={{ mt: 2 }}
        >
          Volver a la lista
        </Button>
      </Box>
    );
  }

  if (!paciente) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">No se encontró información del paciente hospitalizado</Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleVolver}
          sx={{ mt: 2 }}
        >
          Volver a la lista
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <HospitalIcon fontSize="large" color="error" sx={{ mr: 2 }} />
          <Typography variant="h4" component="h1">
            Paciente Hospitalizado
          </Typography>
        </Box>
        <Box>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleVolver}
            sx={{ mr: 1 }}
          >
            Volver
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<EditIcon />}
            onClick={handleEditar}
            sx={{ mr: 1 }}
          >
            Editar
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckCircleIcon />}
            onClick={handleDarDeAlta}
          >
            Dar de Alta
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardHeader 
              title="Información del Paciente" 
              avatar={<PetsIcon color="primary" />}
            />
            <Divider />
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {paciente.paciente_nombre}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Especie
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {paciente.especie || 'No registrado'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Raza
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {paciente.raza || 'No registrada'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Sexo
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {paciente.sexo || 'No registrado'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Edad
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {paciente.edad || 'No registrada'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Peso
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {paciente.peso ? `${paciente.peso} kg` : 'No registrado'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ mt: 3 }}>
            <CardHeader 
              title="Propietario" 
              avatar={<PersonIcon color="secondary" />}
            />
            <Divider />
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {paciente.propietario_nombre || 'No registrado'}
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                Teléfono
              </Typography>
              <Typography variant="body1" gutterBottom>
                {paciente.propietario_telefono || 'No registrado'}
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body1">
                {paciente.propietario_email || 'No registrado'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card variant="outlined">
            <CardHeader 
              title="Detalles de la Hospitalización" 
              avatar={<HospitalIcon color="error" />}
              action={
                <Chip 
                  label={formatTiempoHospitalizacion(paciente.tiempo_hospitalizacion)} 
                  color="error" 
                />
              }
            />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Fecha de ingreso
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatDate(paciente.hora_hospitalizacion)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Alta prevista
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {paciente.fecha_prevista_alta ? formatDate(paciente.fecha_prevista_alta) : 'No especificado'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Tiempo hasta el alta
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatTiempoRestante(paciente.horas_hasta_alta)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Veterinario
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {paciente.veterinario_nombre || 'No asignado'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Motivo de hospitalización
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {paciente.motivo_hospitalizacion || 'No especificado'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Estado actual del paciente
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {paciente.estado_paciente || 'No especificado'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardHeader 
                  title="Procedimientos Realizados" 
                  avatar={<MedicalIcon color="info" />}
                />
                <Divider />
                <CardContent>
                  {paciente.procedimientos_realizados ? (
                    <Typography variant="body1">
                      {paciente.procedimientos_realizados}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No se han registrado procedimientos
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardHeader 
                  title="Medicación Actual" 
                  avatar={<MedicationIcon color="warning" />}
                />
                <Divider />
                <CardContent>
                  {paciente.medicacion_actual ? (
                    <Typography variant="body1">
                      {paciente.medicacion_actual}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No se ha registrado medicación
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardHeader 
                  title="Notas de Hospitalización" 
                  avatar={<NotesIcon color="secondary" />}
                />
                <Divider />
                <CardContent>
                  {paciente.notas_hospitalizacion ? (
                    <Typography variant="body1">
                      {paciente.notas_hospitalizacion}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No hay notas registradas
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HospitalizacionDetalle; 