import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from './styles/theme';

// Páginas
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import Forbidden from './pages/Forbidden';
import ProtectedRoute from './components/ProtectedRoute';

// Importar componentes para las diferentes secciones
import PacientesList from './pages/pacientes/PacientesList';
import PacienteForm from './pages/pacientes/PacienteForm';
import PacienteDetalle from './pages/pacientes/PacienteDetalle';
import CitasList from './pages/citas/CitasList';
import CitaForm from './pages/citas/CitaForm';
import HistorialesList from './pages/historiales/HistorialesList';
import VeterinariosList from './pages/veterinarios/VeterinariosList';
import InventarioList from './pages/inventario/InventarioList';
import PropietariosList from './pages/propietarios/PropietariosList';
import SalaEspera from './pages/sala-espera/SalaEspera';

// Importar componentes de hospitalización
import HospitalizacionList from './pages/hospitalizacion/HospitalizacionList';
import HospitalizacionDetalle from './pages/hospitalizacion/HospitalizacionDetalle';
import HospitalizacionForm from './pages/hospitalizacion/HospitalizacionForm';

// Importar componentes de clínicas
import ClinicasList from './pages/clinicas/ClinicasList';
import ClinicaForm from './pages/clinicas/ClinicaForm';

// Importar componentes de facturación
import FacturacionList from './pages/facturacion/FacturacionList';
import FacturaForm from './pages/facturacion/FacturaForm';
import FacturaDetalle from './pages/facturacion/FacturaDetalle';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forbidden" element={<Forbidden />} />
        
        {/* Rutas protegidas dentro del layout principal */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* Rutas de pacientes */}
          <Route path="pacientes">
            <Route index element={
              <ProtectedRoute requiredPermisos={['pacientes_ver']}>
                <PacientesList />
              </ProtectedRoute>
            } />
            <Route path="nuevo" element={
              <ProtectedRoute requiredPermisos={['pacientes_crear']}>
                <PacienteForm />
              </ProtectedRoute>
            } />
            <Route path="editar/:id" element={
              <ProtectedRoute requiredPermisos={['pacientes_editar']}>
                <PacienteForm />
              </ProtectedRoute>
            } />
            <Route path=":id" element={
              <ProtectedRoute requiredPermisos={['pacientes_ver']}>
                <PacienteDetalle />
              </ProtectedRoute>
            } />
          </Route>
          
          {/* Rutas de citas */}
          <Route path="citas">
            <Route index element={
              <ProtectedRoute requiredPermisos={['citas_ver']}>
                <CitasList />
              </ProtectedRoute>
            } />
            <Route path="nueva" element={
              <ProtectedRoute requiredPermisos={['citas_crear']}>
                <CitaForm />
              </ProtectedRoute>
            } />
            <Route path="editar/:id" element={
              <ProtectedRoute requiredPermisos={['citas_editar']}>
                <CitaForm />
              </ProtectedRoute>
            } />
          </Route>
          
          {/* Rutas de historiales */}
          <Route path="historiales" element={
            <ProtectedRoute requiredPermisos={['historiales_ver']}>
              <HistorialesList />
            </ProtectedRoute>
          } />
          
          {/* Rutas de veterinarios */}
          <Route path="veterinarios" element={
            <ProtectedRoute requiredRoles={['admin', 'superadmin']}>
              <VeterinariosList />
            </ProtectedRoute>
          } />
          
          {/* Rutas de inventario */}
          <Route path="inventario" element={
            <ProtectedRoute requiredPermisos={['inventario_ver']}>
              <InventarioList />
            </ProtectedRoute>
          } />
          
          {/* Rutas de propietarios */}
          <Route path="propietarios" element={
            <ProtectedRoute requiredPermisos={['pacientes_ver']}>
              <PropietariosList />
            </ProtectedRoute>
          } />
          
          {/* Ruta de sala de espera */}
          <Route path="sala-espera" element={
            <ProtectedRoute requiredPermisos={['sala_espera_ver']}>
              <SalaEspera />
            </ProtectedRoute>
          } />
          
          {/* Rutas de hospitalización */}
          <Route path="hospitalizacion">
            <Route index element={
              <ProtectedRoute requiredPermisos={['hospitalizacion_ver']}>
                <HospitalizacionList />
              </ProtectedRoute>
            } />
            <Route path=":id" element={
              <ProtectedRoute requiredPermisos={['hospitalizacion_ver']}>
                <HospitalizacionDetalle />
              </ProtectedRoute>
            } />
            <Route path="editar/:id" element={
              <ProtectedRoute requiredPermisos={['hospitalizacion_editar']}>
                <HospitalizacionForm />
              </ProtectedRoute>
            } />
          </Route>
          
          {/* Rutas de clínicas - Solo para superadmin */}
          <Route path="clinicas">
            <Route index element={
              <ProtectedRoute requiredRoles={['superadmin']}>
                <ClinicasList />
              </ProtectedRoute>
            } />
            <Route path="nueva" element={
              <ProtectedRoute requiredRoles={['superadmin']}>
                <ClinicaForm />
              </ProtectedRoute>
            } />
            <Route path="editar/:id" element={
              <ProtectedRoute requiredRoles={['superadmin']}>
                <ClinicaForm />
              </ProtectedRoute>
            } />
          </Route>
          
          {/* Rutas de facturación */}
          <Route path="facturacion">
            <Route index element={
              <ProtectedRoute requiredPermisos={['facturacion_ver']}>
                <FacturacionList />
              </ProtectedRoute>
            } />
            <Route path="nueva" element={
              <ProtectedRoute requiredPermisos={['facturacion_crear']}>
                <FacturaForm />
              </ProtectedRoute>
            } />
            <Route path="editar/:id" element={
              <ProtectedRoute requiredPermisos={['facturacion_editar']}>
                <FacturaForm />
              </ProtectedRoute>
            } />
            <Route path=":id" element={
              <ProtectedRoute requiredPermisos={['facturacion_ver']}>
                <FacturaDetalle />
              </ProtectedRoute>
            } />
          </Route>
        </Route>
      </Routes>
    </ThemeProvider>
  );
}

export default App;
