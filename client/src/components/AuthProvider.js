import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/auth.service';

// Crear contexto de autenticación
const AuthContext = createContext(null);

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          
          // Verificar si el token todavía es válido
          const validToken = await authService.validateToken();
          
          if (validToken) {
            setUser(userData);
          } else {
            // Si el token no es válido, limpiar localStorage
            localStorage.removeItem('user');
            localStorage.removeItem('token');
          }
        }
      } catch (err) {
        console.error('Error al validar sesión:', err);
        setError('Error al validar la sesión');
        // Limpiar localStorage en caso de error
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // Función para iniciar sesión
  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);
      
      // Guardar token en localStorage
      localStorage.setItem('token', response.token);
      
      // Guardar información del usuario
      const userData = {
        id: response.id,
        nombre: response.nombre,
        email: response.email,
        rol: response.rol,
        permisos: response.permisos || [],
        clinicaId: response.clinicaId,
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al iniciar sesión';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  // Verificar si el usuario tiene un permiso específico
  const hasPermiso = (permiso) => {
    if (!user) return false;
    
    // Superadmin tiene todos los permisos
    if (user.rol === 'superadmin') return true;
    
    return user.permisos && user.permisos.includes(permiso);
  };

  // Verificar si el usuario tiene cualquiera de los permisos especificados
  const hasAnyPermiso = (permisos) => {
    if (!user || !permisos || permisos.length === 0) return false;
    
    // Superadmin tiene todos los permisos
    if (user.rol === 'superadmin') return true;
    
    return permisos.some(permiso => user.permisos && user.permisos.includes(permiso));
  };

  // Verificar si el usuario tiene un rol específico
  const hasRole = (role) => {
    if (!user) return false;
    return user.rol === role;
  };

  // Verificar si el usuario tiene cualquiera de los roles especificados
  const hasAnyRole = (roles) => {
    if (!user || !roles || roles.length === 0) return false;
    return roles.includes(user.rol);
  };

  // Crear objeto con valores y funciones que se proveerán a través del contexto
  const authValue = {
    user,
    loading,
    error,
    login,
    logout,
    hasPermiso,
    hasAnyPermiso,
    hasRole,
    hasAnyRole,
    isSuperAdmin: user?.rol === 'superadmin',
    isAdmin: user?.rol === 'admin' || user?.rol === 'superadmin',
    isVeterinario: user?.rol === 'veterinario',
    isPropietario: user?.rol === 'propietario',
    clinicaId: user?.clinicaId,
  };

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider; 