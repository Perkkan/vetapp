import React from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress
} from '@mui/material';
import { 
  PetsOutlined as PetsIcon, 
  CalendarToday as CalendarIcon,
  MedicalServices as MedicalIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { currentUser } = useAuth();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Bienvenido, {currentUser?.nombre}
      </Typography>

      <Grid container spacing={3}>
        {/* Tarjetas de resumen */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center' }}>
              <PetsIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
              <Box>
                <Typography variant="h5" component="div">
                  24
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Pacientes Activos
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center' }}>
              <CalendarIcon sx={{ fontSize: 40, color: 'secondary.main', mr: 2 }} />
              <Box>
                <Typography variant="h5" component="div">
                  8
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Citas Hoy
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center' }}>
              <MedicalIcon sx={{ fontSize: 40, color: 'error.main', mr: 2 }} />
              <Box>
                <Typography variant="h5" component="div">
                  15
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Historiales Recientes
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center' }}>
              <PersonIcon sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
              <Box>
                <Typography variant="h5" component="div">
                  36
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Propietarios Registrados
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Próximas citas */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Próximas Citas
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CalendarIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Max (Labrador)" 
                  secondary="Hoy - 10:30 AM - Dr. García" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CalendarIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Luna (Gato Persa)" 
                  secondary="Hoy - 11:45 AM - Dra. Rodríguez" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CalendarIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Coco (Pomerania)" 
                  secondary="Mañana - 09:15 AM - Dr. García" 
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Pacientes recientes */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Pacientes Recientes
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <PetsIcon color="secondary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Rocky (Bulldog)" 
                  secondary="Vacunación - 24/03/2023" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <PetsIcon color="secondary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Mia (Siamés)" 
                  secondary="Control - 23/03/2023" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <PetsIcon color="secondary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Toby (Golden Retriever)" 
                  secondary="Emergencia - 22/03/2023" 
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 