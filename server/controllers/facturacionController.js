const { query, exec } = require('../config/database');

// Función para generar un ID de factura único
const generarIdFactura = () => {
    const año = new Date().getFullYear();
    const numeroAleatorio = Math.floor(1000 + Math.random() * 9000);
    return `F${año}-${numeroAleatorio}`;
};

const facturacionController = {
    // Obtener todas las facturas
    getAllFacturas: async (req, res) => {
        try {
            const [facturas] = await query(`
                SELECT f.*, p.nombre as cliente, p.nif 
                FROM facturas f
                LEFT JOIN propietarios p ON f.propietario_id = p.id
                ORDER BY f.fecha DESC
            `);
            res.json(facturas);
        } catch (error) {
            console.error('Error al obtener facturas:', error);
            res.status(500).json({ message: 'Error al obtener las facturas' });
        }
    },

    // Obtener una factura por ID
    getFacturaById: async (req, res) => {
        const facturaId = req.params.id;
        try {
            // Obtener información de la factura
            const [facturas] = await query(`
                SELECT f.*, p.nombre as cliente, p.nif, p.direccion, p.email, p.telefono 
                FROM facturas f
                LEFT JOIN propietarios p ON f.propietario_id = p.id
                WHERE f.id = ?
            `, [facturaId]);
            
            if (facturas.length === 0) {
                return res.status(404).json({ message: 'Factura no encontrada' });
            }
            
            const factura = facturas[0];
            
            // Obtener items de la factura
            const [items] = await query(`
                SELECT * FROM items_factura
                WHERE factura_id = ?
            `, [facturaId]);
            
            // Añadir los items a la factura
            factura.items = items;
            
            // Datos de la clínica (podrían venir de la configuración)
            factura.clinica = {
                nombre: 'Clínica Veterinaria VetAdmin',
                direccion: 'Avenida de la Veterinaria 45, 28001, Madrid',
                cif: 'B12345678',
                telefono: '910000000',
                email: 'info@vetadmin.es',
                web: 'www.vetadmin.es'
            };
            
            res.json(factura);
        } catch (error) {
            console.error('Error al obtener factura:', error);
            res.status(500).json({ message: 'Error al obtener la factura' });
        }
    },

    // Crear una nueva factura
    createFactura: async (req, res) => {
        const { 
            fecha, 
            propietario_id, 
            subtotal, 
            iva, 
            total, 
            estado, 
            forma_pago,
            items
        } = req.body;
        
        try {
            // Generar ID único para la factura
            const facturaId = generarIdFactura();
            
            // Insertar la factura
            await exec(
                'INSERT INTO facturas (id, fecha, propietario_id, subtotal, iva, total, estado, forma_pago) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [facturaId, fecha, propietario_id, subtotal, iva, total, estado || 'Pendiente', forma_pago || 'Efectivo']
            );
            
            // Insertar los items de la factura
            if (items && items.length > 0) {
                for (const item of items) {
                    await exec(
                        'INSERT INTO items_factura (factura_id, concepto, cantidad, precio_unitario, iva, subtotal) VALUES (?, ?, ?, ?, ?, ?)',
                        [facturaId, item.concepto, item.cantidad, item.precioUnitario, item.iva, item.subtotal]
                    );
                }
            }
            
            res.status(201).json({ id: facturaId, message: 'Factura creada exitosamente' });
        } catch (error) {
            console.error('Error al crear factura:', error);
            res.status(500).json({ message: 'Error al crear la factura' });
        }
    },

    // Actualizar una factura
    updateFactura: async (req, res) => {
        const facturaId = req.params.id;
        const { 
            fecha, 
            propietario_id, 
            subtotal, 
            iva, 
            total, 
            estado, 
            forma_pago,
            items
        } = req.body;
        
        try {
            // Actualizar la factura
            await exec(
                'UPDATE facturas SET fecha = ?, propietario_id = ?, subtotal = ?, iva = ?, total = ?, estado = ?, forma_pago = ? WHERE id = ?',
                [fecha, propietario_id, subtotal, iva, total, estado, forma_pago, facturaId]
            );
            
            // Eliminar los items anteriores
            await exec('DELETE FROM items_factura WHERE factura_id = ?', [facturaId]);
            
            // Insertar los nuevos items
            if (items && items.length > 0) {
                for (const item of items) {
                    await exec(
                        'INSERT INTO items_factura (factura_id, concepto, cantidad, precio_unitario, iva, subtotal) VALUES (?, ?, ?, ?, ?, ?)',
                        [facturaId, item.concepto, item.cantidad, item.precioUnitario, item.iva, item.subtotal]
                    );
                }
            }
            
            res.json({ message: 'Factura actualizada exitosamente' });
        } catch (error) {
            console.error('Error al actualizar factura:', error);
            res.status(500).json({ message: 'Error al actualizar la factura' });
        }
    },

    // Eliminar una factura
    deleteFactura: async (req, res) => {
        const facturaId = req.params.id;
        try {
            // Eliminar primero los items asociados (por restricción de clave foránea)
            await exec('DELETE FROM items_factura WHERE factura_id = ?', [facturaId]);
            
            // Luego eliminar la factura
            await exec('DELETE FROM facturas WHERE id = ?', [facturaId]);
            
            res.json({ message: 'Factura eliminada exitosamente' });
        } catch (error) {
            console.error('Error al eliminar factura:', error);
            res.status(500).json({ message: 'Error al eliminar la factura' });
        }
    }
};

module.exports = facturacionController; 