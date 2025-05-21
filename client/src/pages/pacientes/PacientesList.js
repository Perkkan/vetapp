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
  Pets as PetsIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { pacientesService } from '../../services/api';

const PacientesList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [pacientes, setPacientes] = useState([]);
  const [filteredPacientes, setFilteredPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pacienteToDelete, setPacienteToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPacientes();
  }, []);

  const fetchPacientes = async () => {
    try {
      setLoading(true);
      const response = await pacientesService.getAllPacientes();
      setPacientes(response.data);
      setFilteredPacientes(response.data);
    } catch (err) {
      console.error('Error al cargar pacientes:', err);
      setError('Error al cargar la lista de pacientes');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value === '') {
      setFilteredPacientes(pacientes);
    } else {
      const filtered = pacientes.filter((paciente) => 
        paciente.nombre?.toLowerCase().includes(value.toLowerCase()) ||
        paciente.propietario_nombre?.toLowerCase().includes(value.toLowerCase()) ||
        paciente.especie?.toLowerCase().includes(value.toLowerCase()) ||
        paciente.raza?.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredPacientes(filtered);
    }
  };

  const handleDelete = async () => {
    if (!pacienteToDelete) return;
    
    try {
      await pacientesService.deletePaciente(pacienteToDelete.id);
      // Actualizar la lista
      fetchPacientes();
      setSuccess('Paciente eliminado correctamente');
    } catch (err) {
      console.error('Error al eliminar paciente:', err);
      setError('Error al eliminar el paciente');
    }
    
    setDeleteDialogOpen(false);
    setPacienteToDelete(null);
  };

  const openDeleteDialog = (paciente) => {
    setPacienteToDelete(paciente);
    setDeleteDialogOpen(true);
  };

  const calculateAge = (fechaNacimiento) => {
    if (!fechaNacimiento) return 'N/D';
    
    const birthDate = new Date(fechaNacimiento);
    const today = new Date();
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Activo':
        return 'success';
      case 'Inactivo':
        return 'default';
      case 'En tratamiento':
        return 'warning';
      default:
        return 'default';
    }
  };

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
          <PetsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Pacientes
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/pacientes/nuevo')}
        >
          Nuevo Paciente
        </Button>
      </Box>
      
      <TextField
        fullWidth
        margin="normal"
        placeholder="Buscar paciente..."
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
      
      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Especie</TableCell>
                <TableCell>Raza</TableCell>
                <TableCell>Edad</TableCell>
                <TableCell>Propietario</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPacientes.length > 0 ? (
                filteredPacientes.map((paciente) => (
                  <TableRow key={paciente.id}>
                    <TableCell>{paciente.id}</TableCell>
                    <TableCell>{paciente.nombre}</TableCell>
                    <TableCell>{paciente.especie}</TableCell>
                    <TableCell>{paciente.raza}</TableCell>
                    <TableCell>{calculateAge(paciente.fecha_nacimiento)} años</TableCell>
                    <TableCell>{paciente.propietario_nombre}</TableCell>
                    <TableCell>
                      <Chip 
                        label={paciente.estado || 'Activo'} 
                        color={getEstadoColor(paciente.estado)} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Ver detalles">
                        <IconButton 
                          color="info" 
                          size="small"
                          onClick={() => navigate(`/pacientes/${paciente.id}`)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton 
                          color="primary" 
                          size="small"
                          onClick={() => navigate(`/pacientes/editar/${paciente.id}`)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton 
                          color="error" 
                          size="small"
                          onClick={() => openDeleteDialog(paciente)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No se encontraron pacientes
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Diálogo de confirmación para eliminar */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro de que desea eliminar al paciente "{pacienteToDelete?.nombre}"? Esta acción no se puede deshacer.
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

export default PacientesList; 