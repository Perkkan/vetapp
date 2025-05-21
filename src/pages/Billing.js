import React, { useState, useEffect } from 'react';
import { Table, Form, Button, Modal, InputGroup, Badge, Alert, Tabs, Tab } from 'react-bootstrap';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaPrint, FaFileInvoice } from 'react-icons/fa';

const Billing = () => {
  // Estados para gestionar facturas
  const [facturas, setFacturas] = useState([]);
  const [filteredFacturas, setFilteredFacturas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentFactura, setCurrentFactura] = useState(null);
  const [formValidated, setFormValidated] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('pendientes');

  // Estados para el formulario de factura
  const [facturaForm, setFacturaForm] = useState({
    numero: '',
    fecha: new Date().toISOString().split('T')[0],
    cliente: '',
    nif: '',
    direccion: '',
    items: [],
    subtotal: 0,
    iva: 0,
    total: 0,
    formaPago: 'Efectivo',
    estado: 'Pendiente'
  });

  // Estado para gestionar productos/servicios a añadir
  const [currentItem, setCurrentItem] = useState({
    concepto: '',
    cantidad: 1,
    precioUnitario: 0,
    tipoIva: 21
  });

  // Datos de muestra para facturas
  const facturasMuestra = [
    {
      id: 1,
      numero: 'F2023-0001',
      fecha: '2023-05-15',
      cliente: 'Juan Pérez Rodríguez',
      nif: '12345678Z',
      direccion: 'Calle Mayor 10, 28001 Madrid',
      items: [
        { id: 1, concepto: 'Consulta veterinaria', cantidad: 1, precioUnitario: 50, tipoIva: 21 },
        { id: 2, concepto: 'Vacuna antirrábica', cantidad: 1, precioUnitario: 35, tipoIva: 10 }
      ],
      subtotal: 85,
      iva: 14,
      total: 99,
      formaPago: 'Tarjeta',
      estado: 'Pagada'
    },
    {
      id: 2,
      numero: 'F2023-0002',
      fecha: '2023-05-20',
      cliente: 'María Gómez López',
      nif: '87654321X',
      direccion: 'Avenida Constitución 25, 28002 Madrid',
      items: [
        { id: 1, concepto: 'Hospitalización (2 días)', cantidad: 2, precioUnitario: 80, tipoIva: 21 },
        { id: 2, concepto: 'Medicación', cantidad: 1, precioUnitario: 45, tipoIva: 4 }
      ],
      subtotal: 205,
      iva: 35.6,
      total: 240.6,
      formaPago: 'Transferencia',
      estado: 'Pendiente'
    },
    {
      id: 3,
      numero: 'F2023-0003',
      fecha: '2023-05-22',
      cliente: 'Carlos Sánchez Martín',
      nif: '56781234Y',
      direccion: 'Calle Alcalá 100, 28009 Madrid',
      items: [
        { id: 1, concepto: 'Cirugía menor', cantidad: 1, precioUnitario: 180, tipoIva: 21 },
        { id: 2, concepto: 'Material quirúrgico', cantidad: 1, precioUnitario: 75, tipoIva: 21 }
      ],
      subtotal: 255,
      iva: 53.55,
      total: 308.55,
      formaPago: 'Efectivo',
      estado: 'Anulada'
    }
  ];

  // Cargar datos de muestra al iniciar
  useEffect(() => {
    setFacturas(facturasMuestra);
    filterFacturas(facturasMuestra, activeTab, searchTerm);
  }, []);

  // Filtrar facturas cuando cambia el término de búsqueda o la pestaña activa
  const filterFacturas = (facturas, tab, search) => {
    let filtered = facturas;

    // Filtrar por estado según la pestaña
    if (tab === 'pendientes') {
      filtered = filtered.filter(f => f.estado === 'Pendiente');
    } else if (tab === 'pagadas') {
      filtered = filtered.filter(f => f.estado === 'Pagada');
    } else if (tab === 'anuladas') {
      filtered = filtered.filter(f => f.estado === 'Anulada');
    }

    // Filtrar por término de búsqueda
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(f => 
        f.numero.toLowerCase().includes(searchLower) ||
        f.cliente.toLowerCase().includes(searchLower) ||
        f.nif.toLowerCase().includes(searchLower)
      );
    }

    setFilteredFacturas(filtered);
  };

  // Manejar cambio en la búsqueda
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    filterFacturas(facturas, activeTab, value);
  };

  // Manejar cambio de pestaña
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    filterFacturas(facturas, tab, searchTerm);
  };

  // Abrir modal para nueva factura
  const handleNewFactura = () => {
    // Generar número de factura automático
    const year = new Date().getFullYear();
    const count = facturas.length + 1;
    const numero = `F${year}-${count.toString().padStart(4, '0')}`;
    
    setFacturaForm({
      numero,
      fecha: new Date().toISOString().split('T')[0],
      cliente: '',
      nif: '',
      direccion: '',
      items: [],
      subtotal: 0,
      iva: 0,
      total: 0,
      formaPago: 'Efectivo',
      estado: 'Pendiente'
    });
    
    setCurrentFactura(null);
    setShowModal(true);
  };

  // Abrir modal para editar factura existente
  const handleEditFactura = (id) => {
    const factura = facturas.find(f => f.id === id);
    if (factura) {
      setFacturaForm({ ...factura });
      setCurrentFactura(factura);
      setShowModal(true);
    }
  };

  // Confirmar eliminación de factura
  const handleDeleteConfirm = () => {
    if (currentFactura) {
      const updatedFacturas = facturas.filter(f => f.id !== currentFactura.id);
      setFacturas(updatedFacturas);
      filterFacturas(updatedFacturas, activeTab, searchTerm);
      setShowDeleteModal(false);
      setCurrentFactura(null);
    }
  };

  // Guardar factura (nueva o editada)
  const handleSaveFactura = (e) => {
    e.preventDefault();
    
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setFormValidated(true);
      return;
    }

    // Calcular totales para asegurar consistencia
    const subtotal = facturaForm.items.reduce((sum, item) => 
      sum + (item.cantidad * item.precioUnitario), 0);
    
    const iva = facturaForm.items.reduce((sum, item) => 
      sum + (item.cantidad * item.precioUnitario * item.tipoIva / 100), 0);
    
    const total = subtotal + iva;

    const updatedFactura = {
      ...facturaForm,
      subtotal,
      iva,
      total
    };

    let updatedFacturas;

    if (currentFactura) {
      // Actualizar factura existente
      updatedFacturas = facturas.map(f => 
        f.id === currentFactura.id ? { ...updatedFactura, id: currentFactura.id } : f
      );
    } else {
      // Crear nueva factura
      updatedFacturas = [
        ...facturas, 
        { ...updatedFactura, id: facturas.length + 1 }
      ];
    }

    setFacturas(updatedFacturas);
    filterFacturas(updatedFacturas, activeTab, searchTerm);
    setShowModal(false);
    setFormValidated(false);
  };

  // Añadir item a la factura
  const handleAddItem = () => {
    if (!currentItem.concepto || currentItem.cantidad < 1 || currentItem.precioUnitario <= 0) {
      setError('Por favor, complete todos los campos del artículo correctamente.');
      return;
    }

    const newItem = {
      ...currentItem,
      id: facturaForm.items.length + 1
    };

    const updatedItems = [...facturaForm.items, newItem];
    
    // Calcular subtotal, IVA y total
    const subtotal = updatedItems.reduce((sum, item) => 
      sum + (item.cantidad * item.precioUnitario), 0);
    
    const iva = updatedItems.reduce((sum, item) => 
      sum + (item.cantidad * item.precioUnitario * item.tipoIva / 100), 0);
    
    const total = subtotal + iva;

    setFacturaForm({
      ...facturaForm,
      items: updatedItems,
      subtotal,
      iva,
      total
    });

    // Limpiar el formulario de item
    setCurrentItem({
      concepto: '',
      cantidad: 1,
      precioUnitario: 0,
      tipoIva: 21
    });

    setError('');
  };

  // Eliminar item de la factura
  const handleRemoveItem = (id) => {
    const updatedItems = facturaForm.items.filter(item => item.id !== id);
    
    // Recalcular totales
    const subtotal = updatedItems.reduce((sum, item) => 
      sum + (item.cantidad * item.precioUnitario), 0);
    
    const iva = updatedItems.reduce((sum, item) => 
      sum + (item.cantidad * item.precioUnitario * item.tipoIva / 100), 0);
    
    const total = subtotal + iva;

    setFacturaForm({
      ...facturaForm,
      items: updatedItems,
      subtotal,
      iva,
      total
    });
  };

  // Manejar cambios en el formulario principal
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFacturaForm({
      ...facturaForm,
      [name]: value
    });
  };

  // Manejar cambios en el formulario de item
  const handleItemChange = (e) => {
    const { name, value } = e.target;
    setCurrentItem({
      ...currentItem,
      [name]: name === 'cantidad' || name === 'precioUnitario' || name === 'tipoIva' 
        ? parseFloat(value) || 0 
        : value
    });
  };

  // Función para imprimir factura (simulada)
  const handlePrintFactura = (id) => {
    alert(`Imprimiendo factura ${id}...`);
    // Aquí se implementaría la lógica para generar el PDF e imprimirlo
  };

  // Función para obtener color según estado
  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Pendiente': return 'warning';
      case 'Pagada': return 'success';
      case 'Anulada': return 'danger';
      default: return 'secondary';
    }
  };

  // Formatear números como moneda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Facturación</h2>
        <Button variant="primary" onClick={handleNewFactura}>
          <FaPlus className="me-2" /> Nueva Factura
        </Button>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-6">
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Buscar por número, cliente o NIF..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </InputGroup>
            </div>
          </div>
          
          <Tabs
            activeKey={activeTab}
            onSelect={handleTabChange}
            className="mb-3"
          >
            <Tab eventKey="todas" title="Todas">
              <FacturasTable 
                facturas={filteredFacturas} 
                onEdit={handleEditFactura}
                onDelete={(factura) => {
                  setCurrentFactura(factura);
                  setShowDeleteModal(true);
                }}
                onPrint={handlePrintFactura}
                formatCurrency={formatCurrency}
                getEstadoColor={getEstadoColor}
              />
            </Tab>
            <Tab eventKey="pendientes" title="Pendientes">
              <FacturasTable 
                facturas={filteredFacturas} 
                onEdit={handleEditFactura}
                onDelete={(factura) => {
                  setCurrentFactura(factura);
                  setShowDeleteModal(true);
                }}
                onPrint={handlePrintFactura}
                formatCurrency={formatCurrency}
                getEstadoColor={getEstadoColor}
              />
            </Tab>
            <Tab eventKey="pagadas" title="Pagadas">
              <FacturasTable 
                facturas={filteredFacturas} 
                onEdit={handleEditFactura}
                onDelete={(factura) => {
                  setCurrentFactura(factura);
                  setShowDeleteModal(true);
                }}
                onPrint={handlePrintFactura}
                formatCurrency={formatCurrency}
                getEstadoColor={getEstadoColor}
              />
            </Tab>
            <Tab eventKey="anuladas" title="Anuladas">
              <FacturasTable 
                facturas={filteredFacturas} 
                onEdit={handleEditFactura}
                onDelete={(factura) => {
                  setCurrentFactura(factura);
                  setShowDeleteModal(true);
                }}
                onPrint={handlePrintFactura}
                formatCurrency={formatCurrency}
                getEstadoColor={getEstadoColor}
              />
            </Tab>
          </Tabs>
        </div>
      </div>

      {/* Modal para nueva factura o edición */}
      <Modal 
        show={showModal} 
        onHide={() => setShowModal(false)} 
        size="lg"
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {currentFactura ? 'Editar Factura' : 'Nueva Factura'}
          </Modal.Title>
        </Modal.Header>
        <Form noValidate validated={formValidated} onSubmit={handleSaveFactura}>
          <Modal.Body>
            <div className="row mb-3">
              <div className="col-md-4">
                <Form.Group>
                  <Form.Label>Número de Factura</Form.Label>
                  <Form.Control
                    type="text"
                    name="numero"
                    value={facturaForm.numero}
                    onChange={handleFormChange}
                    disabled
                  />
                </Form.Group>
              </div>
              <div className="col-md-4">
                <Form.Group>
                  <Form.Label>Fecha</Form.Label>
                  <Form.Control
                    type="date"
                    name="fecha"
                    value={facturaForm.fecha}
                    onChange={handleFormChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    La fecha es obligatoria
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
              <div className="col-md-4">
                <Form.Group>
                  <Form.Label>Estado</Form.Label>
                  <Form.Select
                    name="estado"
                    value={facturaForm.estado}
                    onChange={handleFormChange}
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="Pagada">Pagada</option>
                    <option value="Anulada">Anulada</option>
                  </Form.Select>
                </Form.Group>
              </div>
            </div>
            
            <div className="row mb-3">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Cliente</Form.Label>
                  <Form.Control
                    type="text"
                    name="cliente"
                    value={facturaForm.cliente}
                    onChange={handleFormChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    El cliente es obligatorio
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>NIF/CIF</Form.Label>
                  <Form.Control
                    type="text"
                    name="nif"
                    value={facturaForm.nif}
                    onChange={handleFormChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    El NIF/CIF es obligatorio
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
            </div>
            
            <Form.Group className="mb-3">
              <Form.Label>Dirección</Form.Label>
              <Form.Control
                type="text"
                name="direccion"
                value={facturaForm.direccion}
                onChange={handleFormChange}
                required
              />
              <Form.Control.Feedback type="invalid">
                La dirección es obligatoria
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Forma de Pago</Form.Label>
              <Form.Select
                name="formaPago"
                value={facturaForm.formaPago}
                onChange={handleFormChange}
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Bizum">Bizum</option>
              </Form.Select>
            </Form.Group>
            
            <hr className="my-4" />
            
            <h5>Artículos / Servicios</h5>
            
            {error && <Alert variant="danger">{error}</Alert>}
            
            <div className="row mb-3">
              <div className="col-md-4">
                <Form.Group>
                  <Form.Label>Concepto</Form.Label>
                  <Form.Control
                    type="text"
                    name="concepto"
                    value={currentItem.concepto}
                    onChange={handleItemChange}
                  />
                </Form.Group>
              </div>
              <div className="col-md-2">
                <Form.Group>
                  <Form.Label>Cantidad</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    name="cantidad"
                    value={currentItem.cantidad}
                    onChange={handleItemChange}
                  />
                </Form.Group>
              </div>
              <div className="col-md-3">
                <Form.Group>
                  <Form.Label>Precio (€)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    name="precioUnitario"
                    value={currentItem.precioUnitario}
                    onChange={handleItemChange}
                  />
                </Form.Group>
              </div>
              <div className="col-md-2">
                <Form.Group>
                  <Form.Label>IVA (%)</Form.Label>
                  <Form.Select
                    name="tipoIva"
                    value={currentItem.tipoIva}
                    onChange={handleItemChange}
                  >
                    <option value="21">21%</option>
                    <option value="10">10%</option>
                    <option value="4">4%</option>
                    <option value="0">0%</option>
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-1 d-flex align-items-end">
                <Button 
                  variant="success" 
                  onClick={handleAddItem}
                  className="mb-2"
                >
                  <FaPlus />
                </Button>
              </div>
            </div>
            
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Concepto</th>
                  <th>Cantidad</th>
                  <th>Precio</th>
                  <th>IVA</th>
                  <th>Subtotal</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {facturaForm.items.map((item, idx) => (
                  <tr key={item.id}>
                    <td>{idx + 1}</td>
                    <td>{item.concepto}</td>
                    <td>{item.cantidad}</td>
                    <td>{formatCurrency(item.precioUnitario)}</td>
                    <td>{item.tipoIva}%</td>
                    <td>{formatCurrency(item.cantidad * item.precioUnitario)}</td>
                    <td>
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
                {facturaForm.items.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center">
                      No hay artículos en esta factura
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="5" className="text-end"><strong>Subtotal:</strong></td>
                  <td colSpan="2">{formatCurrency(facturaForm.subtotal)}</td>
                </tr>
                <tr>
                  <td colSpan="5" className="text-end"><strong>IVA:</strong></td>
                  <td colSpan="2">{formatCurrency(facturaForm.iva)}</td>
                </tr>
                <tr>
                  <td colSpan="5" className="text-end"><strong>Total:</strong></td>
                  <td colSpan="2">{formatCurrency(facturaForm.total)}</td>
                </tr>
              </tfoot>
            </Table>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              {currentFactura ? 'Actualizar' : 'Guardar'} Factura
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal de confirmación para eliminar */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentFactura && (
            <p>
              ¿Está seguro que desea eliminar la factura <strong>{currentFactura.numero}</strong> de <strong>{currentFactura.cliente}</strong>?
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

// Componente para la tabla de facturas
const FacturasTable = ({ facturas, onEdit, onDelete, onPrint, formatCurrency, getEstadoColor }) => {
  return (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>Número</th>
          <th>Fecha</th>
          <th>Cliente</th>
          <th>NIF/CIF</th>
          <th>Total</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {facturas.length > 0 ? (
          facturas.map(factura => (
            <tr key={factura.id}>
              <td>{factura.numero}</td>
              <td>{new Date(factura.fecha).toLocaleDateString('es-ES')}</td>
              <td>{factura.cliente}</td>
              <td>{factura.nif}</td>
              <td>{formatCurrency(factura.total)}</td>
              <td>
                <Badge bg={getEstadoColor(factura.estado)}>
                  {factura.estado}
                </Badge>
              </td>
              <td>
                <div className="d-flex gap-2">
                  <Button 
                    variant="primary" 
                    size="sm" 
                    onClick={() => onEdit(factura.id)}
                    disabled={factura.estado === 'Anulada'}
                  >
                    <FaEdit />
                  </Button>
                  <Button 
                    variant="danger" 
                    size="sm" 
                    onClick={() => onDelete(factura)}
                    disabled={factura.estado === 'Anulada'}
                  >
                    <FaTrash />
                  </Button>
                  <Button
                    variant="info"
                    size="sm"
                    onClick={() => onPrint(factura.id)}
                  >
                    <FaPrint />
                  </Button>
                </div>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="7" className="text-center">
              No hay facturas que mostrar
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
};

export default Billing; 