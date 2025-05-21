// Script para configurar un usuario de prueba
const setupTestUser = () => {
  console.log('Iniciando configuración del usuario superadministrador...');
  
  // Limpiar cualquier usuario existente
  localStorage.clear();
  
  // Crear usuario superadministrador
  const superAdminUser = {
    id: 1,
    nombre: 'Superadmin1',
    email: 'superadmin1@veterinaria.com',
    rol: 'superadministrador',
    token: 'superadmin-token-2025',
    permisos: ['pacientes', 'citas', 'historiales', 'veterinarios', 'usuarios', 'inventario', 'propietarios']
  };

  try {
    // Guardar el usuario en localStorage
    localStorage.setItem('currentUser', JSON.stringify(superAdminUser));
    console.log('Usuario superadministrador configurado exitosamente');
    console.log('Credenciales:');
    console.log('Usuario:', superAdminUser.nombre);
    console.log('Contraseña: Testeo2025');
    
    // Verificar que se guardó correctamente
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      console.log('Usuario verificado en localStorage:', storedUser);
    } else {
      console.error('Error: No se pudo verificar el usuario en localStorage');
    }
  } catch (error) {
    console.error('Error al configurar el usuario superadministrador:', error);
  }
};

// Ejecutar la configuración inmediatamente
setupTestUser(); 