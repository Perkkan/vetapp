import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { 
  FaUserInjured, 
  FaUserMd, 
  FaHospital, 
  FaCalendarAlt, 
  FaChartLine,
  FaPaw
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon, color, link }) => {
  return (
    <Card className="mb-4 shadow-sm">
      <Card.Body>
        <Link to={link} className="text-decoration-none">
          <Row>
            <Col xs={8}>
              <h6 className="text-muted">{title}</h6>
              <h4 className="fw-bold mb-0">{value}</h4>
            </Col>
            <Col xs={4} className="text-end">
              <div 
                className={`rounded-circle d-inline-flex align-items-center justify-content-center bg-${color} p-3`}
              >
                {icon}
              </div>
            </Col>
          </Row>
        </Link>
      </Card.Body>
    </Card>
  );
};

const Dashboard = () => {
  return (
    <div>
      <h2 className="mb-4">Dashboard</h2>
      
      <Row>
        <Col md={6} lg={4}>
          <StatCard 
            title="Pacientes en espera" 
            value="2"
            icon={<FaUserInjured size={24} className="text-white" />}
            color="primary"
            link="/sala-espera"
          />
        </Col>
        <Col md={6} lg={4}>
          <StatCard 
            title="Pacientes en consulta" 
            value="1"
            icon={<FaUserMd size={24} className="text-white" />}
            color="success"
            link="/sala-espera"
          />
        </Col>
        <Col md={6} lg={4}>
          <StatCard 
            title="Pacientes hospitalizados" 
            value="2"
            icon={<FaHospital size={24} className="text-white" />}
            color="warning"
            link="/sala-espera"
          />
        </Col>
        <Col md={6} lg={4}>
          <StatCard 
            title="Citas para hoy" 
            value="8"
            icon={<FaCalendarAlt size={24} className="text-white" />}
            color="info"
            link="/citas"
          />
        </Col>
        <Col md={6} lg={4}>
          <StatCard 
            title="Total pacientes" 
            value="154"
            icon={<FaPaw size={24} className="text-white" />}
            color="secondary"
            link="/pacientes"
          />
        </Col>
        <Col md={6} lg={4}>
          <StatCard 
            title="Consultas este mes" 
            value="42"
            icon={<FaChartLine size={24} className="text-white" />}
            color="dark"
            link="/consultas"
          />
        </Col>
      </Row>
      
      <Row className="mt-4">
        <Col lg={8}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <h5 className="card-title">Actividad reciente</h5>
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong>Firulais (Perro)</strong> - Ingresó a sala de espera
                    <div className="small text-muted">Hace 30 minutos</div>
                  </div>
                  <span className="badge bg-primary rounded-pill">Espera</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong>Michu (Gato)</strong> - Ingresó a sala de espera
                    <div className="small text-muted">Hace 15 minutos</div>
                  </div>
                  <span className="badge bg-primary rounded-pill">Espera</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong>Rocky (Perro)</strong> - Ingresó a consulta
                    <div className="small text-muted">Hace 20 minutos</div>
                  </div>
                  <span className="badge bg-success rounded-pill">Consulta</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong>Luna (Perro)</strong> - Hospitalizada tras cirugía
                    <div className="small text-muted">Hace 20 horas</div>
                  </div>
                  <span className="badge bg-warning rounded-pill">Hospitalizado</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong>Simba (Gato)</strong> - Hospitalizado por infección
                    <div className="small text-muted">Hace 10 horas</div>
                  </div>
                  <span className="badge bg-warning rounded-pill">Hospitalizado</span>
                </li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <h5 className="card-title">Accesos rápidos</h5>
              <div className="d-grid gap-2">
                <Link to="/sala-espera" className="btn btn-outline-primary">
                  <FaUserInjured className="me-2" />
                  Sala de espera
                </Link>
                <Link to="/pacientes" className="btn btn-outline-secondary">
                  <FaPaw className="me-2" />
                  Registrar paciente
                </Link>
                <Link to="/citas" className="btn btn-outline-info">
                  <FaCalendarAlt className="me-2" />
                  Agendar cita
                </Link>
                <Link to="/hospitalizacion" className="btn btn-outline-warning">
                  <FaHospital className="me-2" />
                  Ver hospitalizados
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 