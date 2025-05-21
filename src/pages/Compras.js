import React from 'react';
import { Container } from 'react-bootstrap';
import ComprasForm from '../components/ComprasForm';

const Compras = () => {
  return (
    <Container>
      <h2 className="my-4">Módulo de Compras</h2>
      <ComprasForm />
    </Container>
  );
};

export default Compras; 