import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Print as PrintIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useReactToPrint } from 'react-to-print';
import { facturacionService } from '../../services/api';

const FacturaDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, isSuperAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [factura, setFactura] = useState(null);
  const componentRef = useRef();
  
  // Detectar si se debe imprimir automáticamente
  const shouldPrint = new URLSearchParams(location.search).get('print') === 'true';

  // Comprobar si el usuario es administrador
  useEffect(() => {
    if (!isAdmin && !isSuperAdmin) {
      navigate('/forbidden');
    }
  }, [isAdmin, isSuperAdmin, navigate]);

  // Cargar datos de la factura desde la API
  useEffect(() => {
    const fetchFactura = async () => {
      try {
        setLoading(true);
        const response = await facturacionService.getFacturaById(id);
        setFactura(response.data);
        setError(null);
      } catch (err) {
        console.error('Error al cargar la factura:', err);
        setError('Error al cargar los datos de la factura. Por favor, intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchFactura();
  }, [id]);

  // Configurar la impresión
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Factura-${id}`,
    onAfterPrint: () => {
      // Si vinimos desde el botón de imprimir, volvemos a la lista
      if (shouldPrint) {
        navigate('/facturacion');
      }
    }
  });

  // Imprimir automáticamente si es necesario
  useEffect(() => {
    if (!loading && !error && factura && shouldPrint) {
      // Dar tiempo al componente para renderizarse completamente
      const timer = setTimeout(() => {
        handlePrint();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loading, error, factura, shouldPrint, handlePrint]);

  const handleExportPdf = () => {
    // Esta funcionalidad se implementaría con una biblioteca como jsPDF
    // Por ahora, simplemente usamos la misma función que para imprimir
    handlePrint();
  };

  const handleBack = () => {
    navigate('/facturacion');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(amount);
  };

  const formatDate = (date) => {
    return format(new Date(date), 'dd/MM/yyyy', { locale: es });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mt: 2 }}>
          Volver
        </Button>
      </Box>
    );
  }

  if (!factura) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">No se encontró la factura solicitada.</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mt: 2 }}>
          Volver
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={handleBack} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Factura {factura.id}
          </Typography>
        </Box>
        <Box>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            sx={{ mr: 1 }}
          >
            Imprimir
          </Button>
          <Button
            variant="contained"
            startIcon={<PdfIcon />}
            onClick={handleExportPdf}
          >
            Exportar PDF
          </Button>
        </Box>
      </Box>

      {/* Área imprimible */}
      <Paper sx={{ p: 4, mb: 3 }} ref={componentRef}>
        <Box sx={{ mb: 3 }}>
          {/* Cabecera de la factura */}
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="h5" component="div" gutterBottom>
                  {factura.clinica.nombre}
                </Typography>
                <Typography variant="body2" component="div">
                  {factura.clinica.direccion}
                </Typography>
                <Typography variant="body2" component="div">
                  CIF: {factura.clinica.cif}
                </Typography>
                <Typography variant="body2" component="div">
                  Tel: {factura.clinica.telefono}
                </Typography>
                <Typography variant="body2" component="div">
                  Email: {factura.clinica.email}
                </Typography>
                <Typography variant="body2" component="div">
                  Web: {factura.clinica.web}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h5" component="div" gutterBottom sx={{ color: 'primary.main' }}>
                  FACTURA
                </Typography>
                <Typography variant="body1" component="div">
                  <strong>Número:</strong> {factura.id}
                </Typography>
                <Typography variant="body1" component="div">
                  <strong>Fecha:</strong> {formatDate(factura.fecha)}
                </Typography>
                <Typography variant="body1" component="div">
                  <strong>Vencimiento:</strong> {formatDate(factura.fechaVencimiento)}
                </Typography>
                <Typography variant="body1" component="div" sx={{ mt: 1 }}>
                  <strong>Estado:</strong> {factura.estado}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Datos del cliente */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" component="div" gutterBottom>
            Datos del cliente
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body1" component="div">
                <strong>Nombre:</strong> {factura.cliente}
              </Typography>
              <Typography variant="body1" component="div">
                <strong>NIF/CIF:</strong> {factura.nif}
              </Typography>
              <Typography variant="body1" component="div">
                <strong>Dirección:</strong> {factura.direccion}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body1" component="div">
                <strong>Email:</strong> {factura.email}
              </Typography>
              <Typography variant="body1" component="div">
                <strong>Teléfono:</strong> {factura.telefono}
              </Typography>
              <Typography variant="body1" component="div">
                <strong>Forma de pago:</strong> {factura.formaPago}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Detalle de productos */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" component="div" gutterBottom>
            Detalle de productos y servicios
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Concepto</TableCell>
                  <TableCell align="right">Cantidad</TableCell>
                  <TableCell align="right">Precio Unit.</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                  <TableCell align="right">IVA %</TableCell>
                  <TableCell align="right">IVA</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {factura.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.concepto}</TableCell>
                    <TableCell align="right">{item.cantidad}</TableCell>
                    <TableCell align="right">{formatCurrency(item.precioUnitario)}</TableCell>
                    <TableCell align="right">{formatCurrency(item.subtotal)}</TableCell>
                    <TableCell align="right">{item.iva}%</TableCell>
                    <TableCell align="right">{formatCurrency(item.importeIva)}</TableCell>
                    <TableCell align="right">{formatCurrency(item.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Totales */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <Grid container justifyContent="flex-end">
            <Grid item xs={12} md={5}>
              <Box sx={{ border: '1px solid #ddd', p: 2, borderRadius: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1">Subtotal:</Typography>
                  <Typography variant="body1">{formatCurrency(factura.subtotal)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1">IVA (21%):</Typography>
                  <Typography variant="body1">{formatCurrency(factura.iva)}</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6">Total:</Typography>
                  <Typography variant="h6">{formatCurrency(factura.total)}</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Pie de página */}
        <Divider sx={{ my: 3 }} />
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Esta factura ha sido emitida conforme a la normativa fiscal española vigente.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Todos los importes son en euros (€).
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default FacturaDetalle; 