-- Asignar permisos al rol superadmin (todos los permisos)
INSERT INTO roles_permisos (rol_id, permiso_id)
SELECT 1, id FROM permisos;

-- Asignar permisos al rol admin
INSERT INTO roles_permisos (rol_id, permiso_id)
SELECT 2, id FROM permisos WHERE codigo IN (
    'pacientes_ver', 'pacientes_crear', 'pacientes_editar', 'pacientes_eliminar', 'pacientes_ver_por_propietario',
    'citas_ver', 'citas_crear', 'citas_editar', 'citas_eliminar',
    'historiales_ver', 'historiales_crear', 'historiales_editar', 'historiales_ver_por_paciente',
    'hospitalizacion_ver', 'hospitalizacion_crear', 'hospitalizacion_editar', 'hospitalizacion_alta',
    'inventario_ver', 'inventario_crear', 'inventario_editar', 'inventario_eliminar', 'inventario_actualizar_stock',
    'facturacion_ver', 'facturacion_crear', 'facturacion_editar', 'facturacion_eliminar',
    'sala_espera_ver', 'sala_espera_gestionar',
    'usuarios_ver', 'usuarios_crear', 'usuarios_editar'
);

-- Asignar permisos al rol veterinario
INSERT INTO roles_permisos (rol_id, permiso_id)
SELECT 3, id FROM permisos WHERE codigo IN (
    'pacientes_ver', 'pacientes_crear', 'pacientes_editar', 'pacientes_ver_por_propietario',
    'citas_ver', 'citas_crear', 'citas_editar',
    'historiales_ver', 'historiales_crear', 'historiales_editar', 'historiales_ver_por_paciente',
    'hospitalizacion_ver', 'hospitalizacion_crear', 'hospitalizacion_editar', 'hospitalizacion_alta',
    'sala_espera_ver', 'sala_espera_gestionar',
    'inventario_ver'
);

-- Asignar permisos al rol recepcionista
INSERT INTO roles_permisos (rol_id, permiso_id)
SELECT 4, id FROM permisos WHERE codigo IN (
    'pacientes_ver', 'pacientes_crear', 'pacientes_ver_por_propietario',
    'citas_ver', 'citas_crear', 'citas_editar',
    'sala_espera_ver', 'sala_espera_gestionar',
    'facturacion_ver', 'facturacion_crear'
);

-- Asignar permisos al rol propietario
INSERT INTO roles_permisos (rol_id, permiso_id)
SELECT 5, id FROM permisos WHERE codigo IN (
    'pacientes_ver',
    'citas_ver',
    'historiales_ver',
    'hospitalizacion_ver'
); 