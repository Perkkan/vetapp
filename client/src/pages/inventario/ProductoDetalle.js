import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Chip,
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';

const ProductoDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);

  useEffect(() => {
    // TODO: Implementar la llamada a la API para obtener los detalles del producto
    // Por ahora usamos datos de ejemplo
    setProducto({
      id: 1,
      nombre: 'Vacuna Triple Felina',
      categoria: 'Vacunas',
      stock: 50,
      precio: 150.00,
      stockMinimo: 10,
      estado: 'Disponible',
      descripcion: 'Vacuna para gatos contra enfermedades comunes'
    });
  }, [id]);

  if (!producto) {
    return <Typography>Cargando...</Typography>;
  }

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
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Detalles del Producto
          </Typography>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/inventario/editar/${id}`)}
          >
            Editar
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Nombre
            </Typography>
            <Typography variant="body1">{producto.nombre}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Categoría
            </Typography>
            <Typography variant="body1">{producto.categoria}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Stock
            </Typography>
            <Typography variant="body1">{producto.stock}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Precio
            </Typography>
            <Typography variant="body1">${producto.precio.toFixed(2)}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Stock Mínimo
            </Typography>
            <Typography variant="body1">{producto.stockMinimo}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Estado
            </Typography>
            <Chip
              label={producto.estado}
              color={getEstadoColor(producto.estado)}
              sx={{ mt: 1 }}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              Descripción
            </Typography>
            <Typography variant="body1">{producto.descripcion}</Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ProductoDetalle; 