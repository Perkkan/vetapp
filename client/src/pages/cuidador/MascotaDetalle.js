import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  CardHeader, 
  Chip, 
  Divider, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Tab, 
  Tabs, 
  Button,
  CircularProgress,
  Alert,
  Paper
} from '@mui/material';
import { 
  Pets as PetsIcon, 
  Cake as CakeIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
  Scale as ScaleIcon,
  MedicalServices as MedicalIcon,
  CalendarToday as CalendarIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';

// Datos simulados de mascotas
const mascotas = [
  {
    id: 1,
    nombre: "Luna",
    especie: "Perro",
    raza: "Labrador",
    imagen: "https://via.placeholder.com/300x200?text=Luna",
    edad: 3,
    peso: 28.5,
    genero: "Hembra",
    fechaNacimiento: "2020-05-15",
    proximasCitas: [
      { id: 101, fecha: "2023-03-15", tipo: "Vacunación", veterinario: "Dra. Ana Martínez" }
    ],
    historiales: [
      { id: 201, fecha: "2023-01-20", tipo: "Vacunación", notas: "Vacuna antirrábica anual", veterinario: "Dra. Ana Martínez" }
    ],
    propietario: {
      nombre: "Carlos Rodríguez",
      telefono: "+34 612 345 678",
      email: "carlos@example.com"
    }
  },
  {
    id: 2,
    nombre: "Simba",
    especie: "Gato",
    raza: "Siamés",
    imagen: "https://via.placeholder.com/300x200?text=Simba",
    edad: 2,
    peso: 4.2,
    genero: "Macho",
    fechaNacimiento: "2021-03-10",
    proximasCitas: [],
    historiales: [],
    propietario: {
      nombre: "Ana Martínez",
      telefono: "+34 623 456 789",
      email: "ana@example.com"
    }
  }
];

const MascotaDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mascota, setMascota] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  
  // Simular carga de datos
  useEffect(() => {
    const fetchMascotaDetalle = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        const mascotaEncontrada = mascotas.find(m => m.id === parseInt(id));
        
        if (mascotaEncontrada) {
          setMascota(mascotaEncontrada);
        } else {
          setError('Mascota no encontrada');
        }
        
        setLoading(false);
      } catch (err) {
        setError('Error al cargar los detalles de la mascota');
        setLoading(false);
      }
    };
    
    fetchMascotaDetalle();
  }, [id]);
  
  const handleChangeTab = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleBack = () => {
    navigate('/cuidador/mascotas');
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
  
  if (error || !mascota) {
    return (
      <Container maxWidth="lg">
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mt: 2, mb: 2 }}>
          Volver a la lista
        </Button>
        <Alert severity="error">
          {error || 'No se encontró la mascota solicitada'}
        </Alert>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg">
      <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mt: 2, mb: 2 }}>
        Volver a la lista
      </Button>
      
      <Grid container spacing={3}>
        {/* Información básica */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardMedia
              component="img"
              height="250"
              image={mascota.imagen}
              alt={mascota.nombre}
            />
            <CardHeader
              title={mascota.nombre}
              subheader={
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Chip 
                    icon={<PetsIcon />} 
                    label={mascota.especie} 
                    size="small" 
                    color={mascota.especie === 'Perro' ? 'primary' : 'secondary'} 
                    sx={{ mr: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {mascota.raza}
                  </Typography>
                </Box>
              }
              titleTypographyProps={{ variant: 'h5' }}
            />
            <CardContent>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    {mascota.genero === 'Macho' ? 
                      <MaleIcon color="primary" /> : 
                      <FemaleIcon color="secondary" />
                    }
                  </ListItemIcon>
                  <ListItemText primary="Género" secondary={mascota.genero} />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CakeIcon /></ListItemIcon>
                  <ListItemText primary="Edad" secondary={`${mascota.edad} años`} />
                </ListItem>
                <ListItem>
                  <ListItemIcon><ScaleIcon /></ListItemIcon>
                  <ListItemText primary="Peso" secondary={`${mascota.peso} kg`} />
                </ListItem>
              </List>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>Propietario</Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Nombre:</strong> {mascota.propietario.nombre}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Teléfono:</strong> {mascota.propietario.telefono}
              </Typography>
              <Typography variant="body2">
                <strong>Email:</strong> {mascota.propietario.email}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Pestañas de citas e historiales */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ mb: 2 }}>
            <Tabs
              value={tabValue}
              onChange={handleChangeTab}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              <Tab label="Próximas Citas" icon={<CalendarIcon />} />
              <Tab label="Historial Médico" icon={<MedicalIcon />} />
            </Tabs>
          </Paper>
          
          {/* Panel de próximas citas */}
          {tabValue === 0 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Próximas Citas</Typography>
              
              {mascota.proximasCitas.length === 0 ? (
                <Alert severity="info">No hay citas programadas</Alert>
              ) : (
                <List>
                  {mascota.proximasCitas.map((cita) => (
                    <ListItem key={cita.id}>
                      <ListItemIcon><CalendarIcon color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary={`${cita.tipo} - ${new Date(cita.fecha).toLocaleDateString()}`}
                        secondary={`Veterinario: ${cita.veterinario}`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          )}
          
          {/* Panel de historiales médicos */}
          {tabValue === 1 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Historial Médico</Typography>
              
              {mascota.historiales.length === 0 ? (
                <Alert severity="info">No hay registros de historial médico</Alert>
              ) : (
                <List>
                  {mascota.historiales.map((historial) => (
                    <React.Fragment key={historial.id}>
                      <ListItem alignItems="flex-start">
                        <ListItemIcon><MedicalIcon color="primary" /></ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="subtitle1">{historial.tipo}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {new Date(historial.fecha).toLocaleDateString()}
                              </Typography>
                            </Box>
                          }
                          secondary={`${historial.veterinario} - ${historial.notas}`}
                        />
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default MascotaDetalle; 