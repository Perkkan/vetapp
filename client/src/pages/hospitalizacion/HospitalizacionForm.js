import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent,
  CardHeader
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { es } from 'date-fns/locale';
import {
  LocalHospital as HospitalIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  MedicalServices as MedicalIcon,
  Medication as MedicationIcon,
  Notes as NotesIcon
} from '@mui/icons-material';
import { salaEsperaService, veterinariosService } from '../../services/api';

const HospitalizacionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [veterinarios, setVeterinarios] = useState([]);
  
  const [formData, setFormData] = useState({
    motivo_hospitalizacion: '',
    fecha_prevista_alta: null,
    veterinario_id: '',
    procedimientos_realizados: '',
    medicacion_actual: '',
    notas_hospitalizacion: '',
    estado_paciente: ''
  });

  useEffect(() => {
    fetchVeterinarios();
    fetchPacienteHospitalizado();
  }, [id]);

  const fetchVeterinarios = async () => {
    try {
      const response = await veterinariosService.getAllVeterinarios();
      setVeterinarios(response.data);
    } catch (err) {
      console.error('Error al cargar veterinarios:', err);
      setError('Error al cargar la lista de veterinarios');
    }
  };

  const fetchPacienteHospitalizado = async () => {
    try {
      setLoading(true);
      const response = await salaEsperaService.getDetalleHospitalizacion(id);
      const pacienteData = response.data;
      
      setFormData({
        motivo_hospitalizacion: pacienteData.motivo_hospitalizacion || '',
        fecha_prevista_alta: pacienteData.fecha_prevista_alta ? new Date(pacienteData.fecha_prevista_alta) : null,
        veterinario_id: pacienteData.veterinario_id || '',
        procedimientos_realizados: pacienteData.procedimientos_realizados || '',
        medicacion_actual: pacienteData.medicacion_actual || '',
        notas_hospitalizacion: pacienteData.notas_hospitalizacion || '',
        estado_paciente: pacienteData.estado_paciente || ''
      });
    } catch (err) {
      console.error('Error al cargar detalle de hospitalización:', err);
      setError('Error al cargar la información del paciente hospitalizado');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      fecha_prevista_alta: date
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError('');
      
      const dataToSend = {
        ...formData,
        fecha_prevista_alta: formData.fecha_prevista_alta ? formData.fecha_prevista_alta.toISOString() : null
      };
      
      await salaEsperaService.actualizarHospitalizacion(id, dataToSend);
      setSuccess('Información de hospitalización actualizada correctamente');
      
      // Redirigir después de un breve tiempo para que el usuario vea el mensaje de éxito
      setTimeout(() => {
        navigate(`/hospitalizacion/${id}`);
      }, 1500);
    } catch (err) {
      console.error('Error al actualizar información de hospitalización:', err);
      setError('Error al guardar los datos. Por favor, inténtelo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVolver = () => {
    navigate(`/hospitalizacion/${id}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <HospitalIcon fontSize="large" color="error" sx={{ mr: 2 }} />
        <Typography variant="h4" component="h1">
          Editar Hospitalización
        </Typography>
      </Box>
      
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardHeader 
                title="Información General"
                avatar={<HospitalIcon color="primary" />}
              />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      name="motivo_hospitalizacion"
                      label="Motivo de hospitalización"
                      value={formData.motivo_hospitalizacion}
                      onChange={handleChange}
                      fullWidth
                      multiline
                      rows={3}
                      required
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                      <DateTimePicker
                        label="Fecha prevista de alta"
                        value={formData.fecha_prevista_alta}
                        onChange={handleDateChange}
                        slotProps={{
                          textField: { fullWidth: true }
                        }}
                      />
                    </LocalizationProvider>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Veterinario</InputLabel>
                      <Select
                        name="veterinario_id"
                        value={formData.veterinario_id}
                        onChange={handleChange}
                        label="Veterinario"
                      >
                        <MenuItem value="">Sin asignar</MenuItem>
                        {veterinarios.map(vet => (
                          <MenuItem key={vet.id} value={vet.id}>
                            {vet.nombre}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      name="estado_paciente"
                      label="Estado actual del paciente"
                      value={formData.estado_paciente}
                      onChange={handleChange}
                      fullWidth
                      multiline
                      rows={3}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardHeader 
                    title="Procedimientos Realizados"
                    avatar={<MedicalIcon color="info" />}
                  />
                  <Divider />
                  <CardContent>
                    <TextField
                      name="procedimientos_realizados"
                      label="Procedimientos realizados"
                      value={formData.procedimientos_realizados}
                      onChange={handleChange}
                      fullWidth
                      multiline
                      rows={4}
                      placeholder="Detalle los procedimientos realizados durante la hospitalización"
                    />
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardHeader 
                    title="Medicación Actual"
                    avatar={<MedicationIcon color="warning" />}
                  />
                  <Divider />
                  <CardContent>
                    <TextField
                      name="medicacion_actual"
                      label="Medicación actual"
                      value={formData.medicacion_actual}
                      onChange={handleChange}
                      fullWidth
                      multiline
                      rows={4}
                      placeholder="Detalle la medicación actual del paciente (medicamento, dosis, frecuencia)"
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
          
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardHeader 
                title="Notas de Hospitalización"
                avatar={<NotesIcon color="secondary" />}
              />
              <Divider />
              <CardContent>
                <TextField
                  name="notas_hospitalizacion"
                  label="Notas adicionales"
                  value={formData.notas_hospitalizacion}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Notas adicionales sobre la hospitalización, evolución, observaciones, etc."
                />
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Box display="flex" justifyContent="space-between" mt={3}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={handleVolver}
              >
                Volver
              </Button>
              
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                disabled={submitting}
              >
                {submitting ? <CircularProgress size={24} /> : 'Guardar Cambios'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default HospitalizacionForm; 