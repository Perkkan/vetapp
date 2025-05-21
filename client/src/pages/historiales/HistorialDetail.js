import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Pets as PetsIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  MedicalServices as MedicalIcon
} from '@mui/icons-material';
import { historialesService } from '../../services/api';

const HistorialDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [historial, setHistorial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchHistorial();
  }, []);

  const fetchHistorial = async () => {
    try {
      setLoading(true);
      const response = await historialesService.getHistorialById(id);
      setHistorial(response.data);
    } catch (err) {
      console.error('Error al cargar el historial:', err);
      setError('No se pudo cargar la información del historial médico');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/historiales/editar/${id}`);
  };

  const handleBack = () => {
    navigate('/historiales');
  };

  const openDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      await historialesService.deleteHistorial(id);
      setSuccess('Historial eliminado correctamente');
      // Redirigir después de un breve retraso
      setTimeout(() => {
        navigate('/historiales');
      }, 1500);
    } catch (err) {
      console.error('Error al eliminar el historial:', err);
      setError('Error al eliminar el historial médico');
    }
    setDeleteDialogOpen(false);
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
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!historial && !loading) {
    return (
      <Box p={3}>
        <Alert severity="error">
          No se ha encontrado el historial médico solicitado. 
          <Button color="inherit" onClick={handleBack} sx={{ ml: 2 }}>
            Volver a la lista
          </Button>
        </Alert>
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

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            sx={{ mr: 2 }}
          >
            Volver
          </Button>
          <Typography variant="h4" component="h1">
            Detalles del Historial Médico
          </Typography>
        </Box>
        
        <Box>
          <Tooltip title="Editar historial">
            <IconButton 
              color="primary" 
              onClick={handleEdit}
              sx={{ mr: 1 }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Eliminar historial">
            <IconButton 
              color="error" 
              onClick={openDeleteDialog}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <PetsIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Información del Paciente</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="subtitle1" fontWeight="bold">
                {historial.paciente_nombre || 'Sin nombre registrado'}
              </Typography>
              
              {historial.paciente_especie && historial.paciente_raza && (
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  {historial.paciente_especie} - {historial.paciente_raza}
                </Typography>
              )}
              
              {historial.propietario_nombre && (
                <Box mt={2}>
                  <Box display="flex" alignItems="center">
                    <PersonIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} />
                    <Typography variant="body2" color="text.secondary">
                      Propietario: {historial.propietario_nombre}
                    </Typography>
                  </Box>
                  
                  {historial.propietario_telefono && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Teléfono: {historial.propietario_telefono}
                    </Typography>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <MedicalIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Información de la Consulta</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <Box display="flex" alignItems="center" mb={1}>
                <CalendarIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} />
                <Typography variant="body2">
                  <strong>Fecha:</strong> {formatDate(historial.fecha)}
                </Typography>
              </Box>
              
              <Typography variant="body2" mb={1}>
                <strong>Veterinario:</strong> {historial.veterinario_nombre || 'No asignado'}
              </Typography>
              
              {historial.motivo_consulta && (
                <Box mb={2}>
                  <Typography variant="body2" fontWeight="bold">Motivo de consulta:</Typography>
                  <Typography variant="body2">{historial.motivo_consulta}</Typography>
                </Box>
              )}
              
              {historial.sintomas && (
                <Box>
                  <Typography variant="body2" fontWeight="bold">Síntomas:</Typography>
                  <Typography variant="body2">{historial.sintomas}</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent sx={{ height: '100%' }}>
              <Box display="flex" alignItems="center" mb={2}>
                <MedicalIcon sx={{ mr: 1, color: 'error.main' }} />
                <Typography variant="h6">Diagnóstico</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="body1" paragraph>
                {historial.diagnostico}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <MedicalIcon sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6">Tratamiento y Observaciones</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <Box mb={3}>
                <Typography variant="body2" fontWeight="bold" gutterBottom>
                  Tratamiento:
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="body1" whiteSpace="pre-line">
                    {historial.tratamiento}
                  </Typography>
                </Paper>
              </Box>
              
              {historial.observaciones && (
                <Box>
                  <Typography variant="body2" fontWeight="bold" gutterBottom>
                    Observaciones adicionales:
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography variant="body1" whiteSpace="pre-line">
                      {historial.observaciones}
                    </Typography>
                  </Paper>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Diálogo de confirmación para eliminar */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro de que desea eliminar este historial médico? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HistorialDetail; 