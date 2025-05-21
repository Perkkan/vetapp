import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Divider,
  Grid,
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
  History as HistoryIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Add as AddIcon,
  InsertDriveFile as FileIcon,
  Pets as PetsIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { historialesService } from '../../services/api';

const HistorialesList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [historiales, setHistoriales] = useState([]);
  const [filteredHistoriales, setFilteredHistoriales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [historialToDelete, setHistorialToDelete] = useState(null);

  useEffect(() => {
    fetchHistoriales();
  }, []);

  const fetchHistoriales = async () => {
    try {
      setLoading(true);
      const response = await historialesService.getAllHistoriales();
      setHistoriales(response.data);
      setFilteredHistoriales(response.data);
    } catch (err) {
      console.error('Error al cargar historiales:', err);
      setError('Error al cargar la lista de historiales');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value === '') {
      setFilteredHistoriales(historiales);
    } else {
      const filtered = historiales.filter((historial) => 
        historial.paciente_nombre?.toLowerCase().includes(value.toLowerCase()) ||
        historial.diagnostico?.toLowerCase().includes(value.toLowerCase()) ||
        historial.tratamiento?.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredHistoriales(filtered);
    }
  };

  const handleNewHistorial = () => {
    navigate('/historiales/nuevo');
  };

  const handleViewHistorial = (id) => {
    navigate(`/historiales/${id}`);
  };

  const handleEditHistorial = (id) => {
    navigate(`/historiales/editar/${id}`);
  };

  const openDeleteDialog = (historial) => {
    setHistorialToDelete(historial);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!historialToDelete) return;
    
    try {
      await historialesService.deleteHistorial(historialToDelete.id);
      // Actualizar la lista
      fetchHistoriales();
      setSuccess('Historial eliminado correctamente');
    } catch (err) {
      console.error('Error al eliminar historial:', err);
      setError('Error al eliminar el historial');
    }
    
    setDeleteDialogOpen(false);
    setHistorialToDelete(null);
  };

  const getChipColor = (estado) => {
    switch (estado) {
      case 'Completado':
        return 'success';
      case 'En seguimiento':
        return 'primary';
      case 'Pendiente':
        return 'warning';
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

  // Mostrar sólo los 3 historiales más recientes
  const historialesRecientes = filteredHistoriales.slice(0, 3);

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
        <Typography variant="h4" component="h1" gutterBottom>
          <HistoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Historiales Médicos
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleNewHistorial}
        >
          Nuevo Historial
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {filteredHistoriales.length > 0 && (
            <Grid container spacing={3} mb={3}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <FileIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6">Historiales Recientes</Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      {historialesRecientes.map(historial => (
                        <Grid item xs={12} md={4} key={historial.id}>
                          <Card variant="outlined">
                            <CardContent>
                              <Box display="flex" alignItems="center" mb={1}>
                                <PetsIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                                <Typography variant="subtitle1">{historial.paciente_nombre || 'Sin nombre'}</Typography>
                              </Box>
                              <Divider sx={{ my: 1 }} />
                              <Typography variant="body2"><strong>Fecha:</strong> {formatDate(historial.fecha)}</Typography>
                              <Typography variant="body2"><strong>Diagnóstico:</strong> {historial.diagnostico}</Typography>
                              <Typography variant="body2"><strong>Veterinario:</strong> {historial.veterinario_nombre || 'No asignado'}</Typography>
                              <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
                                <Tooltip title="Ver detalles">
                                  <IconButton 
                                    size="small" 
                                    color="primary"
                                    onClick={() => handleViewHistorial(historial.id)}
                                  >
                                    <VisibilityIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Editar">
                                  <IconButton 
                                    size="small" 
                                    color="secondary"
                                    onClick={() => handleEditHistorial(historial.id)}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
          
          <TextField
            fullWidth
            margin="normal"
            placeholder="Buscar historiales..."
            variant="outlined"
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3 }}
          />
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Paciente</TableCell>
                  <TableCell>Diagnóstico</TableCell>
                  <TableCell>Tratamiento</TableCell>
                  <TableCell>Veterinario</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredHistoriales.length > 0 ? (
                  filteredHistoriales.map((historial) => (
                    <TableRow key={historial.id}>
                      <TableCell>{historial.id}</TableCell>
                      <TableCell>{formatDate(historial.fecha)}</TableCell>
                      <TableCell>{historial.paciente_nombre || 'Sin nombre'}</TableCell>
                      <TableCell>{historial.diagnostico}</TableCell>
                      <TableCell>{historial.tratamiento}</TableCell>
                      <TableCell>{historial.veterinario_nombre || 'No asignado'}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="Ver detalles">
                          <IconButton 
                            color="info" 
                            size="small"
                            onClick={() => handleViewHistorial(historial.id)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton 
                            color="primary" 
                            size="small"
                            onClick={() => handleEditHistorial(historial.id)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton 
                            color="error" 
                            size="small"
                            onClick={() => openDeleteDialog(historial)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No se encontraron historiales médicos
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

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

export default HistorialesList; 