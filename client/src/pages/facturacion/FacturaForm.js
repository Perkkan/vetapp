import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  TextField,
  MenuItem,
  IconButton,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
  Alert,
  CircularProgress,
  Autocomplete,
  Snackbar
} from '@mui/material';
import {
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { facturacionService, inventarioService, propietariosService } from '../../services/api';

const facturaEnBlanco = {
  id: '',
  fecha: new Date().toISOString().split('T')[0],
  propietario_id: '',
  cliente: '',
  nif: '',
  direccion: '',
  email: '',
  estado: 'Pendiente',
  forma_pago: 'Efectivo',
  items: [],
  subtotal: 0,
  iva: 0,
  total: 0
};

const FacturaForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isSuperAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [factura, setFactura] = useState(facturaEnBlanco);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [propietarios, setPropietarios] = useState([]);
  const [productos, setProductos] = useState([]);
  const isEditing = !!id;

  // Comprobar si el usuario es administrador
  useEffect(() => {
    if (!isAdmin && !isSuperAdmin) {
      navigate('/forbidden');
    }
  }, [isAdmin, isSuperAdmin, navigate]);

  // Cargar propietarios y productos
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        
        // Cargar propietarios
        const propResponse = await propietariosService.getAllPropietarios();
        setPropietarios(propResponse.data);
        
        // Cargar productos
        const prodResponse = await inventarioService.getAllProductos();
        const productosConIva = prodResponse.data.map(prod => ({
          ...prod,
          precio: prod.precio_unitario,
          iva: 21 // Por defecto IVA del 21%
        }));
        setProductos(productosConIva);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar los datos necesarios');
      } finally {
        setLoadingData(false);
      }
    };
    
    fetchData();
  }, []);

  // Cargar datos de la factura si estamos editando
  useEffect(() => {
    if (isEditing) {
      setLoadingData(true);
      facturacionService.getFacturaById(id)
        .then(response => {
          const facturaData = response.data;
          // Aseguramos que tenga el formato correcto
          setFactura({
            ...facturaData,
            propietario_id: facturaData.propietario_id || '',
            cliente: facturaData.cliente || '',
            nif: facturaData.nif || '',
            items: facturaData.items || []
          });
        })
        .catch(err => {
          console.error('Error al cargar factura:', err);
          setError('Error al cargar la factura');
        })
        .finally(() => {
          setLoadingData(false);
        });
    } else {
      // Generar un nuevo número de factura
      const fechaActual = new Date();
      const año = fechaActual.getFullYear();
      const mes = String(fechaActual.getMonth() + 1).padStart(2, '0');
      const numeroSecuencial = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const nuevoId = `F${año}${mes}-${numeroSecuencial}`;
      
      setFactura({
        ...facturaEnBlanco,
        id: nuevoId
      });
    }
  }, [isEditing, id]);

  // Recalcular totales cuando cambian los items
  useEffect(() => {
    if (factura.items && factura.items.length > 0) {
      const subtotal = factura.items.reduce((total, item) => total + item.subtotal, 0);
      const importeIva = factura.items.reduce((total, item) => total + item.importeIva, 0);
      const total = factura.items.reduce((total, item) => total + item.total, 0);
      
      setFactura(prev => ({
        ...prev,
        subtotal,
        iva: importeIva,
        total
      }));
    } else {
      setFactura(prev => ({
        ...prev,
        subtotal: 0,
        iva: 0,
        total: 0
      }));
    }
  }, [factura.items]);

  const handleClienteChange = (event, newValue) => {
    if (newValue) {
      setFactura({
        ...factura,
        propietario_id: newValue.id,
        cliente: newValue.nombre,
        nif: newValue.nif,
        email: newValue.email
      });
    } else {
      setFactura({
        ...factura,
        propietario_id: '',
        cliente: '',
        nif: '',
        email: ''
      });
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFactura({
      ...factura,
      [name]: value
    });
  };

  const handleProductSelect = (event, newValue) => {
    setSelectedProduct(newValue);
  };

  const handleCantidadChange = (event) => {
    setCantidad(parseInt(event.target.value) || 1);
  };

  const handleAddItem = () => {
    if (!selectedProduct) return;

    const subtotal = selectedProduct.precio * cantidad;
    const importeIva = subtotal * (selectedProduct.iva / 100);
    const total = subtotal + importeIva;

    const newItem = {
      id: Date.now(), // Id temporal
      producto_id: selectedProduct.id,
      concepto: selectedProduct.nombre,
      cantidad: cantidad,
      precio_unitario: selectedProduct.precio,
      iva: selectedProduct.iva,
      subtotal: subtotal,
      importeIva: importeIva,
      total: total
    };

    setFactura({
      ...factura,
      items: [...factura.items, newItem]
    });

    // Limpiar selección
    setSelectedProduct(null);
    setCantidad(1);
  };

  const handleRemoveItem = (itemId) => {
    setFactura({
      ...factura,
      items: factura.items.filter(item => item.id !== itemId)
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Validar que haya al menos un ítem
      if (!factura.items || factura.items.length === 0) {
        setError('Debe agregar al menos un ítem a la factura');
        setLoading(false);
        return;
      }
      
      // Validar que haya un cliente
      if (!factura.propietario_id) {
        setError('Debe seleccionar un propietario');
        setLoading(false);
        return;
      }
      
      // Preparar los datos para enviar al servidor
      const facturaData = {
        id: factura.id,
        fecha: factura.fecha,
        propietario_id: factura.propietario_id,
        subtotal: factura.subtotal,
        iva: factura.iva,
        total: factura.total,
        estado: factura.estado,
        forma_pago: factura.forma_pago,
        items: factura.items.map(item => ({
          concepto: item.concepto,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario,
          iva: item.iva,
          subtotal: item.subtotal
        }))
      };
      
      if (isEditing) {
        await facturacionService.updateFactura(id, facturaData);
        setSuccess('Factura actualizada correctamente');
      } else {
        await facturacionService.createFactura(facturaData);
        setSuccess('Factura creada correctamente');
      }
      
      // Redirigir después de 1 segundo
      setTimeout(() => {
        navigate('/facturas');
      }, 1000);
    } catch (err) {
      console.error('Error al guardar factura:', err);
      setError(err.response?.data?.message || 'Error al guardar la factura');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/facturas');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  if (loadingData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
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
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={handleCancel} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            {isEditing ? 'Editar Factura' : 'Nueva Factura'}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Datos de la factura */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nº Factura"
              name="id"
              value={factura.id}
              disabled
              sx={{ mb: 2 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Fecha"
              name="fecha"
              type="date"
              value={factura.fecha}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
          </Grid>

          {/* Datos del cliente */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Datos del Cliente
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Autocomplete
              options={propietarios}
              getOptionLabel={(option) => option.nombre || ''}
              onChange={handleClienteChange}
              renderInput={(params) => <TextField {...params} label="Seleccionar Cliente" fullWidth />}
              sx={{ mb: 2 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="NIF/CIF"
              value={factura.nif || ''}
              disabled
              sx={{ mb: 2 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Dirección"
              name="direccion"
              value={factura.direccion || ''}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email"
              value={factura.email || ''}
              disabled
              sx={{ mb: 2 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="Estado"
              name="estado"
              value={factura.estado}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            >
              <MenuItem value="Pendiente">Pendiente</MenuItem>
              <MenuItem value="Pagada">Pagada</MenuItem>
              <MenuItem value="Cancelada">Cancelada</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="Forma de Pago"
              name="forma_pago"
              value={factura.forma_pago}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            >
              <MenuItem value="Efectivo">Efectivo</MenuItem>
              <MenuItem value="Tarjeta">Tarjeta</MenuItem>
              <MenuItem value="Transferencia">Transferencia</MenuItem>
            </TextField>
          </Grid>

          {/* Líneas de factura */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Líneas de Factura
            </Typography>
          </Grid>

          {/* Agregar nueva línea */}
          <Grid item xs={12} md={5}>
            <Autocomplete
              value={selectedProduct}
              onChange={handleProductSelect}
              options={productos}
              getOptionLabel={(option) => option.nombre || ''}
              renderInput={(params) => <TextField {...params} label="Seleccionar Producto/Servicio" fullWidth />}
              sx={{ mb: 2 }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              type="number"
              label="Cantidad"
              value={cantidad}
              onChange={handleCantidadChange}
              InputProps={{ inputProps: { min: 1 } }}
              sx={{ mb: 2 }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddItem}
              disabled={!selectedProduct}
              sx={{ mb: 2, height: '56px' }}
              fullWidth
            >
              Agregar Línea
            </Button>
          </Grid>

          {/* Tabla de líneas */}
          <Grid item xs={12}>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Concepto</TableCell>
                    <TableCell align="right">Cantidad</TableCell>
                    <TableCell align="right">Precio Unitario</TableCell>
                    <TableCell align="right">IVA</TableCell>
                    <TableCell align="right">Subtotal</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {factura.items.length > 0 ? (
                    factura.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.concepto}</TableCell>
                        <TableCell align="right">{item.cantidad}</TableCell>
                        <TableCell align="right">{formatCurrency(item.precio_unitario)}</TableCell>
                        <TableCell align="right">{item.iva}%</TableCell>
                        <TableCell align="right">{formatCurrency(item.subtotal)}</TableCell>
                        <TableCell align="right">{formatCurrency(item.total)}</TableCell>
                        <TableCell align="center">
                          <IconButton 
                            color="error" 
                            onClick={() => handleRemoveItem(item.id)}
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No hay líneas en la factura
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          {/* Totales */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', mt: 2 }}>
              <Typography variant="subtitle1">
                Subtotal: {formatCurrency(factura.subtotal)}
              </Typography>
              <Typography variant="subtitle1">
                IVA: {formatCurrency(factura.iva)}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Total: {formatCurrency(factura.total)}
              </Typography>
            </Box>
          </Grid>

          {/* Botones de acción */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="outlined"
                onClick={handleCancel}
                sx={{ mr: 2 }}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <CircularProgress size={24} sx={{ mr: 1 }} color="inherit" />
                    {isEditing ? 'Actualizando...' : 'Guardando...'}
                  </>
                ) : (
                  isEditing ? 'Actualizar Factura' : 'Guardar Factura'
                )}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default FacturaForm; 