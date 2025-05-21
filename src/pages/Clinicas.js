import React from 'react';
import { Container } from 'react-bootstrap';
import ClinicasForm from '../components/ClinicasForm';

const Clinicas = () => {
  return (
    <Container>
      <h2 className="my-4">Módulo de Clínicas Afiliadas</h2>
      <ClinicasForm />
    </Container>
  );
};

export default Clinicas; 