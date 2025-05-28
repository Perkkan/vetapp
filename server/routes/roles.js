const express = require('express');
const router = express.Router();
// const rolesController = require('../controllers/rolesController'); // This controller does not exist yet
const { query } = require('../config/database'); // For direct DB interaction if no controller
const { verifyToken, hasRole, hasPermiso } = require('../middleware/auth');

// Apply verifyToken to all routes, and restrict further with hasRole/hasPermiso
router.use(verifyToken);

// Example: Get all roles (accessible by admin/superadmin)
router.get('/', hasRole(['superadmin', 'admin']), async (req, res) => {
    try {
        const [roles] = await query('SELECT id, nombre, descripcion FROM roles ORDER BY nombre');
        res.json(roles);
    } catch (error) {
        console.error("Error fetching roles:", error);
        res.status(500).json({ message: 'Error fetching roles' });
    }
});

// Example: Get a specific role by ID (accessible by admin/superadmin)
router.get('/:id', hasRole(['superadmin', 'admin']), async (req, res) => {
    try {
        const [role] = await query('SELECT id, nombre, descripcion FROM roles WHERE id = ?', [req.params.id]);
        if (!role.length) {
            return res.status(404).json({ message: 'Role not found' });
        }
        // Additionally, fetch permissions for this role
        const [permissions] = await query(
            `SELECT p.id, p.codigo, p.descripcion 
             FROM permisos p
             JOIN roles_permisos rp ON p.id = rp.permiso_id
             WHERE rp.rol_id = ?`,
            [req.params.id]
        );
        res.json({ ...role[0], permissions });
    } catch (error) {
        console.error("Error fetching role details:", error);
        res.status(500).json({ message: 'Error fetching role details' });
    }
});

// Example: Get all available permissions (for superadmin to assign)
router.get('/all-permissions', hasRole(['superadmin']), async (req, res) => {
    try {
        const [permissions] = await query('SELECT id, codigo, descripcion FROM permisos ORDER BY codigo');
        res.json(permissions);
    } catch (error) {
        console.error("Error fetching all permissions:", error);
        res.status(500).json({ message: 'Error fetching all permissions' });
    }
});

// Placeholder for creating a role (superadmin only)
router.post('/', hasRole(['superadmin']), (req, res) => {
    res.status(501).json({ message: 'Role creation not implemented yet' });
});

// Placeholder for updating a role (superadmin only)
router.put('/:id', hasRole(['superadmin']), (req, res) => {
    res.status(501).json({ message: 'Role update not implemented yet' });
});

// Placeholder for deleting a role (superadmin only)
router.delete('/:id', hasRole(['superadmin']), (req, res) => {
    res.status(501).json({ message: 'Role deletion not implemented yet' });
});

// Placeholder for assigning a permission to a role (superadmin only)
router.post('/:roleId/permissions', hasRole(['superadmin']), (req, res) => {
    // const { permissionId } = req.body;
    res.status(501).json({ message: 'Assigning permission to role not implemented yet' });
});

// Placeholder for removing a permission from a role (superadmin only)
router.delete('/:roleId/permissions/:permissionId', hasRole(['superadmin']), (req, res) => {
    res.status(501).json({ message: 'Removing permission from role not implemented yet' });
});

module.exports = router;
