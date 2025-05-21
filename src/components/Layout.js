import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { Container, Row, Col } from 'react-bootstrap';

const Layout = () => {
  return (
    <Container fluid className="p-0">
      <Row className="g-0">
        <Col md={3} lg={2} className="sidebar">
          <Sidebar />
        </Col>
        <Col md={9} lg={10} className="content-area">
          <Navbar />
          <Container className="py-3">
            <Outlet />
          </Container>
        </Col>
      </Row>
    </Container>
  );
};

export default Layout; 