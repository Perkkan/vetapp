import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  Event as EventIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Today as TodayIcon,
  Assignment as AssignmentIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';

const citasData = [
  {
    id: 1,
    paciente: 'Max',
    propietario: 'Juan Pérez',
    fecha: '2025-03-25',
    hora: '09:00',
    tipo: 'Consulta',
    veterinario: 'Dra. María Rodríguez',
    estado: 'Pendiente'
  },
  {
    id: 2,
    paciente: 'Luna',
    propietario: 'María Gómez',
    fecha: '2025-03-25',
    hora: '10:30',
    tipo: 'Vacunación',
    veterinario: 'Dr. Carlos Sánchez',
    estado: 'Completada'
  },
  {
    id: 3,
    paciente: 'Rocky',
    propietario: 'Pedro Rodríguez',
    fecha: '2025-03-26',
    hora: '11:15',
    tipo: 'Control',
    veterinario: 'Dra. María Rodríguez',
    estado: 'Pendiente'
  },
  {
    id: 4,
    paciente: 'Simba',
    propietario: 'Ana Martínez',
    fecha: '2025-03-26',
    hora: '16:00',
    tipo: 'Cirugía',
    veterinario: 'Dr. José López',
    estado: 'Pendiente'
  },
  {
    id: 5,
    paciente: 'Toby',
    propietario: 'Carlos López',
    fecha: '2025-03-27',
    hora: '09:30',
    tipo: 'Consulta',
    veterinario: 'Dra. Laura García',
    estado: 'Cancelada'
  }
];

const CitasList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [citas, setCitas] = useState(citasData);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    const filtered = citasData.filter((cita) => 
      cita.paciente.toLowerCase().includes(value.toLowerCase()) ||
      cita.propietario.toLowerCase().includes(value.toLowerCase()) ||
      cita.tipo.toLowerCase().includes(value.toLowerCase()) ||
      cita.veterinario.toLowerCase().includes(value.toLowerCase())
    );
    
    setCitas(filtered);
  };

  const getChipColor = (estado) => {
    switch (estado) {
      case 'Pendiente':
        return 'primary';
      case 'Completada':
        return 'success';
      case 'Cancelada':
        return 'error';
      default:
        return 'default';
    }
  };

  const citasHoy = citas.filter(cita => cita.fecha === '2025-03-25');
  const citasPendientes = citas.filter(cita => cita.estado === 'Pendiente');

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          <EventIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Gestión de Citas
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/citas/nueva')}
        >
          Nueva Cita
        </Button>
      </Box>

      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TodayIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Citas de Hoy</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {citasHoy.length > 0 ? (
                citasHoy.map(cita => (
                  <Box key={cita.id} mb={1} p={1} bgcolor="background.paper" borderRadius={1}>
                    <Typography variant="subtitle1">{cita.hora} - {cita.paciente}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {cita.tipo} - {cita.veterinario}
                    </Typography>
                    <Chip 
                      size="small" 
                      label={cita.estado} 
                      color={getChipColor(cita.estado)} 
                      sx={{ mt: 1 }} 
                    />
                  </Box>
                ))
              ) : (
                <Typography variant="body1" color="textSecondary" align="center" py={2}>
                  No hay citas programadas para hoy
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AssignmentIcon color="secondary" sx={{ mr: 1 }} />
                <Typography variant="h6">Próximas Citas</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {citasPendientes.length > 0 ? (
                citasPendientes.map(cita => (
                  <Box key={cita.id} mb={1} p={1} bgcolor="background.paper" borderRadius={1}>
                    <Typography variant="subtitle1">{cita.fecha} {cita.hora} - {cita.paciente}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {cita.tipo} - {cita.veterinario}
                    </Typography>
                    <Box display="flex" justifyContent="flex-end" mt={1}>
                      <Tooltip title="Completar">
                        <IconButton size="small" color="success">
                          <CheckIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Cancelar">
                        <IconButton size="small" color="error">
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                ))
              ) : (
                <Typography variant="body1" color="textSecondary" align="center" py={2}>
                  No hay citas pendientes
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <TextField
        fullWidth
        margin="normal"
        placeholder="Buscar cita..."
        variant="outlined"
        value={searchTerm}
        onChange={handleSearch}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Hora</TableCell>
              <TableCell>Paciente</TableCell>
              <TableCell>Propietario</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Veterinario</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {citas.map((cita) => (
              <TableRow key={cita.id}>
                <TableCell>{cita.id}</TableCell>
                <TableCell>{cita.fecha}</TableCell>
                <TableCell>{cita.hora}</TableCell>
                <TableCell>{cita.paciente}</TableCell>
                <TableCell>{cita.propietario}</TableCell>
                <TableCell>{cita.tipo}</TableCell>
                <TableCell>{cita.veterinario}</TableCell>
                <TableCell>
                  <Chip 
                    label={cita.estado} 
                    color={getChipColor(cita.estado)}
                    size="small" 
                  />
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Ver detalles">
                    <IconButton color="info" size="small">
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Editar">
                    <IconButton color="primary" size="small">
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton color="error" size="small">
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
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