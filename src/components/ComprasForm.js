import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Table, Card, Tabs, Tab, Alert, Spinner, Modal, Badge } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaSave, FaBoxOpen, FaShoppingCart, FaTimes } from 'react-icons/fa';
import axios from 'axios';

// URL base de la API
const API_URL = 'http://localhost:5001';

const ComprasForm = () => {
  // Estados para gestionar la interfaz
  const [activeTab, setActiveTab] = useState('compras');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Estados para las compras
  const [compras, setCompras] = useState([]);
  const [filtroCompras, setFiltroCompras] = useState('');
  const [compraSeleccionada, setCompraSeleccionada] = useState(null);
  const [showCompraDetalle, setShowCompraDetalle] = useState(false);

  // Estados para el inventario
  const [inventario, setInventario] = useState([]);
  const [filtroInventario, setFiltroInventario] = useState('');
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [showProductoForm, setShowProductoForm] = useState(false);

  // Estados para el formulario de nueva compra
  const [nuevaCompra, setNuevaCompra] = useState({
    id_clinica: 1, // Por defecto es la clínica 1
    proveedor: '',
    numero_factura: '',
    total: 0,
    usuario_id: 1, // Por defecto es el usuario 1
    items: []
  });
  const [itemTemporal, setItemTemporal] = useState({
    producto_id: null,
    nombre_producto: '',
    cantidad: 1,
    precio_unitario: 0,
    subtotal: 0
  });
  const [showNuevaCompraForm, setShowNuevaCompraForm] = useState(false);

  // Estados para el formulario de nuevo producto
  const [nuevoProducto, setNuevoProducto] = useState({
    id_clinica: 1, // Por defecto es la clínica 1
    nombre: '',
    descripcion: '',
    cantidad: 0,
    precio_compra: 0,
    precio_venta: 0,
    categoria: '',
    unidad_medida: ''
  });

  // Cargar datos iniciales
  useEffect(() => {
    if (activeTab === 'compras') {
      cargarCompras();
    } else if (activeTab === 'inventario') {
      cargarInventario();
    }
  }, [activeTab]);

  // Función para cargar las compras desde la API
  const cargarCompras = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/api/compras`);
      setCompras(response.data);
    } catch (err) {
      console.error('Error al cargar compras:', err);
      setError('Error al cargar las compras. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar el inventario desde la API
  const cargarInventario = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/api/inventario`);
      setInventario(response.data);
    } catch (err) {
      console.error('Error al cargar inventario:', err);
      setError('Error al cargar el inventario. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Función para crear una nueva compra
  const crearCompra = async () => {
    if (nuevaCompra.items.length === 0) {
      setError('Debe agregar al menos un producto a la compra');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/api/compras`, nuevaCompra);
      
      setSuccess('Compra registrada correctamente');
      setShowNuevaCompraForm(false);
      setNuevaCompra({
        id_clinica: 1,
        proveedor: '',
        numero_factura: '',
        total: 0,
        usuario_id: 1,
        items: []
      });
      
      // Recargar las compras y el inventario
      cargarCompras();
      cargarInventario();
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error al crear compra:', err);
      setError('Error al registrar la compra. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Función para crear o actualizar un producto
  const guardarProducto = async () => {
    if (!nuevoProducto.nombre) {
      setError('El nombre del producto es obligatorio');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const method = nuevoProducto.id ? 'put' : 'post';
      const response = await axios[method](`${API_URL}/api/inventario`, nuevoProducto);
      
      setSuccess('Producto guardado correctamente');
      setShowProductoForm(false);
      setNuevoProducto({
        id_clinica: 1,
        nombre: '',
        descripcion: '',
        cantidad: 0,
        precio_compra: 0,
        precio_venta: 0,
        categoria: '',
        unidad_medida: ''
      });
      
      // Recargar el inventario
      cargarInventario();
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error al guardar producto:', err);
      setError('Error al guardar el producto. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Función para agregar un item a la compra
  const agregarItemCompra = () => {
    if (!itemTemporal.nombre_producto) {
      setError('El nombre del producto es obligatorio');
      return;
    }
    
    if (!itemTemporal.cantidad || itemTemporal.cantidad <= 0) {
      setError('La cantidad debe ser mayor a 0');
      return;
    }
    
    if (!itemTemporal.precio_unitario || itemTemporal.precio_unitario <= 0) {
      setError('El precio unitario debe ser mayor a 0');
      return;
    }

    // Calcular subtotal
    const subtotal = itemTemporal.cantidad * itemTemporal.precio_unitario;
    const nuevoItem = {
      ...itemTemporal,
      subtotal
    };
    
    // Actualizar los items de la compra
    const nuevosItems = [...nuevaCompra.items, nuevoItem];
    
    // Calcular nuevo total
    const nuevoTotal = nuevosItems.reduce((total, item) => total + item.subtotal, 0);
    
    setNuevaCompra({
      ...nuevaCompra,
      items: nuevosItems,
      total: nuevoTotal
    });
    
    // Limpiar el formulario de item
    setItemTemporal({
      producto_id: null,
      nombre_producto: '',
      cantidad: 1,
      precio_unitario: 0,
      subtotal: 0
    });
    
    setError(null);
  };

  // Función para eliminar un item de la compra
  const eliminarItemCompra = (index) => {
    const nuevosItems = [...nuevaCompra.items];
    nuevosItems.splice(index, 1);
    
    // Recalcular total
    const nuevoTotal = nuevosItems.reduce((total, item) => total + item.subtotal, 0);
    
    setNuevaCompra({
      ...nuevaCompra,
      items: nuevosItems,
      total: nuevoTotal
    });
  };

  // Función para seleccionar un producto del inventario
  const seleccionarProducto = (producto) => {
    setItemTemporal({
      producto_id: producto.id,
      nombre_producto: producto.nombre,
      cantidad: 1,
      precio_unitario: producto.precio_compra || 0,
      subtotal: 0
    });
  };

  // Función para editar un producto existente
  const editarProducto = (producto) => {
    setNuevoProducto({
      id: producto.id,
      id_clinica: producto.id_clinica,
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      cantidad: producto.cantidad,
      precio_compra: producto.precio_compra,
      precio_venta: producto.precio_venta,
      categoria: producto.categoria || '',
      unidad_medida: producto.unidad_medida || ''
    });
    setShowProductoForm(true);
  };

  // Filtrar compras según el término de búsqueda
  const comprasFiltradas = compras.filter(compra => 
    compra.proveedor && compra.proveedor.toLowerCase().includes(filtroCompras.toLowerCase()) ||
    compra.numero_factura && compra.numero_factura.toLowerCase().includes(filtroCompras.toLowerCase())
  );

  // Filtrar inventario según el término de búsqueda
  const inventarioFiltrado = inventario.filter(producto => 
    producto.nombre.toLowerCase().includes(filtroInventario.toLowerCase()) ||
    (producto.categoria && producto.categoria.toLowerCase().includes(filtroInventario.toLowerCase()))
  );

  return (
    <Container fluid className="mt-4">
      <h2 className="mb-4">Gestión de Compras e Inventario</h2>
      
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert variant="success" onClose={() => setSuccess(null)} dismissible>
          {success}
        </Alert>
      )}
      
      <Tabs activeKey={activeTab} onSelect={k => setActiveTab(k)}>
        <Tab eventKey="compras" title={<span><FaShoppingCart /> Compras</span>}>
          <Card className="mt-3">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Lista de Compras</h5>
              <Button variant="success" onClick={() => setShowNuevaCompraForm(true)}>
                <FaPlus /> Nueva Compra
              </Button>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Control
                  type="text"
                  placeholder="Buscar por proveedor o número de factura..."
                  value={filtroCompras}
                  onChange={e => setFiltroCompras(e.target.value)}
                />
              </Form.Group>
              
              {loading ? (
                <div className="text-center my-4">
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : (
                <div className="table-responsive">
                  <Table striped hover>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Fecha</th>
                        <th>Proveedor</th>
                        <th>Factura</th>
                        <th>Total</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comprasFiltradas.length > 0 ? (
                        comprasFiltradas.map(compra => (
                          <tr key={compra.id}>
                            <td>{compra.id}</td>
                            <td>{new Date(compra.fecha).toLocaleDateString()}</td>
                            <td>{compra.proveedor || 'Sin proveedor'}</td>
                            <td>{compra.numero_factura || 'Sin número'}</td>
                            <td>${compra.total.toFixed(2)}</td>
                            <td>
                              <Badge bg={compra.estado === 'completada' ? 'success' : 'warning'}>
                                {compra.estado}
                              </Badge>
                            </td>
                            <td>
                              <Button 
                                variant="info" 
                                size="sm" 
                                onClick={() => {
                                  setCompraSeleccionada(compra);
                                  setShowCompraDetalle(true);
                                }}
                              >
                                <FaSearch /> Ver
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="text-center">No hay compras registradas</td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Tab>
        
        <Tab eventKey="inventario" title={<span><FaBoxOpen /> Inventario</span>}>
          <Card className="mt-3">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Inventario</h5>
              <Button variant="success" onClick={() => {
                setNuevoProducto({
                  id_clinica: 1,
                  nombre: '',
                  descripcion: '',
                  cantidad: 0,
                  precio_compra: 0,
                  precio_venta: 0,
                  categoria: '',
                  unidad_medida: ''
                });
                setShowProductoForm(true);
              }}>
                <FaPlus /> Nuevo Producto
              </Button>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Control
                  type="text"
                  placeholder="Buscar por nombre o categoría..."
                  value={filtroInventario}
                  onChange={e => setFiltroInventario(e.target.value)}
                />
              </Form.Group>
              
              {loading ? (
                <div className="text-center my-4">
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : (
                <div className="table-responsive">
                  <Table striped hover>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Nombre</th>
                        <th>Categoría</th>
                        <th>Cantidad</th>
                        <th>Unidad</th>
                        <th>Precio Compra</th>
                        <th>Precio Venta</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventarioFiltrado.length > 0 ? (
                        inventarioFiltrado.map(producto => (
                          <tr key={producto.id}>
                            <td>{producto.id}</td>
                            <td>{producto.nombre}</td>
                            <td>{producto.categoria || 'Sin categoría'}</td>
                            <td>{producto.cantidad}</td>
                            <td>{producto.unidad_medida || 'N/A'}</td>
                            <td>${producto.precio_compra ? producto.precio_compra.toFixed(2) : '0.00'}</td>
                            <td>${producto.precio_venta ? producto.precio_venta.toFixed(2) : '0.00'}</td>
                            <td>
                              <Button 
                                variant="primary" 
                                size="sm" 
                                className="me-1"
                                onClick={() => editarProducto(producto)}
                              >
                                <FaEdit />
                              </Button>
                              <Button 
                                variant="success" 
                                size="sm"
                                onClick={() => seleccionarProducto(producto)}
                                data-toggle="tooltip" 
                                title="Agregar a compra"
                              >
                                <FaPlus />
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="text-center">No hay productos en el inventario</td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
      
      {/* Modal para ver detalle de compra */}
      <Modal show={showCompraDetalle} onHide={() => setShowCompraDetalle(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Detalle de Compra #{compraSeleccionada?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {compraSeleccionada && (
            <>
              <Row>
                <Col md={6}>
                  <p><strong>Fecha:</strong> {new Date(compraSeleccionada.fecha).toLocaleString()}</p>
                  <p><strong>Proveedor:</strong> {compraSeleccionada.proveedor || 'Sin proveedor'}</p>
                  <p><strong>Número Factura:</strong> {compraSeleccionada.numero_factura || 'Sin número'}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Estado:</strong> {compraSeleccionada.estado}</p>
                  <p><strong>Realizada por:</strong> {compraSeleccionada.usuario_nombre || 'Usuario desconocido'}</p>
                  <p><strong>Total:</strong> ${compraSeleccionada.total.toFixed(2)}</p>
                </Col>
              </Row>
              
              <h5 className="mt-4">Productos Comprados</h5>
              <Table striped>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio Unitario</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {compraSeleccionada.items && compraSeleccionada.items.length > 0 ? (
                    compraSeleccionada.items.map((item, index) => (
                      <tr key={item.id}>
                        <td>{index + 1}</td>
                        <td>{item.nombre_producto}</td>
                        <td>{item.cantidad}</td>
                        <td>${item.precio_unitario.toFixed(2)}</td>
                        <td>${item.subtotal.toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center">No hay productos en esta compra</td>
                    </tr>
                  )}
                </tbody>
              </Table>
              
              {compraSeleccionada.notas && (
                <div className="mt-3">
                  <h5>Notas</h5>
                  <p>{compraSeleccionada.notas}</p>
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCompraDetalle(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Modal para nueva compra */}
      <Modal show={showNuevaCompraForm} onHide={() => setShowNuevaCompraForm(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Registrar Nueva Compra</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Proveedor</Form.Label>
                  <Form.Control
                    type="text"
                    value={nuevaCompra.proveedor}
                    onChange={e => setNuevaCompra({...nuevaCompra, proveedor: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Número de Factura</Form.Label>
                  <Form.Control
                    type="text"
                    value={nuevaCompra.numero_factura}
                    onChange={e => setNuevaCompra({...nuevaCompra, numero_factura: e.target.value})}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <h5 className="mt-3">Agregar Productos</h5>
            <Card className="mb-3">
              <Card.Body>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Producto</Form.Label>
                      <Form.Control
                        type="text"
                        value={itemTemporal.nombre_producto}
                        onChange={e => setItemTemporal({...itemTemporal, nombre_producto: e.target.value})}
                        placeholder="Buscar o ingresar nombre"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Cantidad</Form.Label>
                      <Form.Control
                        type="number"
                        min="1"
                        value={itemTemporal.cantidad}
                        onChange={e => setItemTemporal({
                          ...itemTemporal, 
                          cantidad: parseInt(e.target.value) || 0,
                          subtotal: (parseInt(e.target.value) || 0) * itemTemporal.precio_unitario
                        })}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Precio Unitario ($)</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        step="0.01"
                        value={itemTemporal.precio_unitario}
                        onChange={e => setItemTemporal({
                          ...itemTemporal, 
                          precio_unitario: parseFloat(e.target.value) || 0,
                          subtotal: itemTemporal.cantidad * (parseFloat(e.target.value) || 0)
                        })}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2} className="d-flex align-items-end">
                    <Button variant="primary" className="mb-3 w-100" onClick={agregarItemCompra}>
                      <FaPlus /> Agregar
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
            
            <h5>Productos en esta compra</h5>
            <Table striped>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio Unitario</th>
                  <th>Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {nuevaCompra.items.length > 0 ? (
                  nuevaCompra.items.map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{item.nombre_producto}</td>
                      <td>{item.cantidad}</td>
                      <td>${item.precio_unitario.toFixed(2)}</td>
                      <td>${item.subtotal.toFixed(2)}</td>
                      <td>
                        <Button variant="danger" size="sm" onClick={() => eliminarItemCompra(index)}>
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">No hay productos añadidos</td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="4" className="text-end"><strong>Total:</strong></td>
                  <td colSpan="2"><strong>${nuevaCompra.total.toFixed(2)}</strong></td>
                </tr>
              </tfoot>
            </Table>
            
            <Form.Group className="mb-3">
              <Form.Label>Notas (opcional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={nuevaCompra.notas || ''}
                onChange={e => setNuevaCompra({...nuevaCompra, notas: e.target.value})}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNuevaCompraForm(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={crearCompra} disabled={loading}>
            {loading ? <Spinner size="sm" animation="border" /> : <><FaSave /> Guardar Compra</>}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Modal para producto */}
      <Modal show={showProductoForm} onHide={() => setShowProductoForm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{nuevoProducto.id ? 'Editar Producto' : 'Nuevo Producto'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                value={nuevoProducto.nombre}
                onChange={e => setNuevoProducto({...nuevoProducto, nombre: e.target.value})}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={nuevoProducto.descripcion}
                onChange={e => setNuevoProducto({...nuevoProducto, descripcion: e.target.value})}
              />
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Cantidad</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    value={nuevoProducto.cantidad}
                    onChange={e => setNuevoProducto({...nuevoProducto, cantidad: parseInt(e.target.value) || 0})}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Unidad de Medida</Form.Label>
                  <Form.Control
                    type="text"
                    value={nuevoProducto.unidad_medida}
                    onChange={e => setNuevoProducto({...nuevoProducto, unidad_medida: e.target.value})}
                    placeholder="ej. unidad, kg, lt"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Precio Compra ($)</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    step="0.01"
                    value={nuevoProducto.precio_compra}
                    onChange={e => setNuevoProducto({...nuevoProducto, precio_compra: parseFloat(e.target.value) || 0})}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Precio Venta ($)</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    step="0.01"
                    value={nuevoProducto.precio_venta}
                    onChange={e => setNuevoProducto({...nuevoProducto, precio_venta: parseFloat(e.target.value) || 0})}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Categoría</Form.Label>
              <Form.Control
                type="text"
                value={nuevoProducto.categoria}
                onChange={e => setNuevoProducto({...nuevoProducto, categoria: e.target.value})}
                placeholder="ej. Medicamentos, Insumos, Alimentos"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowProductoForm(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={guardarProducto} disabled={loading}>
            {loading ? <Spinner size="sm" animation="border" /> : <><FaSave /> Guardar</>}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ComprasForm; 