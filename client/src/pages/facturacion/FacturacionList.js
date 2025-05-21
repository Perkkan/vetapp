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
  CircularProgress,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  Search as SearchIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { facturacionService } from '../../services/api';

const FacturacionList = () => {
  const navigate = useNavigate();
  const { currentUser, isAdmin, isSuperAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [facturasList, setFacturasList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Comprobar si el usuario es administrador
  useEffect(() => {
    if (!isAdmin && !isSuperAdmin) {
      navigate('/forbidden');
    }
  }, [isAdmin, isSuperAdmin, navigate]);

  // Cargar facturas desde la API
  useEffect(() => {
    const fetchFacturas = async () => {
      try {
        setLoading(true);
        const response = await facturacionService.getAllFacturas();
        setFacturasList(response.data);
        setError(null);
      } catch (err) {
        console.error('Error al cargar las facturas:', err);
        setError('Error al cargar los datos de facturación. Por favor, intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchFacturas();
  }, []);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredFacturas = facturasList.filter(factura => 
    factura.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    factura.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (factura.nif && factura.nif.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleNewFactura = () => {
    navigate('/facturacion/nueva');
  };

  const handleEditFactura = (id) => {
    navigate(`/facturacion/editar/${id}`);
  };

  const handleDeleteFactura = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta factura?')) {
      try {
        await facturacionService.deleteFactura(id);
        setFacturasList(facturasList.filter(factura => factura.id !== id));
      } catch (err) {
        console.error('Error al eliminar la factura:', err);
        setError('Error al eliminar la factura. Por favor, intente nuevamente.');
      }
    }
  };

  const handleViewFactura = (id) => {
    navigate(`/facturacion/${id}`);
  };

  const handlePrintFactura = (id) => {
    // Redirigimos a la vista detalle que tiene la funcionalidad de impresión
    navigate(`/facturacion/${id}?print=true`);
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Pagada':
        return 'success';
      case 'Pendiente':
        return 'warning';
      case 'Anulada':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(amount);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Facturación
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleNewFactura}
        >
          Nueva Factura
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          label="Buscar facturas"
          placeholder="Buscar por número, cliente o NIF"
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
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
                <TableCell>Número</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>NIF/CIF</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredFacturas.length > 0 ? (
                filteredFacturas.map((factura) => (
                  <TableRow key={factura.id}>
                    <TableCell>{factura.id}</TableCell>
                    <TableCell>
                      {format(new Date(factura.fecha), 'dd/MM/yyyy', { locale: es })}
                    </TableCell>
                    <TableCell>{factura.cliente}</TableCell>
                    <TableCell>{factura.nif}</TableCell>
                    <TableCell align="right">{formatCurrency(factura.total)}</TableCell>
                    <TableCell>
                      <Chip
                        label={factura.estado}
                        color={getEstadoColor(factura.estado)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <IconButton 
                          onClick={() => handleViewFactura(factura.id)}
                          title="Ver factura"
                          size="small"
                        >
                          <PdfIcon />
                        </IconButton>
                        <IconButton 
                          onClick={() => handlePrintFactura(factura.id)}
                          title="Imprimir factura"
                          size="small"
                        >
                          <PrintIcon />
                        </IconButton>
                        <IconButton 
                          onClick={() => handleEditFactura(factura.id)}
                          title="Editar factura"
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          onClick={() => handleDeleteFactura(factura.id)}
                          title="Eliminar factura"
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No se encontraron facturas
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

export default FacturacionList; 