import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { clinicasService } from '../services/api';

// Crear el contexto
const AuthContext = createContext(null);

// Hook personalizado para acceder al contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// Proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentClinica, setCurrentClinica] = useState(null);
  const [userPermisos, setUserPermisos] = useState([]);
  const navigate = useNavigate();

  // Verificar si hay un usuario almacenado en localStorage al cargar
  useEffect(() => {
    try {
      console.log('Verificando usuario almacenado...');
      const storedUser = localStorage.getItem('user');
      const storedClinica = localStorage.getItem('clinica');
      const storedPermisos = localStorage.getItem('permisos');
      
      if (storedUser) {
        console.log('Usuario encontrado en localStorage');
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
        
        if (storedClinica) {
          setCurrentClinica(JSON.parse(storedClinica));
        }
        
        if (storedPermisos) {
          setUserPermisos(JSON.parse(storedPermisos));
        } else {
          // Si no hay permisos almacenados, los obtenemos
          fetchPermisos(parsedUser.id);
        }
      } else {
        console.log('No hay usuario en localStorage');
        setCurrentUser(null);
        setCurrentClinica(null);
        setUserPermisos([]);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('clinica');
        localStorage.removeItem('permisos');
      }
    } catch (error) {
      console.error('Error al verificar usuario:', error);
      setCurrentUser(null);
      setCurrentClinica(null);
      setUserPermisos([]);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('clinica');
      localStorage.removeItem('permisos');
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener permisos del usuario
  const fetchPermisos = async (userId) => {
    try {
      const response = await api.get(`/permisos/usuario/${userId}`);
      setUserPermisos(response.data.permisos || []);
      localStorage.setItem('permisos', JSON.stringify(response.data.permisos || []));
    } catch (error) {
      console.error('Error al obtener permisos del usuario:', error);
      setUserPermisos([]);
    }
  };

  // Función para iniciar sesión
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.success) {
        const { token, user } = response.data;
        
        // Guardar el token y el usuario en el almacenamiento local
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        setCurrentUser(user);
        
        // Obtener permisos del usuario
        await fetchPermisos(user.id);
        
        // Si el usuario tiene una clínica asignada, establecerla como actual
        if (user.clinica_id && user.rol !== 'superadmin') {
          try {
            const clinicaResponse = await clinicasService.getClinicaById(user.clinica_id);
            setCurrentClinica(clinicaResponse.data);
            localStorage.setItem('clinica', JSON.stringify(clinicaResponse.data));
          } catch (error) {
            console.error('Error al obtener la clínica del usuario:', error);
          }
        }
        
        return true;
      } else {
        setError(response.data.mensaje || 'Error al iniciar sesión');
        return false;
      }
    } catch (error) {
      console.error('Error en el login:', error);
      setError(error.response?.data?.mensaje || 'Error al conectar con el servidor');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('clinica');
    localStorage.removeItem('permisos');
    setCurrentUser(null);
    setCurrentClinica(null);
    setUserPermisos([]);
    navigate('/login');
  };

  // Verificar si el usuario tiene un permiso específico
  const hasPermiso = (permiso) => {
    // Si es superadmin, tiene todos los permisos
    if (currentUser?.rol === 'superadmin') {
      return true;
    }
    
    // Si no, comprobar si tiene el permiso específico
    return userPermisos.includes(permiso);
  };

  // Verificadores de rol
  const isSuperAdmin = currentUser?.rol === 'superadmin';
  const isAdmin = currentUser?.rol === 'admin' || isSuperAdmin;
  const isVeterinario = currentUser?.rol === 'veterinario';
  const isRecepcionista = currentUser?.rol === 'recepcionista';
  const isPropietario = currentUser?.rol === 'propietario';

  const cambiarClinica = async (clinicaId) => {
    try {
      setLoading(true);
      
      if (!currentUser || currentUser.rol !== 'superadmin') {
        throw new Error('Solo los superadministradores pueden cambiar de clínica');
      }
      
      const response = await clinicasService.cambiarClinicaActiva({
        userId: currentUser.id,
        clinicaId
      });
      
      setCurrentClinica(response.data.clinica);
      localStorage.setItem('clinica', JSON.stringify(response.data.clinica));
      
      return true;
    } catch (error) {
      console.error('Error al cambiar de clínica:', error);
      setError(error.response?.data?.message || 'Error al cambiar de clínica');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetClinica = () => {
    setCurrentClinica(null);
    localStorage.removeItem('clinica');
  };

  // Valores del contexto
  const value = {
    currentUser,
    currentClinica,
    loading,
    error,
    login,
    logout,
    isAdmin,
    isSuperAdmin,
    isVeterinario,
    isRecepcionista,
    isPropietario,
    hasPermiso,
    cambiarClinica,
    resetClinica
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <p>Cargando...</p>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export default AuthContext; 