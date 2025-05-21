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

const CitasList = () => {
  const navigate = useNavigate();
  const [citas, setCitas] = useState([]);

  useEffect(() => {
    // TODO: Implementar la llamada a la API para obtener las citas
    // Por ahora usamos datos de ejemplo
    setCitas([
      {
        id: 1,
        paciente: 'Max',
        propietario: 'Juan Pérez',
        fecha: '2024-03-20',
        hora: '10:00',
        tipo: 'Paseo',
        estado: 'Pendiente',
        notas: 'Paciente requiere paseo corto'
      }
    ]);
  }, []);

  const handleView = (id) => {
    navigate(`/cuidador/citas/${id}`);
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Pendiente':
        return 'warning';
      case 'En Proceso':
        return 'info';
      case 'Completada':
        return 'success';
      case 'Cancelada':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Mis Citas
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Paciente</TableCell>
              <TableCell>Propietario</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Hora</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Notas</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {citas.map((cita) => (
              <TableRow key={cita.id}>
                <TableCell>{cita.paciente}</TableCell>
                <TableCell>{cita.propietario}</TableCell>
                <TableCell>{cita.fecha}</TableCell>
                <TableCell>{cita.hora}</TableCell>
                <TableCell>{cita.tipo}</TableCell>
                <TableCell>
                  <Chip
                    label={cita.estado}
                    color={getEstadoColor(cita.estado)}
                  />
                </TableCell>
                <TableCell>{cita.notas}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleView(cita.id)}>
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

export default CitasList; 