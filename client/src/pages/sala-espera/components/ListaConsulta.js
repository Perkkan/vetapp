import React, { useState } from 'react';
import { 
  List, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  CardActions, 
  Divider, 
  Chip, 
  Button, 
  IconButton, 
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  LocalHospital as HospitalIcon,
  CheckCircle as CheckIcon,
  Pets as PetsIcon
} from '@mui/icons-material';

const ListaConsulta = ({ pacientes, onMoverAHospitalizacion, onFinalizarAtencion }) => {
  const [selectedPaciente, setSelectedPaciente] = useState(null);
  const [motivoHospitalizacion, setMotivoHospitalizacion] = useState('');
  const [hospitalizacionDialogOpen, setHospitalizacionDialogOpen] = useState(false);

  const handleHospitalizarClick = (paciente) => {
    setSelectedPaciente(paciente);
    setHospitalizacionDialogOpen(true);
  };

  const handleHospitalizacionSubmit = () => {
    if (selectedPaciente && motivoHospitalizacion) {
      onMoverAHospitalizacion(selectedPaciente.id, {
        veterinario_id: selectedPaciente.veterinario_id,
        motivo_hospitalizacion: motivoHospitalizacion
      });
      setHospitalizacionDialogOpen(false);
      setSelectedPaciente(null);
      setMotivoHospitalizacion('');
    }
  };

  const handleCancelarHospitalizacion = () => {
    setHospitalizacionDialogOpen(false);
    setSelectedPaciente(null);
    setMotivoHospitalizacion('');
  };

  return (
    <>
      {pacientes.length === 0 ? (
        <Typography variant="body1" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
          No hay pacientes en consulta
        </Typography>
      ) : (
        <List>
          {pacientes.map((paciente) => {
            const tiempoConsulta = paciente.tiempo_consulta || 0;
            
            return (
              <Card 
                key={paciente.id} 
                variant="outlined" 
                sx={{ 
                  mb: 2, 
                  borderLeft: 4, 
                  borderColor: 'secondary.main',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: 3
                  }
                }}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center">
                      <PetsIcon color="secondary" sx={{ mr: 1 }} />
                      <Typography variant="h6">
                        {paciente.paciente_nombre}
                      </Typography>
                    </Box>
                    <Chip 
                      label={`${tiempoConsulta} min en consulta`} 
                      color="secondary" 
                      size="small"
                    />
                  </Box>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Typography variant="body2" color="text.secondary">
                    <strong>Veterinario:</strong> {paciente.veterinario_nombre || 'No asignado'}
                  </Typography>
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
                  <Tooltip title="Finalizar consulta">
                    <Button
                      variant="outlined"
                      color="success"
                      size="small"
                      startIcon={<CheckIcon />}
                      onClick={() => onFinalizarAtencion(paciente.id)}
                    >
                      Finalizar
                    </Button>
                  </Tooltip>
                  
                  <Tooltip title="Hospitalizar">
                    <Button 
                      variant="contained"
                      color="error"
                      size="small"
                      startIcon={<HospitalIcon />}
                      onClick={() => handleHospitalizarClick(paciente)}
                    >
                      Hospitalizar
                    </Button>
                  </Tooltip>
                </CardActions>
              </Card>
            );
          })}
        </List>
      )}

      {/* Dialog para hospitalización */}
      <Dialog open={hospitalizacionDialogOpen} onClose={handleCancelarHospitalizacion}>
        <DialogTitle>Hospitalizar Paciente</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, minWidth: 300 }}>
            <TextField
              label="Motivo de hospitalización"
              value={motivoHospitalizacion}
              onChange={(e) => setMotivoHospitalizacion(e.target.value)}
              fullWidth
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              <strong>Paciente:</strong> {selectedPaciente?.paciente_nombre}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              <strong>Veterinario:</strong> {selectedPaciente?.veterinario_nombre}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelarHospitalizacion}>Cancelar</Button>
          <Button 
            onClick={handleHospitalizacionSubmit} 
            color="error" 
            variant="contained"
            disabled={!motivoHospitalizacion}
          >
            Hospitalizar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ListaConsulta; 