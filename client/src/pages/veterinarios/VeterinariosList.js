import React, { useState } from 'react';
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
  Card,
  CardContent,
  Avatar,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText
} from '@mui/material';
import {
  People as PeopleIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Phone as PhoneIcon,
  Email as EmailIcon
} from '@mui/icons-material';

const veterinariosData = [
  {
    id: 1,
    nombre: 'Dra. María Rodríguez',
    especialidad: 'Medicina General',
    email: 'maria.rodriguez@veterinaria.com',
    telefono: '555-1234',
    horario: 'Lunes a Viernes 8:00 - 15:00',
    estado: 'Activo',
    foto: 'MR'
  },
  {
    id: 2,
    nombre: 'Dr. Carlos Sánchez',
    especialidad: 'Cirugía',
    email: 'carlos.sanchez@veterinaria.com',
    telefono: '555-5678',
    horario: 'Lunes a Viernes 14:00 - 20:00',
    estado: 'Activo',
    foto: 'CS'
  },
  {
    id: 3,
    nombre: 'Dr. José López',
    especialidad: 'Traumatología',
    email: 'jose.lopez@veterinaria.com',
    telefono: '555-9012',
    horario: 'Lunes, Miércoles y Viernes 9:00 - 18:00',
    estado: 'Activo',
    foto: 'JL'
  },
  {
    id: 4,
    nombre: 'Dra. Laura García',
    especialidad: 'Dermatología',
    email: 'laura.garcia@veterinaria.com',
    telefono: '555-3456',
    horario: 'Martes y Jueves 10:00 - 19:00',
    estado: 'De vacaciones',
    foto: 'LG'
  },
  {
    id: 5,
    nombre: 'Dr. Roberto Martínez',
    especialidad: 'Cardiología',
    email: 'roberto.martinez@veterinaria.com',
    telefono: '555-7890',
    horario: 'Lunes a Viernes 11:00 - 20:00',
    estado: 'Activo',
    foto: 'RM'
  }
];

const VeterinariosList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [veterinarios, setVeterinarios] = useState(veterinariosData);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    const filtered = veterinariosData.filter((veterinario) => 
      veterinario.nombre.toLowerCase().includes(value.toLowerCase()) ||
      veterinario.especialidad.toLowerCase().includes(value.toLowerCase()) ||
      veterinario.email.toLowerCase().includes(value.toLowerCase())
    );
    
    setVeterinarios(filtered);
  };

  const getChipColor = (estado) => {
    switch (estado) {
      case 'Activo':
        return 'success';
      case 'De vacaciones':
        return 'warning';
      case 'Inactivo':
        return 'error';
      default:
        return 'default';
    }
  };

  // Obtener veterinarios activos
  const veterinariosActivos = veterinarios.filter(vet => vet.estado === 'Activo');

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          <PeopleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Veterinarios
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
        >
          Nuevo Veterinario
        </Button>
      </Box>

      {/* Veterinarios destacados */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Veterinarios de Guardia
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <List>
            {veterinariosActivos.slice(0, 3).map((veterinario) => (
              <ListItem key={veterinario.id} sx={{ py: 1 }}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>{veterinario.foto}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={veterinario.nombre}
                  secondary={
                    <React.Fragment>
                      <Typography variant="body2" component="span" color="textPrimary">
                        {veterinario.especialidad}
                      </Typography>
                      <Typography variant="body2" component="div" color="textSecondary">
                        <Box display="flex" alignItems="center" sx={{ mt: 0.5 }}>
                          <PhoneIcon fontSize="small" sx={{ mr: 0.5 }} />
                          {veterinario.telefono}
                        </Box>
                      </Typography>
                    </React.Fragment>
                  }
                />
                <Box>
                  <Chip 
                    size="small" 
                    label={veterinario.estado} 
                    color={getChipColor(veterinario.estado)} 
                  />
                </Box>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
      
      <TextField
        fullWidth
        margin="normal"
        placeholder="Buscar veterinario..."
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
      
      <Grid container spacing={3} mb={3}>
        {veterinarios.map((veterinario) => (
          <Grid item xs={12} md={6} lg={4} key={veterinario.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>{veterinario.foto}</Avatar>
                    <Box>
                      <Typography variant="h6" component="div">
                        {veterinario.nombre}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        {veterinario.especialidad}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip 
                    label={veterinario.estado} 
                    color={getChipColor(veterinario.estado)}
                    size="small" 
                  />
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="body2" component="div" mb={1}>
                  <Box display="flex" alignItems="center">
                    <EmailIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                    {veterinario.email}
                  </Box>
                </Typography>
                
                <Typography variant="body2" component="div" mb={1}>
                  <Box display="flex" alignItems="center">
                    <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                    {veterinario.telefono}
                  </Box>
                </Typography>
                
                <Typography variant="body2" gutterBottom>
                  <strong>Horario:</strong> {veterinario.horario}
                </Typography>
                
                <Box display="flex" justifyContent="flex-end" mt={2}>
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
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Especialidad</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Horario</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {veterinarios.map((veterinario) => (
              <TableRow key={veterinario.id}>
                <TableCell>{veterinario.id}</TableCell>
                <TableCell>{veterinario.nombre}</TableCell>
                <TableCell>{veterinario.especialidad}</TableCell>
                <TableCell>{veterinario.email}</TableCell>
                <TableCell>{veterinario.telefono}</TableCell>
                <TableCell>{veterinario.horario}</TableCell>
                <TableCell>
                  <Chip 
                    label={veterinario.estado} 
                    color={getChipColor(veterinario.estado)}
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

export default VeterinariosList; 