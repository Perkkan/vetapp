import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid,
  Box,
  CircularProgress
} from '@mui/material';
import { pacientesService, salaEsperaService } from '../../../services/api';

const AgregarPacienteDialog = ({ open, onClose, onPacienteAgregado }) => {
  const [pacientes, setPacientes] = useState([]);
  const [formData, setFormData] = useState({
    paciente_id: '',
    motivo: '',
    prioridad: 'normal'
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      fetchPacientes();
      resetForm();
    }
  }, [open]);

  const fetchPacientes = async () => {
    try {
      setLoading(true);
      const response = await pacientesService.getAllPacientes();
      setPacientes(response.data);
    } catch (err) {
      console.error('Error al cargar pacientes:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      paciente_id: '',
      motivo: '',
      prioridad: 'normal'
    });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error al cambiar el valor
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.paciente_id) {
      newErrors.paciente_id = 'Seleccione un paciente';
    }
    
    if (!formData.motivo) {
      newErrors.motivo = 'Ingrese el motivo de la consulta';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    try {
      setSubmitting(true);
      await salaEsperaService.agregarPacienteEspera(formData);
      onPacienteAgregado();
    } catch (err) {
      console.error('Error al agregar paciente a espera:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Agregar Paciente a Sala de Espera</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.paciente_id}>
                <InputLabel>Paciente</InputLabel>
                <Select
                  name="paciente_id"
                  value={formData.paciente_id}
                  onChange={handleChange}
                  disabled={loading}
                  label="Paciente"
                >
                  {loading ? (
                    <MenuItem disabled>Cargando pacientes...</MenuItem>
                  ) : (
                    pacientes.map(paciente => (
                      <MenuItem key={paciente.id} value={paciente.id}>
                        {paciente.nombre} - {paciente.especie} ({paciente.raza})
                      </MenuItem>
                    ))
                  )}
                </Select>
                {errors.paciente_id && <FormHelperText>{errors.paciente_id}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Motivo de consulta"
                name="motivo"
                value={formData.motivo}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                error={!!errors.motivo}
                helperText={errors.motivo}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Prioridad</InputLabel>
                <Select
                  name="prioridad"
                  value={formData.prioridad}
                  onChange={handleChange}
                  label="Prioridad"
                >
                  <MenuItem value="baja">Baja</MenuItem>
                  <MenuItem value="normal">Normal</MenuItem>
                  <MenuItem value="alta">Alta</MenuItem>
                  <MenuItem value="urgente">Urgente</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>Cancelar</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary" 
          disabled={submitting}
        >
          {submitting ? <CircularProgress size={24} /> : 'Agregar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AgregarPacienteDialog; 