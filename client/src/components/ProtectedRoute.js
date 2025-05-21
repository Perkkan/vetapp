import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Componente de ruta protegida que verifica si el usuario tiene permiso para acceder.
 * 
 * @param {ReactNode} children - Componentes hijos a renderizar si el usuario tiene acceso
 * @param {string[]} requiredPermisos - Lista de permisos requeridos (al menos uno debe coincidir)
 * @param {string[]} requiredRoles - Lista de roles permitidos (al menos uno debe coincidir)
 * @param {boolean} redirectToLogin - Si es verdadero, redirige a /login si no hay usuario autenticado
 * @returns {ReactNode} Los componentes hijos o una redirección
 */
const ProtectedRoute = ({ 
  children, 
  requiredPermisos = [], 
  requiredRoles = [],
  redirectToLogin = true 
}) => {
  const { currentUser, hasPermiso, isSuperAdmin, isAdmin, isVeterinario, isRecepcionista, isPropietario } = useAuth();
  const location = useLocation();

  // Si no hay usuario autenticado
  if (!currentUser) {
    return redirectToLogin 
      ? <Navigate to="/login" state={{ from: location }} replace /> 
      : null;
  }

  // Los superadmin siempre tienen acceso
  if (isSuperAdmin) {
    return children;
  }

  // Verificar roles si se especifican
  if (requiredRoles.length > 0) {
    const userRoles = {
      admin: isAdmin,
      veterinario: isVeterinario,
      recepcionista: isRecepcionista,
      propietario: isPropietario
    };
    
    const hasRequiredRole = requiredRoles.some(role => userRoles[role]);
    
    if (!hasRequiredRole) {
      return <Navigate to="/forbidden" replace />;
    }
  }
  
  // Verificar permisos si se especifican
  if (requiredPermisos.length > 0) {
    const hasRequiredPermission = requiredPermisos.some(permiso => hasPermiso(permiso));
    
    if (!hasRequiredPermission) {
      return <Navigate to="/forbidden" replace />;
    }
  }

  // El usuario tiene permiso
  return children;
};

export default ProtectedRoute; 