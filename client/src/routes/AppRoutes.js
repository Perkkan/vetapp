import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';

// Layouts
import DashboardLayout from '../layouts/DashboardLayout';
import AuthLayout from '../layouts/AuthLayout';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';

// Dashboard Pages
import Dashboard from '../pages/dashboard/Dashboard';

// Pacientes Pages
import PacientesList from '../pages/pacientes/PacientesList';
import PacienteForm from '../pages/pacientes/PacienteForm';
import PacienteDetail from '../pages/pacientes/PacienteDetail';

// Propietarios Pages
import PropietariosList from '../pages/propietarios/PropietariosList';
import PropietarioForm from '../pages/propietarios/PropietarioForm';
import PropietarioDetail from '../pages/propietarios/PropietarioDetail';

// Historiales Pages
import HistorialesList from '../pages/historiales/HistorialesList';
import HistorialForm from '../pages/historiales/HistorialForm';
import HistorialDetail from '../pages/historiales/HistorialDetail';

// Citas Pages
import CitasList from '../pages/citas/CitasList';
import CitaForm from '../pages/citas/CitaForm';
import CitaDetail from '../pages/citas/CitaDetail';

// Configuración Pages
import ConfiguracionPage from '../pages/configuracion/ConfiguracionPage';

// Error Pages
import NotFound from '../pages/error/NotFound';

// Auth guard para proteger rutas
import ProtectedRoute from './ProtectedRoute';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rutas de autenticación */}
      <Route path="/" element={<AuthLayout />}>
        <Route index element={<Navigate to="/login" replace />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* Rutas protegidas del dashboard */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        
        {/* Pacientes */}
        <Route path="pacientes">
          <Route index element={<PacientesList />} />
          <Route path="nuevo" element={<PacienteForm />} />
          <Route path=":id" element={<PacienteDetail />} />
          <Route path="editar/:id" element={<PacienteForm />} />
        </Route>
        
        {/* Propietarios */}
        <Route path="propietarios">
          <Route index element={<PropietariosList />} />
          <Route path="nuevo" element={<PropietarioForm />} />
          <Route path=":id" element={<PropietarioDetail />} />
          <Route path="editar/:id" element={<PropietarioForm />} />
        </Route>

        {/* Historiales */}
        <Route path="historiales">
          <Route index element={<HistorialesList />} />
          <Route path="nuevo" element={<HistorialForm />} />
          <Route path=":id" element={<HistorialDetail />} />
          <Route path="editar/:id" element={<HistorialForm />} />
          <Route path="paciente/:pacienteId/nuevo" element={<HistorialForm />} />
        </Route>

        {/* Citas */}
        <Route path="citas">
          <Route index element={<CitasList />} />
          <Route path="nueva" element={<CitaForm />} />
          <Route path=":id" element={<CitaDetail />} />
          <Route path="editar/:id" element={<CitaForm />} />
        </Route>
        
        {/* Configuración */}
        <Route path="configuracion" element={<ConfiguracionPage />} />
      </Route>

      {/* Ruta para redireccionar peticiones a dashboard/ hacia dashboard */}
      <Route path="/dashboard/" element={<Navigate to="/dashboard" replace />} />
      
      {/* Redirección de la raíz a dashboard cuando el usuario está autenticado */}
      <Route 
        path="/" 
        element={
          localStorage.getItem('token') 
            ? <Navigate to="/dashboard" replace /> 
            : <Navigate to="/login" replace />
        } 
      />

      {/* Redirecciones para rutas acortadas */}
      <Route path="/historiales" element={<Navigate to="/dashboard/historiales" replace />} />
      <Route path="/pacientes" element={<Navigate to="/dashboard/pacientes" replace />} />
      <Route path="/propietarios" element={<Navigate to="/dashboard/propietarios" replace />} />
      <Route path="/citas" element={<Navigate to="/dashboard/citas" replace />} />
      
      {/* Página no encontrada */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes; 