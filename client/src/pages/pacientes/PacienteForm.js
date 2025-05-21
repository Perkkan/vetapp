import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { pacientesService, propietariosService } from '../../services/api';

const PacienteForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    especie: '',
    raza: '',
    fecha_nacimiento: '',
    peso: '',
    sexo: '',
    estado: 'Activo',
    propietario_id: '',
    notas: ''
  });
  const [errors, setErrors] = useState({});
  const [propietarios, setPropietarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchPropietarios = async () => {
      try {
        setLoadingData(true);
        const response = await propietariosService.getAllPropietarios();
        setPropietarios(response.data);
      } catch (err) {
        console.error('Error al cargar propietarios:', err);
        setError('Error al cargar la lista de propietarios');
      } finally {
        setLoadingData(false);
      }
    };

    fetchPropietarios();

    if (id) {
      const fetchPaciente = async () => {
        try {
          setLoadingData(true);
          const response = await pacientesService.getPacienteById(id);
          setFormData({
            nombre: response.data.nombre || '',
            especie: response.data.especie || '',
            raza: response.data.raza || '',
            fecha_nacimiento: response.data.fecha_nacimiento ? response.data.fecha_nacimiento.split('T')[0] : '',
            peso: response.data.peso ? response.data.peso.toString() : '',
            sexo: response.data.sexo || '',
            estado: response.data.estado || 'Activo',
            propietario_id: response.data.propietario_id || '',
            notas: response.data.notas || ''
          });
        } catch (err) {
          console.error('Error al cargar paciente:', err);
          setError('Error al cargar los datos del paciente');
        } finally {
          setLoadingData(false);
        }
      };

      fetchPaciente();
    }
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar error del campo cuando se modifica
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }
    if (!formData.especie.trim()) {
      newErrors.especie = 'La especie es requerida';
    }
    if (!formData.raza.trim()) {
      newErrors.raza = 'La raza es requerida';
    }
    if (!formData.fecha_nacimiento) {
      newErrors.fecha_nacimiento = 'La fecha de nacimiento es requerida';
    }
    if (!formData.peso.trim()) {
      newErrors.peso = 'El peso es requerido';
    }
    if (!formData.sexo) {
      newErrors.sexo = 'El sexo es requerido';
    }
    if (!formData.propietario_id) {
      newErrors.propietario_id = 'El propietario es requerido';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (validateForm()) {
      setLoading(true);
      setError('');

      try {
        // Convertir propietario_id y peso a números
        const pacienteData = {
          ...formData,
          propietario_id: parseInt(formData.propietario_id),
          peso: parseFloat(formData.peso)
        };

        if (id) {
          await pacientesService.updatePaciente(id, pacienteData);
          setSuccess('Paciente actualizado correctamente');
        } else {
          await pacientesService.createPaciente(pacienteData);
          setSuccess('Paciente creado correctamente');
        }

        // Redirigir después de 1 segundo
        setTimeout(() => {
          navigate('/pacientes');
        }, 1000);
      } catch (err) {
        console.error('Error al guardar paciente:', err);
        setError(err.response?.data?.message || 'Error al guardar el paciente');
      } finally {
        setLoading(false);
      }
    }
  };

  if (loadingData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
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

      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {id ? 'Editar Paciente' : 'Nuevo Paciente'}
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                error={!!errors.nombre}
                helperText={errors.nombre}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Especie"
                name="especie"
                value={formData.especie}
                onChange={handleChange}
                error={!!errors.especie}
                helperText={errors.especie}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Raza"
                name="raza"
                value={formData.raza}
                onChange={handleChange}
                error={!!errors.raza}
                helperText={errors.raza}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fecha de Nacimiento"
                name="fecha_nacimiento"
                type="date"
                value={formData.fecha_nacimiento}
                onChange={handleChange}
                error={!!errors.fecha_nacimiento}
                helperText={errors.fecha_nacimiento}
                required
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Peso (kg)"
                name="peso"
                type="number"
                value={formData.peso}
                onChange={handleChange}
                error={!!errors.peso}
                helperText={errors.peso}
                required
                InputProps={{
                  inputProps: { min: 0, step: 0.1 }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.sexo} required>
                <InputLabel>Sexo</InputLabel>
                <Select
                  name="sexo"
                  value={formData.sexo}
                  onChange={handleChange}
                  label="Sexo"
                >
                  <MenuItem value="Macho">Macho</MenuItem>
                  <MenuItem value="Hembra">Hembra</MenuItem>
                </Select>
                {errors.sexo && <FormHelperText>{errors.sexo}</FormHelperText>}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.propietario_id} required>
                <InputLabel>Propietario</InputLabel>
                <Select
                  name="propietario_id"
                  value={formData.propietario_id}
                  onChange={handleChange}
                  label="Propietario"
                >
                  {propietarios.map((propietario) => (
                    <MenuItem key={propietario.id} value={propietario.id}>
                      {propietario.nombre}
                    </MenuItem>
                  ))}
                </Select>
                {errors.propietario_id && <FormHelperText>{errors.propietario_id}</FormHelperText>}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  label="Estado"
                >
                  <MenuItem value="Activo">Activo</MenuItem>
                  <MenuItem value="Inactivo">Inactivo</MenuItem>
                  <MenuItem value="En tratamiento">En tratamiento</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notas"
                name="notas"
                value={formData.notas}
                onChange={handleChange}
                multiline
                rows={4}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/pacientes')}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={24} sx={{ mr: 1 }} color="inherit" />
                      {id ? 'Actualizando...' : 'Guardando...'}
                    </>
                  ) : (
                    id ? 'Actualizar' : 'Guardar'
                  )}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default PacienteForm; 