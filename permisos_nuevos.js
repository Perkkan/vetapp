/**
 * Definición de permisos para el sistema
 */

// Definición de permisos individuales
const PERMISOS = {
  // Permisos de superusuario
  GESTIONAR_CLINICAS: 'gestionar_clinicas',
  CREAR_USUARIOS: 'crear_usuarios',
  
  // Permisos administrativos
  VER_DASHBOARD: 'ver_dashboard',
  GESTIONAR_CITAS: 'gestionar_citas',
  GESTIONAR_SALA_ESPERA: 'gestionar_sala_espera',
  VER_HISTORIALES: 'ver_historiales',
  GESTIONAR_VETERINARIOS: 'gestionar_veterinarios',
  GESTIONAR_RECURSOS_HUMANOS: 'gestionar_recursos_humanos',
  GESTIONAR_INVENTARIO: 'gestionar_inventario',
  GESTIONAR_COMPRAS: 'gestionar_compras',
  GESTIONAR_FACTURACION: 'gestionar_facturacion',
  
  // Permisos de veterinario
  GESTIONAR_PACIENTES: 'gestionar_pacientes',
  GESTIONAR_CONSULTAS: 'gestionar_consultas',
  GESTIONAR_HOSPITALIZACION: 'gestionar_hospitalizacion',
  GESTIONAR_LABORATORIO: 'gestionar_laboratorio'
};

// Definición de roles con sus permisos asociados
const ROLES = {
  SUPERUSUARIO: {
    nombre: 'Superusuario',
    permisos: [
      PERMISOS.GESTIONAR_CLINICAS,
      PERMISOS.CREAR_USUARIOS
    ]
  },
  ADMINISTRATIVO: {
    nombre: 'Administrativo',
    permisos: [
      PERMISOS.VER_DASHBOARD,
      PERMISOS.GESTIONAR_CITAS,
      PERMISOS.GESTIONAR_SALA_ESPERA,
      PERMISOS.VER_HISTORIALES,
      PERMISOS.GESTIONAR_VETERINARIOS,
      PERMISOS.GESTIONAR_RECURSOS_HUMANOS,
      PERMISOS.GESTIONAR_INVENTARIO,
      PERMISOS.GESTIONAR_COMPRAS,
      PERMISOS.GESTIONAR_FACTURACION
    ]
  },
  VETERINARIO: {
    nombre: 'Veterinario',
    permisos: [
      PERMISOS.GESTIONAR_PACIENTES,
      PERMISOS.VER_HISTORIALES,
      PERMISOS.GESTIONAR_CONSULTAS,
      PERMISOS.GESTIONAR_HOSPITALIZACION,
      PERMISOS.GESTIONAR_LABORATORIO,
      PERMISOS.GESTIONAR_SALA_ESPERA
    ]
  }
};

module.exports = {
  PERMISOS,
  ROLES
}; 