import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5001';

// Función para realizar solicitudes HTTP
async function fetchAPI(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, options);
        const data = await response.json();
        return { status: response.status, data };
    } catch (error) {
        console.error(`Error en la solicitud a ${endpoint}:`, error);
        return { status: 500, error: error.message };
    }
}

// Función para imprimir resultados
function printResult(operation, result) {
    console.log('\n===================================');
    console.log(`OPERACIÓN: ${operation}`);
    console.log(`ESTADO: ${result.status}`);
    console.log('RESPUESTA:');
    console.log(JSON.stringify(result.data, null, 2));
    console.log('===================================\n');
}

// Función principal para ejecutar todas las pruebas
async function runTests() {
    console.log('INICIANDO PRUEBAS DE LA API VETERINARIA');
    
    let clinicaId, usuarioId, propietarioId, pacienteId, consultaId, hospitalizacionId, historiaId;
    
    // 1. Crear una clínica
    const clinicaResult = await fetchAPI('/clinicas', 'POST', {
        nombre: 'Clínica Veterinaria Test',
        direccion: 'Calle Test 123',
        telefono: '123456789',
        email: 'clinica@test.com'
    });
    printResult('Crear Clínica', clinicaResult);
    clinicaId = clinicaResult.data.id;

    // 2. Crear un usuario
    const usuarioResult = await fetchAPI('/usuarios', 'POST', {
        nombre: 'Dr. Test',
        email: 'doctor@test.com',
        password: 'password123',
        rol: 'veterinario',
        clinica_id: clinicaId
    });
    printResult('Crear Usuario', usuarioResult);
    usuarioId = usuarioResult.data.id;

    // 3. Obtener usuarios
    const usuariosResult = await fetchAPI('/usuarios');
    printResult('Obtener Usuarios', usuariosResult);

    // 4. Crear un propietario
    const propietarioResult = await fetchAPI('/propietarios', 'POST', {
        nombre: 'Propietario Test',
        apellido: 'Apellido Test',
        telefono: '987654321',
        email: 'propietario@test.com',
        direccion: 'Dirección Test'
    });
    printResult('Crear Propietario', propietarioResult);
    propietarioId = propietarioResult.data.id;

    // 5. Obtener propietarios
    const propietariosResult = await fetchAPI('/propietarios');
    printResult('Obtener Propietarios', propietariosResult);

    // 6. Crear un paciente
    const pacienteResult = await fetchAPI('/pacientes', 'POST', {
        nombre: 'Mascota Test',
        especie: 'Perro',
        raza: 'Labrador',
        color: 'Negro',
        fecha_nacimiento: '2020-01-01',
        peso: 25.5,
        propietario_id: propietarioId
    });
    printResult('Crear Paciente', pacienteResult);
    pacienteId = pacienteResult.data.id;

    // 7. Obtener pacientes
    const pacientesResult = await fetchAPI('/pacientes');
    printResult('Obtener Pacientes', pacientesResult);

    // 8. Crear una consulta
    const consultaResult = await fetchAPI('/consultas', 'POST', {
        paciente_id: pacienteId,
        veterinario_id: usuarioId,
        fecha: new Date().toISOString(),
        motivo: 'Revisión general',
        diagnostico: 'Paciente sano',
        tratamiento: 'Ninguno necesario',
        notas: 'Paciente en buen estado general'
    });
    printResult('Crear Consulta', consultaResult);
    consultaId = consultaResult.data.id;

    // 9. Obtener consultas
    const consultasResult = await fetchAPI('/consultas');
    printResult('Obtener Consultas', consultasResult);

    // 10. Crear una hospitalización
    const hospitalizacionResult = await fetchAPI('/hospitalizaciones', 'POST', {
        paciente_id: pacienteId,
        veterinario_id: usuarioId,
        fecha_ingreso: new Date().toISOString(),
        motivo: 'Observación',
        estado: 'En tratamiento',
        notas: 'Paciente bajo observación'
    });
    printResult('Crear Hospitalización', hospitalizacionResult);
    hospitalizacionId = hospitalizacionResult.data.id;

    // 11. Obtener hospitalizaciones
    const hospitalizacionesResult = await fetchAPI('/hospitalizaciones');
    printResult('Obtener Hospitalizaciones', hospitalizacionesResult);

    // 12. Actualizar hospitalización
    const actualizarHospitalizacionResult = await fetchAPI(`/hospitalizaciones/${hospitalizacionId}`, 'PUT', {
        estado: 'Alta',
        fecha_salida: new Date().toISOString(),
        notas: 'Paciente dado de alta sin complicaciones'
    });
    printResult('Actualizar Hospitalización', actualizarHospitalizacionResult);

    // 13. Crear un historial médico
    const historiaResult = await fetchAPI('/historiales', 'POST', {
        paciente_id: pacienteId,
        fecha: new Date().toISOString(),
        tipo: 'Vacunación',
        descripcion: 'Vacuna antirrábica',
        veterinario_id: usuarioId
    });
    printResult('Crear Historial Médico', historiaResult);
    historiaId = historiaResult.data.id;

    // 14. Obtener historiales médicos por paciente
    const historialesResult = await fetchAPI(`/historiales/paciente/${pacienteId}`);
    printResult(`Obtener Historiales de Paciente ${pacienteId}`, historialesResult);

    console.log('PRUEBAS COMPLETADAS');
}

// Ejecutar todas las pruebas
runTests().catch(error => {
    console.error('Error en las pruebas:', error);
}); 