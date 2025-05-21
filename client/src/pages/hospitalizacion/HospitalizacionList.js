import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  LocalHospital as HospitalIcon,
  Pets as PetsIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { salaEsperaService } from '../../services/api';

const HospitalizacionList = () => {
  const navigate = useNavigate();
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPacientes, setFilteredPacientes] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchPacientes();
    
    // Actualizar datos cada minuto
    const interval = setInterval(() => {
      fetchPacientes(false);
    }, 60000);
    
    return () => clearInterval(interval);
  }, [refreshTrigger]);

  const fetchPacientes = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const response = await salaEsperaService.getPacientesHospitalizados();
      setPacientes(response.data);
      setFilteredPacientes(response.data);
    } catch (err) {
      console.error('Error al cargar pacientes hospitalizados:', err);
      setError('Error al cargar la lista de pacientes hospitalizados');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value === '') {
      setFilteredPacientes(pacientes);
    } else {
      const filtered = pacientes.filter(paciente => 
        paciente.paciente_nombre?.toLowerCase().includes(value.toLowerCase()) ||
        paciente.motivo_hospitalizacion?.toLowerCase().includes(value.toLowerCase()) ||
        paciente.propietario_nombre?.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredPacientes(filtered);
    }
  };

  const handleDarDeAlta = async (id) => {
    try {
      await salaEsperaService.finalizarAtencion(id);
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Error al dar de alta al paciente:', err);
      setError('Error al dar de alta al paciente');
    }
  };

  const handleVerDetalle = (id) => {
    navigate(`/hospitalizacion/${id}`);
  };

  const handleEditar = (id) => {
    navigate(`/hospitalizacion/editar/${id}`);
  };

  const formatTiempoHospitalizacion = (horas) => {
    if (horas < 24) {
      return `${horas} horas`;
    } else {
      const dias = Math.floor(horas / 24);
      const horasRestantes = horas % 24;
      
      if (horasRestantes === 0) {
        return `${dias} día${dias > 1 ? 's' : ''}`;
      } else {
        return `${dias} día${dias > 1 ? 's' : ''} y ${horasRestantes} h`;
      }
    }
  };

  const formatTiempoRestante = (horas) => {
    if (!horas && horas !== 0) return 'No especificado';
    
    if (horas < 0) {
      return <Chip color="error" size="small" label="Pasado" />;
    }
    
    if (horas < 24) {
      return `${Math.max(0, horas)} horas`;
    } else {
      const dias = Math.floor(horas / 24);
      const horasRestantes = horas % 24;
      
      if (horasRestantes === 0) {
        return `${dias} día${dias > 1 ? 's' : ''}`;
      } else {
        return `${dias} día${dias > 1 ? 's' : ''} y ${horasRestantes} h`;
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <HospitalIcon fontSize="large" color="error" sx={{ mr: 2 }} />
        <Typography variant="h4" component="h1">
          Pacientes Hospitalizados
        </Typography>
      </Box>
      
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      
      <TextField
        fullWidth
        placeholder="Buscar por nombre, motivo o propietario..."
        variant="outlined"
        value={searchTerm}
        onChange={handleSearch}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {/* Vista de resumen */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Resumen de hospitalizaciones
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {filteredPacientes.length === 0 ? (
          <Grid item xs={12}>
            <Alert severity="info">No hay pacientes hospitalizados actualmente</Alert>
          </Grid>
        ) : (
          filteredPacientes.slice(0, 3).map(paciente => (
            <Grid item xs={12} md={4} key={paciente.id}>
              <Card 
                variant="outlined" 
                sx={{ 
                  borderLeft: 4, 
                  borderColor: 'error.main',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s',
                  '&:hover': {
                    boxShadow: 3
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Box display="flex" alignItems="center">
                      <PetsIcon color="error" sx={{ mr: 1 }} />
                      <Typography variant="h6">{paciente.paciente_nombre}</Typography>
                    </Box>
                    <Chip 
                      label={formatTiempoHospitalizacion(paciente.tiempo_hospitalizacion)} 
                      color="error" 
                      size="small" 
                    />
                  </Box>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Typography variant="body2" gutterBottom>
                    <strong>Motivo:</strong> {paciente.motivo_hospitalizacion || 'No especificado'}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Propietario:</strong> {paciente.propietario_nombre || 'No registrado'}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Veterinario:</strong> {paciente.veterinario_nombre || 'No asignado'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Alta prevista:</strong> {formatTiempoRestante(paciente.horas_hasta_alta)}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    onClick={() => handleVerDetalle(paciente.id)}
                    startIcon={<VisibilityIcon />}
                  >
                    Ver detalles
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Tabla con todos los pacientes hospitalizados */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Todos los pacientes hospitalizados
      </Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Paciente</TableCell>
              <TableCell>Especie/Raza</TableCell>
              <TableCell>Motivo</TableCell>
              <TableCell>Tiempo hospitalizado</TableCell>
              <TableCell>Alta prevista</TableCell>
              <TableCell>Veterinario</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPacientes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No hay pacientes hospitalizados
                </TableCell>
              </TableRow>
            ) : (
              filteredPacientes.map(paciente => (
                <TableRow key={paciente.id}>
                  <TableCell>{paciente.id}</TableCell>
                  <TableCell>{paciente.paciente_nombre}</TableCell>
                  <TableCell>{paciente.especie} / {paciente.raza}</TableCell>
                  <TableCell>{paciente.motivo_hospitalizacion || 'No especificado'}</TableCell>
                  <TableCell>{formatTiempoHospitalizacion(paciente.tiempo_hospitalizacion)}</TableCell>
                  <TableCell>{formatTiempoRestante(paciente.horas_hasta_alta)}</TableCell>
                  <TableCell>{paciente.veterinario_nombre || 'No asignado'}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Ver detalle">
                      <IconButton 
                        color="primary" 
                        size="small" 
                        onClick={() => handleVerDetalle(paciente.id)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar">
                      <IconButton 
                        color="secondary" 
                        size="small" 
                        onClick={() => handleEditar(paciente.id)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Dar de alta">
                      <IconButton 
                        color="success" 
                        size="small" 
                        onClick={() => handleDarDeAlta(paciente.id)}
                      >
                        <CheckCircleIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default HospitalizacionList; 