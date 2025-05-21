import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { propietariosService } from '../../services/api';

const PropietariosList = () => {
  const navigate = useNavigate();
  const [propietarios, setPropietarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPropietarios = async () => {
      try {
        console.log('Iniciando petición a propietarios...');
        setLoading(true);
        console.log('URL API:', `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/propietarios`);
        const response = await propietariosService.getAllPropietarios();
        console.log('Respuesta recibida:', response);
        setPropietarios(response.data);
        setError(null);
      } catch (err) {
        console.error('Error al cargar propietarios:', err);
        console.error('Detalles del error:', err.response ? err.response.data : 'No hay detalles de respuesta');
        console.error('Estado de la respuesta:', err.response ? err.response.status : 'No hay estado de respuesta');
        setError('Error al cargar los datos de propietarios. Por favor, intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchPropietarios();
  }, []);

  const handleEdit = (id) => {
    navigate(`/propietarios/editar/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar este propietario?')) {
      try {
        await propietariosService.deletePropietario(id);
        setPropietarios(propietarios.filter(propietario => propietario.id !== id));
      } catch (err) {
        console.error('Error al eliminar el propietario:', err);
        setError('Error al eliminar el propietario. Por favor, intente nuevamente.');
      }
    }
  };

  const handleNew = () => {
    navigate('/propietarios/nuevo');
  };

  const handleView = (id) => {
    navigate(`/propietarios/${id}`);
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Activo':
        return 'success';
      case 'Inactivo':
        return 'error';
      case 'Pendiente':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Propietarios
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleNew}
        >
          Nuevo Propietario
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Teléfono</TableCell>
                <TableCell>Dirección</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Mascotas Registradas</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {propietarios.length > 0 ? (
                propietarios.map((propietario) => (
                  <TableRow key={propietario.id}>
                    <TableCell>{propietario.nombre}</TableCell>
                    <TableCell>{propietario.email}</TableCell>
                    <TableCell>{propietario.telefono}</TableCell>
                    <TableCell>{propietario.direccion}</TableCell>
                    <TableCell>
                      <Chip
                        label={propietario.estado}
                        color={getEstadoColor(propietario.estado)}
                      />
                    </TableCell>
                    <TableCell>{propietario.mascotasRegistradas}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleView(propietario.id)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(propietario.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No hay propietarios registrados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default PropietariosList; 