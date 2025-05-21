import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaHospital, 
  FaUserMd, 
  FaCalendarAlt, 
  FaPaw, 
  FaClipboardList,
  FaUserInjured,
  FaFlask,
  FaUserFriends,
  FaFileInvoiceDollar,
  FaHistory,
  FaShoppingCart,
  FaUsers
} from 'react-icons/fa';
import { Modal, Button } from 'react-bootstrap';
import { Nav } from 'react-bootstrap';

const Sidebar = () => {
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };
  
  // Menú completo, incluidas las opciones implementadas y no implementadas
  const menuItems = [
    {
      id: 1,
      title: 'Dashboard',
      path: '/',
      icon: <FaHome />,
      isImplemented: true
    },
    {
      id: 2,
      title: 'Pacientes',
      path: '/pacientes',
      icon: <FaPaw />,
      isImplemented: true
    },
    {
      id: 3,
      title: 'Recursos Humanos',
      path: '/recursos-humanos',
      icon: <FaUserFriends />,
      isImplemented: true
    },
    {
      id: 4,
      title: 'Citas',
      path: '/citas',
      icon: <FaCalendarAlt />,
      isImplemented: true
    },
    {
      id: 5,
      title: 'Veterinarios',
      path: '/veterinarios',
      icon: <FaUserMd />,
      isImplemented: true
    },
    {
      id: 6,
      title: 'Facturación',
      path: '/facturacion',
      icon: <FaFileInvoiceDollar />,
      isImplemented: true
    },
    {
      id: 7,
      title: 'Historiales',
      path: '/historiales',
      icon: <FaHistory />,
      isImplemented: true
    },
    {
      id: 8,
      title: 'Sala de Espera',
      path: '/sala-espera',
      icon: <FaUserInjured />,
      isImplemented: true
    },
    {
      id: 9,
      title: 'Hospitalización',
      path: '/hospitalizacion',
      icon: <FaHospital />,
      isImplemented: true
    },
    {
      id: 10,
      title: 'Consultas',
      path: '/consultas',
      icon: <FaClipboardList />,
      isImplemented: true
    },
    {
      id: 11,
      title: 'Laboratorio',
      path: '/laboratorio',
      icon: <FaFlask />,
      isImplemented: true
    },
    {
      id: 12,
      title: 'Compras',
      path: '/compras',
      icon: <FaShoppingCart />,
      isImplemented: true
    },
    {
      id: 13,
      title: 'Clínicas',
      path: '/clinicas',
      icon: <FaHospital />,
      isImplemented: true
    },
    {
      id: 14,
      title: 'Usuarios',
      path: '/usuarios',
      icon: <FaUsers />,
      isImplemented: true
    }
  ];
  
  const handleMenuItemClick = (item) => {
    if (!item.isImplemented) {
      setModalMessage(`La sección "${item.title}" está en desarrollo y se implementará en futuras actualizaciones.`);
      setShowModal(true);
      return false;
    }
    
    if (item.tabKey === 'hospitalized') {
      localStorage.setItem('waitingRoomTab', 'hospitalized');
    }
    
    return true;
  };
  
  return (
    <>
      <div className="d-flex flex-column flex-shrink-0 p-3 text-white h-100">
        <Link to="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
          <span className="fs-4">Veterinaria</span>
        </Link>
        <hr />
        <ul className="nav nav-pills flex-column mb-auto">
          {menuItems.map((item, index) => (
            <li key={index} className="nav-item">
              {item.isImplemented ? (
                <Link 
                  to={item.path} 
                  className={`nav-link text-white ${isActive(item.path)}`}
                  aria-current={isActive(item.path) ? 'page' : null}
                  onClick={() => handleMenuItemClick(item)}
                >
                  <div className="d-flex align-items-center">
                    <span className="me-2">{item.icon}</span>
                    <span>{item.title}</span>
                  </div>
                </Link>
              ) : (
                <a 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleMenuItemClick(item);
                  }}
                  className="nav-link text-white"
                >
                  <div className="d-flex align-items-center">
                    <span className="me-2">{item.icon}</span>
                    <span>{item.title}</span>
                  </div>
                </a>
              )}
            </li>
          ))}
        </ul>
        <hr />
        <div className="text-center text-white-50 small">
          <p>Sistema Veterinario v1.0</p>
        </div>
      </div>
      
      {/* Modal para mostrar mensaje de funcionalidad en desarrollo */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Módulo en Desarrollo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalMessage}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowModal(false)}>
            Entendido
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Sidebar; 