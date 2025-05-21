import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Mapeo de rutas a permisos necesarios
const RUTAS_PERMISOS = {
  // Rutas para Superusuario
  '/clinicas': 'gestionar_clinicas',
  
  // Rutas para Administrativo
  '/': 'ver_dashboard',
  '/sala-espera': 'gestionar_sala_espera',
  '/historiales': 'ver_historiales',
  '/citas': 'gestionar_citas',
  '/veterinarios': 'gestionar_veterinarios',
  '/recursos-humanos': 'gestionar_recursos_humanos',
  '/compras': 'gestionar_compras',
  '/facturacion': 'gestionar_facturacion',
  '/usuarios': 'gestionar_usuarios',
  
  // Rutas para Veterinario
  '/pacientes': 'gestionar_pacientes',
  '/pacientes/historial': 'ver_historiales',
  '/consultas': 'gestionar_consultas',
  '/hospitalizacion': 'gestionar_hospitalizacion',
  '/laboratorio': 'gestionar_laboratorio'
};

// Rutas prohibidas específicamente para veterinarios
const RUTAS_PROHIBIDAS_VETERINARIOS = [
  '/compras',
  '/facturacion',
  '/usuarios', 
  '/recursos-humanos',
  '/veterinarios'
];

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();
  
  // Mostrar spinner durante la carga
  if (isLoading) {
    console.log('PrivateRoute: Cargando...');
    return <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Cargando...</span>
      </div>
    </div>;
  }
  
  // Redirigir a login si no está autenticado
  if (!isAuthenticated) {
    console.log('PrivateRoute: Usuario no autenticado, redirigiendo a login');
    return <Navigate to="/login" replace />;
  }
  
  // Verificación exhaustiva de que user existe
  if (!user) {
    console.error('PrivateRoute: Error - Usuario no definido en el contexto de autenticación');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    return <Navigate to="/login" replace />;
  }
  
  console.log('PrivateRoute: Usuario autenticado', {
    pathname: location.pathname,
    user: {
      id: user.id,
      nombre: user.nombre,
      tipo_usuario: user.tipo_usuario,
      permisos: user.permisos
    }
  });
  
  // Verificar permisos para la ruta actual
  const currentPath = location.pathname;
  
  // Verificar si el usuario es veterinario y está intentando acceder a una ruta prohibida
  if (user.tipo_usuario === 'VETERINARIO' || user.tipo_usuario === 'Veterinario') {
    // Verificar si está intentando acceder a una ruta prohibida para veterinarios
    const rutaProhibida = RUTAS_PROHIBIDAS_VETERINARIOS.some(ruta => 
      currentPath === ruta || currentPath.startsWith(ruta + '/')
    );
    
    if (rutaProhibida) {
      console.log(`PrivateRoute: Veterinario intentando acceder a ruta prohibida: ${currentPath}`);
      return <Navigate to="/pacientes" replace />;
    }
  }
  
  // Pantalla de emergencia para usuario sin permisos
  if (!user.permisos || !Array.isArray(user.permisos) || user.permisos.length === 0) {
    console.error('PrivateRoute: Usuario sin permisos válidos');
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">
          <h4>Configuración de permisos incompleta</h4>
          <p>Tu cuenta no tiene los permisos necesarios configurados. Por favor contacta al administrador.</p>
          <p>Usuario: {user.nombre} ({user.email})</p>
          <p>Tipo: {user.tipo_usuario}</p>
          <button 
            className="btn btn-outline-primary"
            onClick={() => {
              localStorage.removeItem('authToken');
              localStorage.removeItem('userData');
              window.location.href = '/login';
            }}
          >
            Volver al login
          </button>
        </div>
      </div>
    );
  }
  
  // Encuentra la ruta que coincide (para manejar rutas con parámetros)
  const matchingRoute = Object.keys(RUTAS_PERMISOS).find(route => {
    // Manejo exacto
    if (currentPath === route) return true;
    
    // Manejo de rutas con parámetros (ej: /pacientes/historial/123)
    if (route.includes('/') && currentPath.startsWith(route)) return true;
    
    return false;
  });
  
  // Si la ruta actual no tiene un permiso específico definido, permitir acceso
  if (!matchingRoute) {
    console.log('PrivateRoute: Ruta sin permiso específico definido, permitiendo acceso');
    return children;
  }
  
  const requiredPermission = RUTAS_PERMISOS[matchingRoute];
  console.log(`PrivateRoute: Permiso requerido para ${currentPath}: ${requiredPermission}`);
  
  // Verificación completa del objeto user y sus propiedades
  if (!user.tipo_usuario) {
    console.error('PrivateRoute: Error - El usuario no tiene definido el tipo_usuario');
    return <Navigate to="/login" replace />;
  }
  
  // Si el usuario es administrador o superusuario, darle acceso a todo
  if (user.tipo_usuario === 'ADMINISTRATIVO' || user.tipo_usuario === 'SUPERUSUARIO') {
    console.log('PrivateRoute: Usuario es administrador o superusuario, permitiendo acceso a: ' + currentPath);
    return children;
  }
  
  // Si el usuario es superusuario, solo puede acceder a sus rutas específicas
  if (user.tipo_usuario === 'SUPERUSUARIO' && 
      requiredPermission !== 'gestionar_clinicas' && 
      requiredPermission !== 'crear_usuarios') {
    console.log('PrivateRoute: Superusuario intentando acceder a ruta no permitida, redirigiendo a /clinicas');
    return <Navigate to="/clinicas" replace />;
  }
  
  // 3. Verificar si tiene el permiso necesario
  let tienePermiso = false;
  try {
    tienePermiso = user.permisos.includes(requiredPermission);
    console.log(`PrivateRoute: Usuario ${tienePermiso ? 'tiene' : 'no tiene'} el permiso ${requiredPermission}`);
  } catch (error) {
    console.error('PrivateRoute: Error al verificar permisos:', error);
    tienePermiso = false;
  }
  
  if (!tienePermiso) {
    console.log(`PrivateRoute: Usuario no tiene el permiso requerido: ${requiredPermission}`);
    
    // Redireccionar a una página según su rol
    if (user.tipo_usuario === 'ADMINISTRATIVO') {
      return <Navigate to="/" replace />;
    } else if (user.tipo_usuario === 'VETERINARIO') {
      return <Navigate to="/pacientes" replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  }
  
  // Si todo está correcto, mostrar el contenido protegido
  console.log('PrivateRoute: Usuario autorizado, mostrando contenido protegido');
  return children;
};

export default PrivateRoute; 