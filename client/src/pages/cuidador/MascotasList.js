import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  CardActionArea, 
  Chip, 
  TextField, 
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Pets as PetsIcon,
  ArrowForward as ArrowForwardIcon,
  CalendarToday as CalendarTodayIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Datos simulados de mascotas para demostración
const mascotas = [
  {
    id: 1,
    nombre: "Luna",
    especie: "Perro",
    raza: "Labrador",
    imagen: "https://images.unsplash.com/photo-1522276498395-f4f68f7f8454?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=869&q=80",
    edad: 3,
    genero: "Hembra",
    ultimaCita: "2023-02-18",
    proximaCita: "2023-03-15",
    propietario: "Carlos Rodríguez"
  },
  {
    id: 2,
    nombre: "Simba",
    especie: "Gato",
    raza: "Siamés",
    imagen: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80",
    edad: 2,
    genero: "Macho",
    ultimaCita: "2023-02-10",
    proximaCita: "2023-03-10",
    propietario: "Ana Martínez"
  },
  {
    id: 3,
    nombre: "Rocky",
    especie: "Perro",
    raza: "Bulldog",
    imagen: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=764&q=80",
    edad: 4,
    genero: "Macho",
    ultimaCita: "2023-02-05",
    proximaCita: "2023-03-05",
    propietario: "Pedro López"
  }
];

const MascotasList = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [especieFilter, setEspecieFilter] = useState('');
  const [mascotasList, setMascotasList] = useState([]);
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Simular carga de datos
  useEffect(() => {
    const fetchMascotas = async () => {
      try {
        // Aquí normalmente harías una llamada a la API
        // Simulamos un retraso para mostrar el estado de carga
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Usar datos simulados para demostración
        setMascotasList(mascotas);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar las mascotas');
        setLoading(false);
      }
    };
    
    fetchMascotas();
  }, [currentUser]);
  
  // Filtrar mascotas según búsqueda y filtro de especie
  const filteredMascotas = mascotasList.filter(mascota => {
    return (
      (mascota.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
       mascota.raza.toLowerCase().includes(searchTerm.toLowerCase()) ||
       mascota.propietario.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (especieFilter === '' || mascota.especie === especieFilter)
    );
  });
  
  const handleMascotaClick = (mascotaId) => {
    navigate(`/cuidador/mascotas/${mascotaId}`);
  };
  
  const handleViewCitas = () => {
    navigate('/cuidador/citas');
  };
  
  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Mis Mascotas
        </Typography>
        
        <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
          <Typography variant="body1" gutterBottom>
            Bienvenido/a a su portal de cuidador. Aquí puede ver todas las mascotas a su cargo y administrar sus citas e historiales.
          </Typography>
          <Button 
            variant="outlined" 
            color="primary" 
            startIcon={<CalendarTodayIcon />}
            onClick={handleViewCitas}
            sx={{ mt: 1 }}
          >
            Ver próximas citas
          </Button>
        </Box>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              variant="outlined"
              label="Buscar mascota"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="especie-filter-label">Filtrar por especie</InputLabel>
              <Select
                labelId="especie-filter-label"
                value={especieFilter}
                onChange={(e) => setEspecieFilter(e.target.value)}
                label="Filtrar por especie"
              >
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="Perro">Perros</MenuItem>
                <MenuItem value="Gato">Gatos</MenuItem>
                <MenuItem value="Ave">Aves</MenuItem>
                <MenuItem value="Conejo">Conejos</MenuItem>
                <MenuItem value="Otro">Otros</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        {filteredMascotas.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            No se encontraron mascotas que coincidan con su búsqueda.
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {filteredMascotas.map((mascota) => (
              <Grid item xs={12} sm={6} md={4} key={mascota.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardActionArea onClick={() => handleMascotaClick(mascota.id)}>
                    <CardMedia
                      component="img"
                      height="180"
                      image={mascota.imagen || 'https://via.placeholder.com/300x200?text=Sin+Imagen'}
                      alt={mascota.nombre}
                    />
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h5" component="div">
                          {mascota.nombre}
                        </Typography>
                        <Chip 
                          icon={<PetsIcon />} 
                          label={mascota.especie} 
                          size="small" 
                          color={mascota.especie === 'Perro' ? 'primary' : 'secondary'} 
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {mascota.raza} • {mascota.edad} años • {mascota.genero}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Propietario:</strong> {mascota.propietario}
                      </Typography>
                      
                      {mascota.proximaCita && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                          <CalendarTodayIcon color="primary" sx={{ mr: 1, fontSize: '0.9rem' }} />
                          <Typography variant="body2">
                            Próxima cita: {new Date(mascota.proximaCita).toLocaleDateString()}
                          </Typography>
                        </Box>
                      )}
                      
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                        <ArrowForwardIcon color="primary" />
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default MascotasList; 