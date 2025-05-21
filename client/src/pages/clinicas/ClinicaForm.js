import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { clinicasService } from '../../services/api';

const ClinicaForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [administradores, setAdministradores] = useState([]);
  
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    email: '',
    admin_id: '',
    logo_url: '',
    activo: true
  });
  
  const isEditMode = !!id;

  useEffect(() => {
    if (isEditMode) {
      fetchClinica();
    }
    fetchAdministradores();
  }, [id]);

  const fetchClinica = async () => {
    try {
      setLoading(true);
      const response = await clinicasService.getClinicaById(id);
      const clinica = response.data;
      
      setFormData({
        nombre: clinica.nombre,
        direccion: clinica.direccion,
        telefono: clinica.telefono,
        email: clinica.email || '',
        admin_id: clinica.admin_id || '',
        logo_url: clinica.logo_url || '',
        activo: !!clinica.activo
      });
    } catch (err) {
      console.error('Error al cargar la clínica:', err);
      setError('Error al cargar los datos de la clínica');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdministradores = async () => {
    try {
      const clinicaId = isEditMode ? id : null;
      const response = await clinicasService.getAdministradoresDisponibles(clinicaId);
      setAdministradores(response.data);
    } catch (err) {
      console.error('Error al cargar los administradores:', err);
      setError('Error al cargar la lista de administradores disponibles');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: checked
    }));
  };

  const validateForm = () => {
    if (!formData.nombre) {
      setError('El nombre de la clínica es obligatorio');
      return false;
    }
    if (!formData.direccion) {
      setError('La dirección es obligatoria');
      return false;
    }
    if (!formData.telefono) {
      setError('El teléfono es obligatorio');
      return false;
    }
    
    // Validación básica de email si está presente
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      setError('El formato del email no es válido');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      
      let response;
      if (isEditMode) {
        response = await clinicasService.updateClinica(id, formData);
        setSuccess('Clínica actualizada correctamente');
      } else {
        response = await clinicasService.createClinica(formData);
        setSuccess('Clínica creada correctamente');
      }
      
      // Redirigir después de un breve tiempo
      setTimeout(() => {
        navigate('/clinicas');
      }, 1500);
    } catch (err) {
      console.error('Error al guardar la clínica:', err);
      setError('Error al guardar los datos. Por favor, inténtelo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/clinicas');
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
      <Typography variant="h4" component="h1" gutterBottom>
        {isEditMode ? 'Editar Clínica' : 'Nueva Clínica'}
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
      
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="nombre"
                label="Nombre de la Clínica"
                value={formData.nombre}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="telefono"
                label="Teléfono"
                value={formData.telefono}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="direccion"
                label="Dirección"
                value={formData.direccion}
                onChange={handleChange}
                fullWidth
                required
                multiline
                rows={2}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="logo_url"
                label="URL del Logo"
                value={formData.logo_url}
                onChange={handleChange}
                fullWidth
                placeholder="https://ejemplo.com/logo.png"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Administrador</InputLabel>
                <Select
                  name="admin_id"
                  value={formData.admin_id}
                  onChange={handleChange}
                  label="Administrador"
                >
                  <MenuItem value="">
                    <em>No asignado</em>
                  </MenuItem>
                  {administradores.map(admin => (
                    <MenuItem key={admin.id} value={admin.id}>
                      {admin.nombre} ({admin.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {isEditMode && (
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.activo}
                      onChange={handleSwitchChange}
                      name="activo"
                      color="primary"
                    />
                  }
                  label="Clínica activa"
                />
              </Grid>
            )}
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={handleCancel}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  disabled={submitting}
                >
                  {submitting ? <CircularProgress size={24} /> : 'Guardar'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default ClinicaForm; 