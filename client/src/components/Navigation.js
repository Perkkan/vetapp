import React from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

// Lista de elementos de navegación
const menuItems = [
  {
    text: 'Dashboard',
    path: '/',
    icon: <DashboardIcon />,
    roles: ['admin', 'veterinario', 'recepcionista', 'superadministrativo']
  },
  {
    text: 'Sala de Espera',
    path: '/sala-espera',
    icon: <MeetingRoomIcon />,
    roles: ['admin', 'veterinario', 'recepcionista', 'superadministrativo']
  },
  {
    text: 'Hospitalización',
    path: '/hospitalizacion',
    icon: <LocalHospitalIcon />,
    roles: ['admin', 'veterinario', 'superadministrativo']
  },
  // ... other menu items ...
]; 