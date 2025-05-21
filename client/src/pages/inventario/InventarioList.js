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
import { inventarioService } from '../../services/api';

const InventarioList = () => {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        console.log('Iniciando petición a inventario...');
        setLoading(true);
        console.log('URL API:', `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/inventario`);
        const response = await inventarioService.getAllProductos();
        console.log('Respuesta recibida:', response);
        setProductos(response.data);
        setError(null);
      } catch (err) {
        console.error('Error al cargar el inventario:', err);
        console.error('Detalles del error:', err.response ? err.response.data : 'No hay detalles de respuesta');
        console.error('Estado de la respuesta:', err.response ? err.response.status : 'No hay estado de respuesta');
        setError('Error al cargar los datos del inventario. Por favor, intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

  const handleEdit = (id) => {
    navigate(`/inventario/editar/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar este producto?')) {
      try {
        await inventarioService.deleteProducto(id);
        setProductos(productos.filter(producto => producto.id !== id));
      } catch (err) {
        console.error('Error al eliminar el producto:', err);
        setError('Error al eliminar el producto. Por favor, intente nuevamente.');
      }
    }
  };

  const handleNew = () => {
    navigate('/inventario/nuevo');
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Disponible':
        return 'success';
      case 'Bajo Stock':
        return 'warning';
      case 'Agotado':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Inventario
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleNew}
        >
          Nuevo Producto
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
                <TableCell>Categoría</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Precio</TableCell>
                <TableCell>Stock Mínimo</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {productos.length > 0 ? (
                productos.map((producto) => (
                  <TableRow key={producto.id}>
                    <TableCell>{producto.nombre}</TableCell>
                    <TableCell>{producto.categoria}</TableCell>
                    <TableCell>{producto.stock}</TableCell>
                    <TableCell>${producto.precio.toFixed(2)}</TableCell>
                    <TableCell>{producto.stockMinimo}</TableCell>
                    <TableCell>
                      <Chip
                        label={producto.estado}
                        color={getEstadoColor(producto.estado)}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEdit(producto.id)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(producto.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No hay productos en el inventario
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

export default InventarioList; 