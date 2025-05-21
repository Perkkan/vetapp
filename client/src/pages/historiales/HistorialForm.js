import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Divider,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Snackbar
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { es } from 'date-fns/locale';
import { historialesService, pacientesService, veterinariosService } from '../../services/api';

const HistorialForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEditing = !!id;

  // Obtener el pacienteId de los query params si existe
  const queryParams = new URLSearchParams(location.search);
  const pacienteIdParam = queryParams.get('paciente');

  const [historial, setHistorial] = useState({
    fecha: new Date(),
    paciente_id: pacienteIdParam || '',
    veterinario_id: '',
    motivo_consulta: '',
    sintomas: '',
    diagnostico: '',
    tratamiento: '',
    observaciones: ''
  });

  const [pacientes, setPacientes] = useState([]);
  const [veterinarios, setVeterinarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPacientes();
    fetchVeterinarios();
    
    if (isEditing) {
      fetchHistorial(id);
    }
  }, [id]);

  const fetchPacientes = async () => {
    try {
      const response = await pacientesService.getAllPacientes();
      setPacientes(response.data);
    } catch (err) {
      console.error('Error al cargar los pacientes:', err);
      setError('No se pudieron cargar los pacientes');
    }
  };

  const fetchVeterinarios = async () => {
    try {
      const response = await veterinariosService.getAllVeterinarios();
      setVeterinarios(response.data);
    } catch (err) {
      console.error('Error al cargar los veterinarios:', err);
      setError('No se pudieron cargar los veterinarios');
    }
  };

  const fetchHistorial = async (historialId) => {
    try {
      setLoading(true);
      const response = await historialesService.getHistorialById(historialId);
      const historialData = response.data;
      
      setHistorial({
        ...historialData,
        fecha: historialData.fecha ? new Date(historialData.fecha) : new Date(),
        paciente_id: historialData.paciente_id || '',
        veterinario_id: historialData.veterinario_id || '',
      });
    } catch (err) {
      console.error('Error al cargar el historial:', err);
      setError('No se pudo cargar la información del historial');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setHistorial(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleDateChange = (date) => {
    setHistorial(prevState => ({
      ...prevState,
      fecha: date
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!historial.paciente_id) {
      setError('Por favor, seleccione un paciente');
      return;
    }
    
    try {
      setSubmitLoading(true);
      setError('');
      
      const historialData = {
        ...historial,
        fecha: historial.fecha.toISOString().split('T')[0],
      };
      
      if (isEditing) {
        await historialesService.updateHistorial(id, historialData);
        setSuccess('Historial actualizado correctamente');
      } else {
        await historialesService.createHistorial(historialData);
        setSuccess('Historial creado correctamente');
      }
      
      // Redirigir después de un breve tiempo
      setTimeout(() => {
        if (historial.paciente_id) {
          // Si tenemos un paciente_id, redirigir a los detalles del paciente
          navigate(`/pacientes/${historial.paciente_id}`);
        } else {
          // Si no, redirigir a la lista de historiales
          navigate('/historiales');
        }
      }, 2000);
    } catch (err) {
      console.error('Error al guardar el historial:', err);
      setError('Ocurrió un error al guardar los datos del historial');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCancel = () => {
    if (pacienteIdParam) {
      navigate(`/pacientes/${pacienteIdParam}`);
    } else {
      navigate('/historiales');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar 
        open={!!success} 
        autoHideDuration={6000} 
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      </Snackbar>

      <Box display="flex" alignItems="center" mb={3}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleCancel}
          sx={{ mr: 2 }}
        >
          Volver
        </Button>
        <Typography variant="h4" component="h1">
          {isEditing ? 'Editar Historial Médico' : 'Nuevo Historial Médico'}
        </Typography>
      </Box>

      <Paper elevation={3}>
        <Box component="form" onSubmit={handleSubmit} p={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Información General
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                    <DatePicker
                      label="Fecha"
                      value={historial.fecha}
                      onChange={handleDateChange}
                      renderInput={(params) => <TextField {...params} fullWidth margin="normal" required />}
                      slotProps={{ textField: { fullWidth: true, margin: 'normal', required: true } }}
                    />
                  </LocalizationProvider>

                  <FormControl fullWidth margin="normal" required>
                    <InputLabel id="paciente-label">Paciente</InputLabel>
                    <Select
                      labelId="paciente-label"
                      id="paciente_id"
                      name="paciente_id"
                      value={historial.paciente_id || ''}
                      label="Paciente"
                      onChange={handleChange}
                      disabled={!!pacienteIdParam}
                    >
                      <MenuItem value="">Seleccionar paciente</MenuItem>
                      {pacientes.map((paciente) => (
                        <MenuItem key={paciente.id} value={paciente.id}>
                          {paciente.nombre} ({paciente.especie} - {paciente.raza})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth margin="normal" required>
                    <InputLabel id="veterinario-label">Veterinario</InputLabel>
                    <Select
                      labelId="veterinario-label"
                      id="veterinario_id"
                      name="veterinario_id"
                      value={historial.veterinario_id || ''}
                      label="Veterinario"
                      onChange={handleChange}
                    >
                      <MenuItem value="">Sin asignar</MenuItem>
                      {veterinarios.map((veterinario) => (
                        <MenuItem key={veterinario.id} value={veterinario.id}>
                          {veterinario.nombre} {veterinario.apellido}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Motivo de la Consulta
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Motivo de consulta"
                    name="motivo_consulta"
                    value={historial.motivo_consulta || ''}
                    onChange={handleChange}
                    required
                    multiline
                    rows={4}
                  />
                  
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Síntomas"
                    name="sintomas"
                    value={historial.sintomas || ''}
                    onChange={handleChange}
                    multiline
                    rows={4}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Diagnóstico y Tratamiento
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Diagnóstico"
                    name="diagnostico"
                    value={historial.diagnostico || ''}
                    onChange={handleChange}
                    required
                    multiline
                    rows={2}
                  />
                  
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Tratamiento"
                    name="tratamiento"
                    value={historial.tratamiento || ''}
                    onChange={handleChange}
                    required
                    multiline
                    rows={3}
                  />
                  
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Observaciones adicionales"
                    name="observaciones"
                    value={historial.observaciones || ''}
                    onChange={handleChange}
                    multiline
                    rows={3}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box mt={3} display="flex" justifyContent="flex-end">
            <Button 
              variant="contained" 
              color="primary" 
              size="large" 
              startIcon={<SaveIcon />}
              type="submit"
              disabled={submitLoading}
            >
              {submitLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                isEditing ? 'Guardar Cambios' : 'Guardar Historial'
              )}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default HistorialForm; 