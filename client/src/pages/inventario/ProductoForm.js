import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { inventarioService } from '../../services/api';

const ProductoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    categoria: '',
    cantidad: 0,
    precio_unitario: 0,
    stock_minimo: 0,
    descripcion: ''
  });
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (id) {
      setLoadingData(true);
      inventarioService.getProductoById(id)
        .then(response => {
          setFormData(response.data);
        })
        .catch(err => {
          console.error('Error al cargar producto:', err);
          setError('Error al cargar los datos del producto');
        })
        .finally(() => {
          setLoadingData(false);
        });
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (id) {
        // Actualizar producto existente
        await inventarioService.updateProducto(id, formData);
        setSuccess('Producto actualizado correctamente');
      } else {
        // Crear nuevo producto
        await inventarioService.createProducto(formData);
        setSuccess('Producto creado correctamente');
      }
      
      // Redirigir después de 1 segundo para dar tiempo a ver el mensaje
      setTimeout(() => {
        navigate('/inventario');
      }, 1000);
    } catch (err) {
      console.error('Error al guardar producto:', err);
      setError(err.response?.data?.message || 'Error al guardar los datos');
    } finally {
      setLoading(false);
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
        <Typography variant="h4" component="h1" gutterBottom>
          {id ? 'Editar Producto' : 'Nuevo Producto'}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre"
                name="nombre"
                value={formData.nombre || ''}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Categoría"
                name="categoria"
                value={formData.categoria || ''}
                onChange={handleChange}
                required
              >
                <MenuItem value="Vacunas">Vacunas</MenuItem>
                <MenuItem value="Medicamentos">Medicamentos</MenuItem>
                <MenuItem value="Alimentos">Alimentos</MenuItem>
                <MenuItem value="Accesorios">Accesorios</MenuItem>
                <MenuItem value="Otros">Otros</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cantidad"
                name="cantidad"
                type="number"
                value={formData.cantidad || 0}
                onChange={handleChange}
                required
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Precio Unitario"
                name="precio_unitario"
                type="number"
                value={formData.precio_unitario || 0}
                onChange={handleChange}
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Stock Mínimo"
                name="stock_minimo"
                type="number"
                value={formData.stock_minimo || 0}
                onChange={handleChange}
                required
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Descripción"
                name="descripcion"
                value={formData.descripcion || ''}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/inventario')}
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
                      <CircularProgress size={24} sx={{ mr: 1 }} />
                      {id ? 'Actualizando...' : 'Creando...'}
                    </>
                  ) : (
                    id ? 'Actualizar' : 'Crear'
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

export default ProductoForm; 