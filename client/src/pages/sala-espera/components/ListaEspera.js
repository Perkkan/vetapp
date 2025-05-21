import React from 'react';
import { 
  List, 
  ListItem, 
  ListItemText, 
  Box, 
  Typography, 
  Button, 
  IconButton, 
  Tooltip, 
  Chip, 
  Card, 
  CardContent, 
  CardActions, 
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField
} from '@mui/material';
import {
  LocalHospital as HospitalIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  MeetingRoom as RoomIcon,
  Pets as PetsIcon
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { veterinariosService } from '../../../services/api';

const ListaEspera = ({ pacientes, onAgregarPaciente, onMoverAConsulta, onFinalizarAtencion }) => {
  const [veterinarios, setVeterinarios] = useState([]);
  const [selectedPaciente, setSelectedPaciente] = useState(null);
  const [selectedVeterinario, setSelectedVeterinario] = useState('');
  const [consultaDialogOpen, setConsultaDialogOpen] = useState(false);

  useEffect(() => {
    const fetchVeterinarios = async () => {
      try {
        const response = await veterinariosService.getAllVeterinarios();
        setVeterinarios(response.data);
      } catch (err) {
        console.error('Error al cargar veterinarios:', err);
      }
    };

    fetchVeterinarios();
  }, []);

  const getColorByTiempoEspera = (minutos) => {
    if (minutos <= 5) {
      return { color: 'success', text: 'Reciente' };
    } else if (minutos <= 10) {
      return { color: 'warning', text: 'Esperando' };
    } else {
      return { color: 'error', text: 'Urgente' };
    }
  };

  const handleMoverAConsultaClick = (paciente) => {
    setSelectedPaciente(paciente);
    setConsultaDialogOpen(true);
  };

  const handleConsultaSubmit = () => {
    if (selectedPaciente && selectedVeterinario) {
      onMoverAConsulta(selectedPaciente.id, selectedVeterinario);
      setConsultaDialogOpen(false);
      setSelectedPaciente(null);
      setSelectedVeterinario('');
    }
  };

  const handleCancelarConsulta = () => {
    setConsultaDialogOpen(false);
    setSelectedPaciente(null);
    setSelectedVeterinario('');
  };

  return (
    <>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={onAgregarPaciente}
        >
          Agregar Paciente
        </Button>
      </Box>

      {pacientes.length === 0 ? (
        <Typography variant="body1" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
          No hay pacientes en sala de espera
        </Typography>
      ) : (
        <List>
          {pacientes.map((paciente) => {
            const tiempoEspera = paciente.tiempo_espera || 0;
            const colorState = getColorByTiempoEspera(tiempoEspera);
            
            return (
              <Card 
                key={paciente.id} 
                variant="outlined" 
                sx={{ 
                  mb: 2, 
                  borderLeft: 4, 
                  borderColor: `${colorState.color}.main`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: 3
                  }
                }}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center">
                      <PetsIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6">
                        {paciente.paciente_nombre}
                      </Typography>
                    </Box>
                    <Chip 
                      label={`${colorState.text}: ${tiempoEspera} min`} 
                      color={colorState.color} 
                      size="small"
                    />
                  </Box>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Typography variant="body2" color="text.secondary">
                    <strong>Propietario:</strong> {paciente.propietario_nombre || 'No registrado'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Motivo:</strong> {paciente.motivo || 'No especificado'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Especie/Raza:</strong> {paciente.especie} - {paciente.raza}
                  </Typography>
                </CardContent>
                
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <Tooltip title="Cancelar espera">
                    <IconButton 
                      color="error"
                      onClick={() => onFinalizarAtencion(paciente.id)}
                    >
                      <CancelIcon />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Mover a consulta">
                    <Button 
                      variant="contained" 
                      color="primary"
                      size="small"
                      startIcon={<RoomIcon />}
                      onClick={() => handleMoverAConsultaClick(paciente)}
                    >
                      Atender
                    </Button>
                  </Tooltip>
                </CardActions>
              </Card>
            );
          })}
        </List>
      )}

      {/* Dialog para seleccionar veterinario al mover a consulta */}
      <Dialog open={consultaDialogOpen} onClose={handleCancelarConsulta}>
        <DialogTitle>Asignar Veterinario para Consulta</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, minWidth: 300 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Veterinario</InputLabel>
              <Select
                value={selectedVeterinario}
                onChange={(e) => setSelectedVeterinario(e.target.value)}
                label="Veterinario"
              >
                {veterinarios.map((veterinario) => (
                  <MenuItem key={veterinario.id} value={veterinario.id}>
                    {veterinario.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              <strong>Paciente:</strong> {selectedPaciente?.paciente_nombre}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelarConsulta}>Cancelar</Button>
          <Button 
            onClick={handleConsultaSubmit} 
            color="primary" 
            variant="contained"
            disabled={!selectedVeterinario}
          >
            Iniciar Consulta
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ListaEspera; 