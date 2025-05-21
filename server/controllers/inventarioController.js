const { query, exec } = require('../config/database');

const inventarioController = {
    // Obtener todos los productos del inventario
    getAllProductos: async (req, res) => {
        try {
            const [rows] = await query('SELECT * FROM inventario ORDER BY nombre');
            res.json(rows);
        } catch (error) {
            console.error('Error al obtener inventario:', error);
            res.status(500).json({ message: 'Error al obtener el inventario' });
        }
    },

    // Obtener un producto por ID
    getProductoById: async (req, res) => {
        try {
            const [rows] = await query('SELECT * FROM inventario WHERE id = ?', [req.params.id]);
            if (rows.length === 0) {
                return res.status(404).json({ message: 'Producto no encontrado' });
            }
            res.json(rows[0]);
        } catch (error) {
            console.error('Error al obtener producto:', error);
            res.status(500).json({ message: 'Error al obtener el producto' });
        }
    },

    // Crear un nuevo producto
    createProducto: async (req, res) => {
        const { nombre, descripcion, cantidad, precio_unitario, categoria, stock_minimo } = req.body;
        try {
            const [result] = await exec(
                'INSERT INTO inventario (nombre, descripcion, cantidad, precio_unitario, categoria, stock_minimo) VALUES (?, ?, ?, ?, ?, ?)',
                [nombre, descripcion, cantidad, precio_unitario, categoria, stock_minimo || 5]
            );
            res.status(201).json({ id: result.insertId, message: 'Producto creado exitosamente' });
        } catch (error) {
            console.error('Error al crear producto:', error);
            res.status(500).json({ message: 'Error al crear el producto' });
        }
    },

    // Actualizar un producto
    updateProducto: async (req, res) => {
        const { nombre, descripcion, cantidad, precio_unitario, categoria, stock_minimo } = req.body;
        try {
            await exec(
                'UPDATE inventario SET nombre = ?, descripcion = ?, cantidad = ?, precio_unitario = ?, categoria = ?, stock_minimo = ? WHERE id = ?',
                [nombre, descripcion, cantidad, precio_unitario, categoria, stock_minimo, req.params.id]
            );
            res.json({ message: 'Producto actualizado exitosamente' });
        } catch (error) {
            console.error('Error al actualizar producto:', error);
            res.status(500).json({ message: 'Error al actualizar el producto' });
        }
    },

    // Eliminar un producto
    deleteProducto: async (req, res) => {
        try {
            await exec('DELETE FROM inventario WHERE id = ?', [req.params.id]);
            res.json({ message: 'Producto eliminado exitosamente' });
        } catch (error) {
            console.error('Error al eliminar producto:', error);
            res.status(500).json({ message: 'Error al eliminar el producto' });
        }
    },

    // Actualizar cantidad de producto (agregar o restar stock)
    updateStock: async (req, res) => {
        const { cantidad } = req.body;
        try {
            // Obtener el producto actual
            const [rows] = await query('SELECT * FROM inventario WHERE id = ?', [req.params.id]);
            if (rows.length === 0) {
                return res.status(404).json({ message: 'Producto no encontrado' });
            }
            
            const producto = rows[0];
            const nuevaCantidad = producto.cantidad + parseInt(cantidad);
            
            // Actualizar la cantidad
            await exec(
                'UPDATE inventario SET cantidad = ? WHERE id = ?',
                [nuevaCantidad, req.params.id]
            );
            
            res.json({ 
                message: 'Stock actualizado exitosamente',
                cantidad_anterior: producto.cantidad,
                cantidad_nueva: nuevaCantidad
            });
        } catch (error) {
            console.error('Error al actualizar stock:', error);
            res.status(500).json({ message: 'Error al actualizar el stock' });
        }
    }
};

module.exports = inventarioController; 