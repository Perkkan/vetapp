import React from 'react';
import { Navbar as BootstrapNavbar, Container, Nav, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { FaSignOutAlt, FaUser } from 'react-icons/fa';

const Navbar = () => {
  const { currentUser, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <BootstrapNavbar bg="white" expand="lg" className="border-bottom shadow-sm">
      <Container fluid>
        <BootstrapNavbar.Brand className="d-md-none">
          Sistema Veterinario
        </BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {currentUser && (
              <Nav.Link className="d-flex align-items-center">
                <FaUser className="me-1" />
                <span>{currentUser.nombre}</span>
              </Nav.Link>
            )}
            <Button 
              variant="outline-danger" 
              size="sm" 
              onClick={handleLogout}
              className="d-flex align-items-center ms-2"
            >
              <FaSignOutAlt className="me-1" />
              <span>Cerrar sesión</span>
            </Button>
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar; 