import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// IMPORTANTE: Modo desarrollo activado
const MODO_DESARROLLO = false;

// Datos de ejemplo para usuarios (los mismos que en Users.js)
const sampleUsers = [
  {
    id: 1,
    nombre: 'Administrador',
    email: 'admin@veterinaria.com',
    password: 'admin123', // En producción nunca almacenar contraseñas en texto plano
    telefono: '555-1234',
    rol: 'Administrador',
    estado: 'activo',
    fecha_registro: '2020-06-15'
  },
  {
    id: 2,
    nombre: 'Juan Pérez',
    email: 'juan.perez@veterinaria.com',
    password: 'juan123',
    telefono: '555-5678',
    rol: 'Recepcionista',
    estado: 'activo',
    fecha_registro: '2020-08-20'
  },
  {
    id: 3,
    nombre: 'María García',
    email: 'maria.garcia@veterinaria.com',
    password: 'maria123',
    telefono: '555-9012',
    rol: 'Veterinario',
    estado: 'activo',
    fecha_registro: '2021-02-10'
  },
  {
    id: 4,
    nombre: 'Carlos López',
    email: 'carlos.lopez@veterinaria.com',
    password: 'carlos123',
    telefono: '555-3456',
    rol: 'Asistente',
    estado: 'inactivo',
    fecha_registro: '2020-11-05'
  },
  {
    id: 5,
    nombre: 'Ana Martínez',
    email: 'ana.martinez@veterinaria.com',
    password: 'ana123',
    telefono: '555-7890',
    rol: 'Administrador',
    estado: 'activo',
    fecha_registro: '2021-05-15'
  }
];

// Usuarios de ejemplo para modo desarrollo
const usuariosEjemplo = [
  {
    id: 1,
    nombre: 'Admin',
    apellido: 'Sistema',
    email: 'admin@veterinaria.com',
    password: 'admin123',
    tipo_usuario: 'ADMINISTRATIVO',
    estado: 'ACTIVO',
    permisos: [
      'ver_dashboard',
      'gestionar_usuarios',
      'gestionar_sala_espera',
      'ver_historiales',
      'gestionar_citas',
      'gestionar_veterinarios',
      'gestionar_recursos_humanos',
      'gestionar_compras',
      'gestionar_facturacion'
    ]
  },
  {
    id: 2,
    nombre: 'Vet',
    apellido: 'Ejemplo',
    email: 'vet@veterinaria.com',
    password: 'vet123',
    tipo_usuario: 'VETERINARIO',
    estado: 'ACTIVO',
    permisos: [
      'gestionar_pacientes',
      'ver_historiales',
      'gestionar_consultas',
      'gestionar_hospitalizacion',
      'gestionar_laboratorio'
    ]
  },
  {
    id: 3,
    nombre: 'Super',
    apellido: 'Admin',
    email: 'super@veterinaria.com',
    password: 'super123',
    tipo_usuario: 'SUPERUSUARIO',
    estado: 'ACTIVO',
    permisos: [
      'gestionar_clinicas',
      'crear_usuarios'
    ]
  }
];

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [usuarios, setUsuarios] = useState([...sampleUsers]);
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        // Verificar token y datos de usuario en localStorage
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');
        const localUsers = localStorage.getItem('localUsers');
        
        console.log('Inicializando autenticación:', { 
          hayToken: !!token, 
          hayUserData: !!userData 
        });
        
        if (token && userData) {
          try {
            // Parsear los datos del usuario
            const parsedUserData = JSON.parse(userData);
            
            // Asegurar que los datos son consistentes
            const processedUserData = procesarDatosUsuario(parsedUserData, 'storage');
            
            console.log('Usuario recuperado de localStorage:', {
              id: processedUserData.id,
              nombre: processedUserData.nombre,
              tipo_usuario: processedUserData.tipo_usuario,
              permisos: processedUserData.permisos
            });
            
            // Establecer el usuario y marcar como autenticado
            setUser(processedUserData);
            setIsAuthenticated(true);
          } catch (error) {
            console.error('Error al analizar datos de usuario:', error);
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          // Si no hay token o userData, el usuario no está autenticado
          console.log('No hay token o datos de usuario en localStorage');
          setIsAuthenticated(false);
          setUser(null);
        }
        
        // Cargar usuarios locales si están disponibles
        if (localUsers) {
          try {
            setUsuarios(JSON.parse(localUsers));
          } catch (error) {
            console.error('Error al cargar usuarios locales:', error);
            localStorage.setItem('localUsers', JSON.stringify(sampleUsers));
            setUsuarios([...sampleUsers]);
          }
        } else {
          localStorage.setItem('localUsers', JSON.stringify(sampleUsers));
          setUsuarios([...sampleUsers]);
        }
      } catch (error) {
        console.error('Error en la inicialización de autenticación:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
  }, []);
  
  // Función para determinar la ruta de redirección basada en el tipo de usuario
  const getRedirectPath = (userType) => {
    switch(userType) {
      case 'SUPERUSUARIO':
        return '/clinicas';
      case 'ADMINISTRATIVO':
      case 'Administrador':
        return '/';
      case 'VETERINARIO':
      case 'Veterinario':
        return '/pacientes';
      case 'Recepcionista':
        return '/sala-espera';
      case 'Asistente':
        return '/pacientes';
      default:
        return '/';
    }
  };
  
  // Asegurarse de que se incluya el id_clinica en el objeto de usuario
  const procesarDatosUsuario = (userData, source = 'api') => {
    // Verificar si ya existe un ID de clínica
    if (!userData.id_clinica && source === 'api') {
      console.log('Usuario sin id_clinica, asignando clínica por defecto');
      userData.id_clinica = 1; // Valor por defecto si no viene en la respuesta
    }
    
    // Asegurarse de que el usuario tenga un array de permisos
    if (!userData.permisos) {
      console.log('Usuario sin permisos, asignando permisos básicos');
      userData.permisos = ['ver_dashboard']; // Permiso mínimo para todos los usuarios
    } else if (!Array.isArray(userData.permisos)) {
      console.log('Permisos no es un array, corrigiendo formato');
      userData.permisos = ['ver_dashboard'];
    }
    
    // Asegurarse de que el administrativo tenga el permiso para gestionar usuarios
    if (userData.tipo_usuario === 'ADMINISTRATIVO' && 
        Array.isArray(userData.permisos) && 
        !userData.permisos.includes('gestionar_usuarios')) {
      console.log('Agregando permiso gestionar_usuarios al administrativo');
      userData.permisos.push('gestionar_usuarios');
    }
    
    // Permisos prohibidos para veterinarios
    const permisosProhibidosVeterinarios = [
      'gestionar_compras',
      'gestionar_facturacion',
      'gestionar_usuarios',
      'gestionar_recursos_humanos',
      'gestionar_veterinarios'
    ];
    
    // Si el usuario es veterinario, asegurarse de que no tenga permisos prohibidos
    if ((userData.tipo_usuario === 'VETERINARIO' || userData.tipo_usuario === 'Veterinario') && 
        Array.isArray(userData.permisos)) {
      console.log('Verificando y removiendo permisos prohibidos para veterinario');
      
      // Filtrar los permisos para eliminar los prohibidos
      userData.permisos = userData.permisos.filter(
        permiso => !permisosProhibidosVeterinarios.includes(permiso)
      );
    }
    
    // Asegurarse de que todos los usuarios tengan el permiso básico
    if (Array.isArray(userData.permisos) && !userData.permisos.includes('ver_dashboard')) {
      console.log('Agregando permiso básico ver_dashboard');
      userData.permisos.push('ver_dashboard');
    }
    
    return userData;
  };
  
  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Intentando iniciar sesión con:', { email, password });
      
      if (MODO_DESARROLLO) {
        console.log('Modo desarrollo activado - verificando con usuarios locales');
        
        // Verificar credenciales con los usuarios de ejemplo
        const usuarioEncontrado = usuariosEjemplo.find(
          u => u.email === email && u.password === password && u.estado === 'ACTIVO'
        );
        
        if (usuarioEncontrado) {
          console.log('Usuario encontrado en modo desarrollo:', usuarioEncontrado);
          
          // Crear objeto de usuario limpio (sin password)
          let userData = {
            id: usuarioEncontrado.id,
            nombre: usuarioEncontrado.nombre,
            apellido: usuarioEncontrado.apellido,
            email: usuarioEncontrado.email,
            tipo_usuario: usuarioEncontrado.tipo_usuario,
            permisos: usuarioEncontrado.permisos || [],
            id_clinica: usuarioEncontrado.id_clinica || 1
          };
          
          // Procesar los datos del usuario para asegurar la consistencia
          userData = procesarDatosUsuario(userData, 'local');
          
          // Guardar en localStorage
          const token = 'token-simulado-' + Date.now();
          localStorage.setItem('authToken', token);
          localStorage.setItem('userData', JSON.stringify(userData));
          
          console.log('Usuario guardado en localStorage:', userData);
          
          setUser(userData);
          setIsAuthenticated(true);
          setIsLoading(false);
          
          // Determinar ruta de redirección basada en el tipo de usuario
          const redirectPath = getRedirectPath(userData.tipo_usuario);
          console.log(`Redirigiendo a ${redirectPath} para usuario tipo ${userData.tipo_usuario}`);
          
          // Programar la redirección después de un breve retardo para asegurar que 
          // el estado se haya actualizado completamente
          setTimeout(() => {
            navigate(redirectPath);
          }, 500);
          
          return { success: true, message: 'Inicio de sesión exitoso' };
        } else {
          console.log('Credenciales inválidas en modo desarrollo');
          setError('Credenciales inválidas');
          setIsLoading(false);
          return { success: false, message: 'Credenciales inválidas' };
        }
      }

      // Configuración básica de Axios
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      // Intentar login con API de hospitalización (puerto 5000)
      console.log('Intentando con API de hospitalización (puerto 5000)');
      let response;
      try {
        response = await axios.post('http://localhost:5000/api/auth/login', 
          { email, password }, 
          config
        );
        console.log('Respuesta de API hospitalización:', response.data);
      } catch (error) {
        console.log('Error con API hospitalización:', error.message);
        
        // Si falla, intentar con API veterinaria (puerto 5001)
        console.log('Intentando con API veterinaria (puerto 5001)');
        try {
          response = await axios.post('http://localhost:5001/api/auth/login', 
            { email, password }, 
            config
          );
          console.log('Respuesta de API veterinaria:', response.data);
        } catch (err) {
          console.log('Error con API veterinaria:', err.message);
          throw new Error('No se pudo conectar con ninguna API');
        }
      }

      // Procesar respuesta (asumiendo estructura similar en ambas APIs)
      if (response && response.data && response.data.token) {
        // Asumiendo que la API devuelve un objeto usuario sin password
        const userData = procesarDatosUsuario(response.data.usuario);
        
        console.log('Datos de usuario procesados:', userData);
        
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userData', JSON.stringify(userData));
        
        setUser(userData);
        setIsAuthenticated(true);
        setIsLoading(false);
        
        // Determinar ruta de redirección basada en el tipo de usuario
        const redirectPath = getRedirectPath(userData.tipo_usuario);
        console.log(`Redirigiendo a ${redirectPath} para usuario tipo ${userData.tipo_usuario}`);
        
        // Programar la redirección después de un breve retardo
        setTimeout(() => {
          navigate(redirectPath);
        }, 500);
        
        return { success: true, message: 'Inicio de sesión exitoso' };
      } else {
        throw new Error('Respuesta de API inválida');
      }
    } catch (error) {
      console.error('Error en login:', error);
      setError(error.message || 'Error al iniciar sesión');
      setIsLoading(false);
      return { success: false, message: error.message || 'Error al iniciar sesión' };
    }
  };
  
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
    navigate('/login');
  };
  
  const value = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated,
    error,
    // Helper para verificar permisos
    hasPermission: (permission) => {
      if (!user || !user.permisos || !Array.isArray(user.permisos)) {
        return false;
      }
      return user.permisos.includes(permission);
    },
    // Helper para obtener la clínica del usuario
    getUserClinic: () => {
      return user ? user.id_clinica : null;
    }
  };
  
  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}; 