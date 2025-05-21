import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import WaitingRoom from './pages/WaitingRoom';
import HospitalizationDetail from './pages/HospitalizationDetail';
import HospitalizationList from './pages/HospitalizationList';
import Patients from './pages/Patients';
import Owners from './pages/Owners';
import Appointments from './pages/Appointments';
import Veterinarians from './pages/Veterinarians';
import Billing from './pages/Billing';
import PatientHistory from './pages/PatientHistory';
import HistoryList from './pages/HistoryList';
import Consultations from './pages/Consultations';
import Laboratory from './pages/Laboratory';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Compras from './pages/Compras';
import RecursosHumanos from './pages/RecursosHumanos';
import Clinicas from './pages/Clinicas';
import Users from './pages/Users';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    // Comprobar si hay un token guardado en localStorage
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          isAuthenticated ? (
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          ) : (
            <Navigate to="/login" replace />
          )
        }>
          <Route index element={<Dashboard />} />
          <Route path="sala-espera" element={<WaitingRoom />} />
          <Route path="hospitalizacion" element={<HospitalizationList />} />
          <Route path="hospitalizacion/:id" element={<HospitalizationDetail />} />
          <Route path="consultas" element={<Consultations />} />
          <Route path="laboratorio" element={<Laboratory />} />
          <Route path="laboratorio/paciente/:id" element={<Laboratory />} />
          <Route path="pacientes" element={<Patients />} />
          <Route path="pacientes/historial/:id" element={<PatientHistory />} />
          <Route path="propietarios" element={<Owners />} />
          <Route path="citas" element={<Appointments />} />
          <Route path="veterinarios" element={
            <PrivateRoute>
              <Veterinarians />
            </PrivateRoute>
          } />
          <Route path="facturacion" element={<Billing />} />
          <Route path="historiales" element={<HistoryList />} />
          <Route path="compras" element={<Compras />} />
          <Route path="recursos-humanos" element={<RecursosHumanos />} />
          <Route path="clinicas" element={<Clinicas />} />
          <Route path="usuarios" element={
            <PrivateRoute>
              <Users />
            </PrivateRoute>
          } />
        </Route>
        
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App; 