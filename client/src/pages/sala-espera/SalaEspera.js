import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Tabs, 
  Tab, 
  CircularProgress, 
  Alert, 
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  LocalHospital as HospitalIcon, 
  MeetingRoom as RoomIcon,
  AccessTime as TimeIcon 
} from '@mui/icons-material';
import { salaEsperaService } from '../../services/api';
import ListaEspera from './components/ListaEspera';
import ListaConsulta from './components/ListaConsulta';
import ListaHospitalizados from './components/ListaHospitalizados';
import AgregarPacienteDialog from './components/AgregarPacienteDialog';

const SalaEspera = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pacientesEspera, setPacientesEspera] = useState([]);
  const [pacientesConsulta, setPacientesConsulta] = useState([]);
  const [pacientesHospitalizados, setPacientesHospitalizados] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchData();
    
    // Actualizar datos cada 30 segundos para mantener los tiempos de espera actualizados
    const interval = setInterval(() => {
      fetchData(false);
    }, 30000);
    
    return () => clearInterval(interval);
  }, [refreshTrigger]);

  const fetchData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      
      const [esperaRes, consultaRes, hospitalizadosRes] = await Promise.all([
        salaEsperaService.getPacientesEnEspera(),
        salaEsperaService.getPacientesEnConsulta(),
        salaEsperaService.getPacientesHospitalizados()
      ]);
      
      setPacientesEspera(esperaRes.data);
      setPacientesConsulta(consultaRes.data);
      setPacientesHospitalizados(hospitalizadosRes.data);
    } catch (err) {
      console.error('Error al cargar datos de sala de espera:', err);
      setError('Error al cargar los datos de la sala de espera');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handlePacienteAgregado = () => {
    setDialogOpen(false);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleMoverAConsulta = async (id, veterinarioId) => {
    try {
      await salaEsperaService.moverAConsulta(id, { veterinario_id: veterinarioId });
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Error al mover paciente a consulta:', err);
      setError('Error al mover el paciente a consulta');
    }
  };

  const handleMoverAHospitalizacion = async (id, data) => {
    try {
      await salaEsperaService.moverAHospitalizacion(id, data);
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Error al hospitalizar paciente:', err);
      setError('Error al hospitalizar el paciente');
    }
  };

  const handleFinalizarAtencion = async (id) => {
    try {
      await salaEsperaService.finalizarAtencion(id);
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Error al finalizar atención:', err);
      setError('Error al finalizar la atención');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const TabPanel = ({ children, value, index }) => (
    <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  // Vista adaptativa: móvil usa pestañas, escritorio muestra todo junto
  if (isMobile) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h4" gutterBottom display="flex" alignItems="center">
          <RoomIcon sx={{ mr: 1 }} />
          Sala de Espera
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Paper sx={{ width: '100%' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab 
              label={
                <Box display="flex" alignItems="center" flexDirection="column">
                  <TimeIcon fontSize="small" />
                  <Typography variant="body2">
                    Espera ({pacientesEspera.length})
                  </Typography>
                </Box>
              } 
            />
            <Tab 
              label={
                <Box display="flex" alignItems="center" flexDirection="column">
                  <RoomIcon fontSize="small" />
                  <Typography variant="body2">
                    Consulta ({pacientesConsulta.length})
                  </Typography>
                </Box>
              } 
            />
            <Tab 
              label={
                <Box display="flex" alignItems="center" flexDirection="column">
                  <HospitalIcon fontSize="small" />
                  <Typography variant="body2">
                    Hosp. ({pacientesHospitalizados.length})
                  </Typography>
                </Box>
              } 
            />
          </Tabs>
          
          <TabPanel value={tabValue} index={0}>
            <ListaEspera 
              pacientes={pacientesEspera} 
              onAgregarPaciente={handleOpenDialog}
              onMoverAConsulta={handleMoverAConsulta}
              onFinalizarAtencion={handleFinalizarAtencion}
            />
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <ListaConsulta 
              pacientes={pacientesConsulta} 
              onMoverAHospitalizacion={handleMoverAHospitalizacion}
              onFinalizarAtencion={handleFinalizarAtencion}
            />
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            <ListaHospitalizados 
              pacientes={pacientesHospitalizados} 
              onFinalizarAtencion={handleFinalizarAtencion}
            />
          </TabPanel>
        </Paper>
        
        <AgregarPacienteDialog 
          open={dialogOpen} 
          onClose={handleCloseDialog} 
          onPacienteAgregado={handlePacienteAgregado}
        />
      </Box>
    );
  }

  // Vista de escritorio: muestra las tres áreas en una cuadrícula
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom display="flex" alignItems="center">
        <RoomIcon sx={{ mr: 1 }} />
        Sala de Espera
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ height: '100%', p: 2 }}>
            <Typography variant="h6" gutterBottom display="flex" alignItems="center">
              <TimeIcon sx={{ mr: 1 }} color="primary" />
              Pacientes en Espera ({pacientesEspera.length})
            </Typography>
            <ListaEspera 
              pacientes={pacientesEspera} 
              onAgregarPaciente={handleOpenDialog}
              onMoverAConsulta={handleMoverAConsulta}
              onFinalizarAtencion={handleFinalizarAtencion}
            />
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ height: '100%', p: 2 }}>
            <Typography variant="h6" gutterBottom display="flex" alignItems="center">
              <RoomIcon sx={{ mr: 1 }} color="secondary" />
              En Consulta ({pacientesConsulta.length})
            </Typography>
            <ListaConsulta 
              pacientes={pacientesConsulta} 
              onMoverAHospitalizacion={handleMoverAHospitalizacion}
              onFinalizarAtencion={handleFinalizarAtencion}
            />
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ height: '100%', p: 2 }}>
            <Typography variant="h6" gutterBottom display="flex" alignItems="center">
              <HospitalIcon sx={{ mr: 1 }} color="error" />
              Hospitalizados ({pacientesHospitalizados.length})
            </Typography>
            <ListaHospitalizados 
              pacientes={pacientesHospitalizados} 
              onFinalizarAtencion={handleFinalizarAtencion}
            />
          </Paper>
        </Grid>
      </Grid>
      
      <AgregarPacienteDialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        onPacienteAgregado={handlePacienteAgregado}
      />
    </Box>
  );
};

export default SalaEspera; 