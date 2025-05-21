/**
 * Script de prueba para la nueva API
 * Este script realiza peticiones a la nueva API para probar su funcionalidad
 */

const fetch = require('node-fetch');

// URL base de la API
const API_URL = 'http://localhost:5001/api';

// Función para realizar solicitudes a la API
async function fetchAPI(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer token_simulado'
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    console.error(`Error en la solicitud a ${endpoint}:`, error);
    throw error;
  }
}

// Función principal para ejecutar las pruebas
async function runTests() {
  console.log('=== INICIANDO PRUEBAS DE LA NUEVA API ===');
  try {
    // 1. Crear una clínica
    console.log('\n--- PRUEBA 1: Crear una clínica ---');
    const nuevaClinica = {
      nombre: 'Clínica de Prueba',
      direccion: 'Calle de Prueba 123',
      telefono: '555-123-4567',
      email_contacto: 'contacto@clinicaprueba.com'
    };
    
    const clinicaResponse = await fetchAPI('/clinicas', 'POST', nuevaClinica);
    console.log('Resultado:', clinicaResponse);
    
    if (clinicaResponse.status !== 201) {
      throw new Error('Error al crear la clínica');
    }
    
    const clinicaId = clinicaResponse.data.id;
    console.log(`Clínica creada con ID: ${clinicaId}`);
    
    // 2. Crear un usuario para la clínica
    console.log('\n--- PRUEBA 2: Crear un usuario ---');
    const nuevoUsuario = {
      id_clinica: clinicaId,
      email: 'veterinario@clinicaprueba.com',
      password: 'password123',
      nombre: 'Dr. Veterinario',
      tipo_usuario: 'VETERINARIO',
      telefono: '555-987-6543',
      email_contacto: 'veterinario@clinicaprueba.com'
    };
    
    const usuarioResponse = await fetchAPI('/usuarios', 'POST', nuevoUsuario);
    console.log('Resultado:', usuarioResponse);
    
    if (usuarioResponse.status !== 201) {
      throw new Error('Error al crear el usuario');
    }
    
    const usuarioId = usuarioResponse.data.id;
    console.log(`Usuario creado con ID: ${usuarioId}`);
    
    // 3. Crear un propietario
    console.log('\n--- PRUEBA 3: Crear un propietario ---');
    const nuevoPropietario = {
      id_clinica: clinicaId,
      nombre: 'Juan Pérez',
      telefono: '555-111-2222',
      email: 'juan@example.com',
      direccion: 'Av. Principal 456'
    };
    
    const propietarioResponse = await fetchAPI('/propietarios', 'POST', nuevoPropietario);
    console.log('Resultado:', propietarioResponse);
    
    if (propietarioResponse.status !== 201) {
      throw new Error('Error al crear el propietario');
    }
    
    const propietarioId = propietarioResponse.data.id;
    console.log(`Propietario creado con ID: ${propietarioId}`);
    
    // 4. Crear un paciente
    console.log('\n--- PRUEBA 4: Crear un paciente ---');
    const nuevoPaciente = {
      id_propietario: propietarioId,
      nombre: 'Firulais',
      especie: 'Canino',
      raza: 'Labrador',
      sexo: 'Macho',
      peso: 25.5,
      pelaje: 'Corto, color dorado',
      conducta: 'Amigable'
    };
    
    const pacienteResponse = await fetchAPI('/pacientes', 'POST', nuevoPaciente);
    console.log('Resultado:', pacienteResponse);
    
    if (pacienteResponse.status !== 201) {
      throw new Error('Error al crear el paciente');
    }
    
    const pacienteId = pacienteResponse.data.id;
    const idPaciente = pacienteResponse.data.id_paciente;
    console.log(`Paciente creado con ID: ${pacienteId}, ID de Paciente: ${idPaciente}`);
    
    // 5. Crear una hospitalización
    console.log('\n--- PRUEBA 5: Crear una hospitalización ---');
    const nuevaHospitalizacion = {
      id_paciente: idPaciente,
      id_clinica: clinicaId,
      id_veterinario: usuarioId,
      motivo: 'Trauma por accidente',
      procedimientos_realizados: 'Radiografías, inmovilización',
      medicacion_actual: 'Antibióticos y analgésicos',
      estado_paciente: 'Estable',
      fecha_prevista_alta: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 días después
    };
    
    const hospitalizacionResponse = await fetchAPI('/hospitalizaciones', 'POST', nuevaHospitalizacion);
    console.log('Resultado:', hospitalizacionResponse);
    
    if (hospitalizacionResponse.status !== 201) {
      throw new Error('Error al crear la hospitalización');
    }
    
    const hospitalizacionId = hospitalizacionResponse.data.id;
    console.log(`Hospitalización creada con ID: ${hospitalizacionId}`);
    
    // 6. Consultar los pacientes hospitalizados
    console.log('\n--- PRUEBA 6: Consultar pacientes hospitalizados ---');
    const hospitalizadosResponse = await fetchAPI('/hospitalizaciones');
    console.log('Pacientes hospitalizados:', hospitalizadosResponse.data);
    
    // 7. Actualizar la hospitalización
    console.log('\n--- PRUEBA 7: Actualizar hospitalización ---');
    const actualizacionHospitalizacion = {
      procedimientos_realizados: 'Radiografías, inmovilización, fisioterapia',
      medicacion_actual: 'Antibióticos, analgésicos y antiinflamatorios',
      estado_paciente: 'Mejorando'
    };
    
    const actualizacionResponse = await fetchAPI(`/hospitalizaciones/${hospitalizacionId}`, 'PUT', actualizacionHospitalizacion);
    console.log('Resultado de la actualización:', actualizacionResponse);
    
    // 8. Consultar el historial del paciente
    console.log('\n--- PRUEBA 8: Consultar historial del paciente ---');
    const historialResponse = await fetchAPI(`/historiales/paciente/${idPaciente}`);
    console.log('Historial del paciente:', historialResponse.data);
    
    // 9. Dar de alta al paciente
    console.log('\n--- PRUEBA 9: Dar de alta al paciente ---');
    const altaResponse = await fetchAPI(`/hospitalizaciones/${hospitalizacionId}/alta`, 'POST');
    console.log('Resultado del alta:', altaResponse.data);
    
    // 10. Crear una consulta
    console.log('\n--- PRUEBA 10: Crear una consulta ---');
    const nuevaConsulta = {
      id_paciente: idPaciente,
      id_clinica: clinicaId,
      id_veterinario: usuarioId,
      motivo: 'Revisión post-hospitalización',
      tipo: 'Control',
      diagnostico: 'Evolución favorable',
      tratamiento: 'Continuar con medicación por 5 días más',
      observaciones: 'Paciente recuperándose satisfactoriamente'
    };
    
    const consultaResponse = await fetchAPI('/consultas', 'POST', nuevaConsulta);
    console.log('Resultado:', consultaResponse);
    
    if (consultaResponse.status !== 201) {
      throw new Error('Error al crear la consulta');
    }
    
    const consultaId = consultaResponse.data.id;
    console.log(`Consulta creada con ID: ${consultaId}`);
    
    // 11. Consultar las consultas del paciente
    console.log('\n--- PRUEBA 11: Consultar consultas del paciente ---');
    const consultasResponse = await fetchAPI(`/consultas/paciente/${idPaciente}`);
    console.log('Consultas del paciente:', consultasResponse.data);
    
    // 12. Volver a consultar el historial completo del paciente
    console.log('\n--- PRUEBA 12: Historial completo del paciente ---');
    const historialFinalResponse = await fetchAPI(`/historiales/paciente/${idPaciente}`);
    console.log('Historial completo del paciente:', historialFinalResponse.data);
    
    console.log('\n=== PRUEBAS COMPLETADAS EXITOSAMENTE ===');
  } catch (error) {
    console.error('\n=== ERROR DURANTE LAS PRUEBAS ===');
    console.error(error);
  }
}

// Ejecutar las pruebas
runTests(); 