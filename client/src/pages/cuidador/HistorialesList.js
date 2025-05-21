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
} from '@mui/material';
import { Visibility as VisibilityIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const HistorialesList = () => {
  const navigate = useNavigate();
  const [historiales, setHistoriales] = useState([]);

  useEffect(() => {
    // TODO: Implementar la llamada a la API para obtener los historiales
    // Por ahora usamos datos de ejemplo
    setHistoriales([
      {
        id: 1,
        paciente: 'Max',
        propietario: 'Juan Pérez',
        fecha: '2024-03-20',
        tipo: 'Paseo',
        estado: 'Completado',
        notas: 'Paciente disfrutó del paseo'
      }
    ]);
  }, []);

  const handleView = (id) => {
    navigate(`/cuidador/historiales/${id}`);
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Completado':
        return 'success';
      case 'En Proceso':
        return 'warning';
      case 'Pendiente':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Mis Historiales
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Paciente</TableCell>
              <TableCell>Propietario</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Notas</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {historiales.map((historial) => (
              <TableRow key={historial.id}>
                <TableCell>{historial.paciente}</TableCell>
                <TableCell>{historial.propietario}</TableCell>
                <TableCell>{historial.fecha}</TableCell>
                <TableCell>{historial.tipo}</TableCell>
                <TableCell>
                  <Chip
                    label={historial.estado}
                    color={getEstadoColor(historial.estado)}
                  />
                </TableCell>
                <TableCell>{historial.notas}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleView(historial.id)}>
                    <VisibilityIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default HistorialesList; 