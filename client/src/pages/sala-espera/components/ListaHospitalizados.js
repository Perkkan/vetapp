import React from 'react';
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
  Tooltip 
} from '@mui/material';
import {
  Pets as PetsIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';

const ListaHospitalizados = ({ pacientes, onFinalizarAtencion }) => {
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

  return (
    <>
      {pacientes.length === 0 ? (
        <Typography variant="body1" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
          No hay pacientes hospitalizados
        </Typography>
      ) : (
        <List>
          {pacientes.map((paciente) => {
            const tiempoHospitalizacion = paciente.tiempo_hospitalizacion || 0;
            
            return (
              <Card 
                key={paciente.id} 
                variant="outlined" 
                sx={{ 
                  mb: 2, 
                  borderLeft: 4, 
                  borderColor: 'error.main',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: 3
                  }
                }}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center">
                      <PetsIcon color="error" sx={{ mr: 1 }} />
                      <Typography variant="h6">
                        {paciente.paciente_nombre}
                      </Typography>
                    </Box>
                    <Chip 
                      label={formatTiempoHospitalizacion(tiempoHospitalizacion)} 
                      color="error" 
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
                    <strong>Motivo:</strong> {paciente.motivo_hospitalizacion || 'No especificado'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Especie/Raza:</strong> {paciente.especie} - {paciente.raza}
                  </Typography>
                </CardContent>
                
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <Tooltip title="Dar de alta">
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      startIcon={<CheckIcon />}
                      onClick={() => onFinalizarAtencion(paciente.id)}
                    >
                      Dar de Alta
                    </Button>
                  </Tooltip>
                </CardActions>
              </Card>
            );
          })}
        </List>
      )}
    </>
  );
};

export default ListaHospitalizados; 