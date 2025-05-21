import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip,
  CircularProgress,
  Alert,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Search as SearchIcon,
  Login as LoginIcon
} from '@mui/icons-material';
import { clinicasService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const ClinicasList = () => {
  const navigate = useNavigate();
  const { cambiarClinica } = useAuth();
  const [clinicas, setClinicas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [clinicaToDelete, setClinicaToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClinicas, setFilteredClinicas] = useState([]);

  useEffect(() => {
    fetchClinicas();
  }, []);

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredClinicas(clinicas);
    } else {
      const filtered = clinicas.filter(
        clinica => 
          clinica.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          clinica.direccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
          clinica.admin_nombre?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredClinicas(filtered);
    }
  }, [searchTerm, clinicas]);

  const fetchClinicas = async () => {
    try {
      setLoading(true);
      const response = await clinicasService.getAllClinicas();
      setClinicas(response.data);
      setFilteredClinicas(response.data);
    } catch (err) {
      console.error('Error al cargar las clínicas:', err);
      setError('No se pudieron cargar las clínicas. Por favor, inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCreateClinica = () => {
    navigate('/clinicas/nueva');
  };

  const handleEditClinica = (id) => {
    navigate(`/clinicas/editar/${id}`);
  };

  const handleDeleteClick = (clinica) => {
    setClinicaToDelete(clinica);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await clinicasService.deleteClinica(clinicaToDelete.id);
      setDeleteConfirmOpen(false);
      setClinicaToDelete(null);
      fetchClinicas();
    } catch (err) {
      console.error('Error al eliminar la clínica:', err);
      setError('Error al eliminar la clínica');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setClinicaToDelete(null);
  };

  const handleChangeClinica = async (clinicaId) => {
    const success = await cambiarClinica(clinicaId);
    if (success) {
      navigate('/dashboard');
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  if (loading && clinicas.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Gestión de Clínicas
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateClinica}
        >
          Nueva Clínica
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box p={2}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Buscar por nombre, dirección o administrador..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="tabla de clínicas">
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Dirección</TableCell>
                <TableCell>Teléfono</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Administrador</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredClinicas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No hay clínicas disponibles
                  </TableCell>
                </TableRow>
              ) : (
                filteredClinicas
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((clinica) => (
                    <TableRow key={clinica.id}>
                      <TableCell>{clinica.nombre}</TableCell>
                      <TableCell>{clinica.direccion}</TableCell>
                      <TableCell>{clinica.telefono}</TableCell>
                      <TableCell>{clinica.email || 'N/A'}</TableCell>
                      <TableCell>{clinica.admin_nombre || 'Sin asignar'}</TableCell>
                      <TableCell>
                        {clinica.activo ? (
                          <Chip 
                            icon={<ActiveIcon />} 
                            label="Activa" 
                            color="success" 
                            size="small" 
                          />
                        ) : (
                          <Chip 
                            icon={<InactiveIcon />} 
                            label="Inactiva" 
                            color="error" 
                            size="small" 
                          />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Editar">
                          <IconButton onClick={() => handleEditClinica(clinica.id)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton onClick={() => handleDeleteClick(clinica)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Acceder como esta clínica">
                          <IconButton 
                            color="primary"
                            onClick={() => handleChangeClinica(clinica.id)}
                            disabled={!clinica.activo}
                          >
                            <LoginIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredClinicas.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
        />
      </Paper>

      {/* Diálogo de confirmación de eliminación */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirmar eliminación
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            ¿Está seguro de que desea eliminar la clínica "{clinicaToDelete?.nombre}"? 
            Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClinicasList; 