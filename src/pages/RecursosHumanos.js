import React from 'react';
import { Container } from 'react-bootstrap';
import RecursosHumanosForm from '../components/RecursosHumanosForm';

const RecursosHumanos = () => {
  return (
    <Container>
      <h2 className="my-4">Módulo de Recursos Humanos</h2>
      <RecursosHumanosForm />
    </Container>
  );
};

export default RecursosHumanos; 