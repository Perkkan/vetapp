import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { es } from 'date-fns/locale';

// Datos de ejemplo
const pacientes = [
  { id: 1, nombre: 'Max', propietario: 'Juan Pérez' },
  { id: 2, nombre: 'Luna', propietario: 'María Gómez' },
  { id: 3, nombre: 'Rocky', propietario: 'Pedro Rodríguez' },
  { id: 4, nombre: 'Simba', propietario: 'Ana Martínez' },
  { id: 5, nombre: 'Toby', propietario: 'Carlos López' }
];

const veterinarios = [
  { id: 1, nombre: 'Dra. María Rodríguez' },
  { id: 2, nombre: 'Dr. Carlos Sánchez' },
  { id: 3, nombre: 'Dr. José López' },
  { id: 4, nombre: 'Dra. Laura García' }
];

const tiposCita = [
  'Consulta',
  'Vacunación',
  'Control',
  'Cirugía',
  'Emergencia',
  'Peluquería'
];

const CitaForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    pacienteId: '',
    fecha: null,
    hora: null,
    tipo: '',
    veterinarioId: '',
    notas: '',
    estado: 'Pendiente'
  });

  useEffect(() => {
    if (id) {
      // Si estamos editando, cargar los datos de la cita
      setLoading(true);
      // Simulamos una llamada a la API
      setTimeout(() => {
        const citaExistente = {
          pacienteId: 1,
          fecha: new Date('2025-03-25'),
          hora: new Date('2025-03-25T09:00:00'),
          tipo: 'Consulta',
          veterinarioId: 1,
          notas: 'Revisión anual',
          estado: 'Pendiente'
        };
        setFormData(citaExistente);
        setLoading(false);
      }, 500);
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Borrar el error al cambiar el valor
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      fecha: date
    });
    if (errors.fecha) {
      setErrors({
        ...errors,
        fecha: null
      });
    }
  };

  const handleTimeChange = (time) => {
    setFormData({
      ...formData,
      hora: time
    });
    if (errors.hora) {
      setErrors({
        ...errors,
        hora: null
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.pacienteId) {
      newErrors.pacienteId = 'Seleccione un paciente';
    }
    if (!formData.fecha) {
      newErrors.fecha = 'Seleccione una fecha';
    }
    if (!formData.hora) {
      newErrors.hora = 'Seleccione una hora';
    }
    if (!formData.tipo) {
      newErrors.tipo = 'Seleccione un tipo de cita';
    }
    if (!formData.veterinarioId) {
      newErrors.veterinarioId = 'Seleccione un veterinario';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // TODO: Implementar la llamada a la API para guardar los datos
      console.log('Datos a enviar:', formData);
      navigate('/citas');
    }
  };

  if (loading) {
    return <Typography>Cargando...</Typography>;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box p={3}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            {id ? 'Editar Cita' : 'Nueva Cita'}
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.pacienteId} required>
                  <InputLabel id="paciente-label">Paciente</InputLabel>
                  <Select
                    labelId="paciente-label"
                    name="pacienteId"
                    value={formData.pacienteId}
                    onChange={handleChange}
                    label="Paciente"
                  >
                    {pacientes.map((paciente) => (
                      <MenuItem key={paciente.id} value={paciente.id}>
                        {paciente.nombre} ({paciente.propietario})
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.pacienteId && <FormHelperText>{errors.pacienteId}</FormHelperText>}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.veterinarioId} required>
                  <InputLabel id="veterinario-label">Veterinario</InputLabel>
                  <Select
                    labelId="veterinario-label"
                    name="veterinarioId"
                    value={formData.veterinarioId}
                    onChange={handleChange}
                    label="Veterinario"
                  >
                    {veterinarios.map((vet) => (
                      <MenuItem key={vet.id} value={vet.id}>
                        {vet.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.veterinarioId && <FormHelperText>{errors.veterinarioId}</FormHelperText>}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Fecha"
                  value={formData.fecha}
                  onChange={handleDateChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      required
                      error={!!errors.fecha}
                      helperText={errors.fecha}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TimePicker
                  label="Hora"
                  value={formData.hora}
                  onChange={handleTimeChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      required
                      error={!!errors.hora}
                      helperText={errors.hora}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.tipo} required>
                  <InputLabel id="tipo-label">Tipo de Cita</InputLabel>
                  <Select
                    labelId="tipo-label"
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleChange}
                    label="Tipo de Cita"
                  >
                    {tiposCita.map((tipo) => (
                      <MenuItem key={tipo} value={tipo}>
                        {tipo}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.tipo && <FormHelperText>{errors.tipo}</FormHelperText>}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="estado-label">Estado</InputLabel>
                  <Select
                    labelId="estado-label"
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    label="Estado"
                  >
                    <MenuItem value="Pendiente">Pendiente</MenuItem>
                    <MenuItem value="Confirmada">Confirmada</MenuItem>
                    <MenuItem value="Completada">Completada</MenuItem>
                    <MenuItem value="Cancelada">Cancelada</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Notas"
                  name="notas"
                  value={formData.notas}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/citas')}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                  >
                    {id ? 'Actualizar' : 'Crear'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </LocalizationProvider>
  );
};

export default CitaForm; 