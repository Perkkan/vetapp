import GoHighLevelService from './GoHighLevelService';
import GHL_CONFIG from '../config/gohighlevel';

class CRMService {
    constructor() {
        this.ghlService = new GoHighLevelService();
    }

    // Sincronizar propietario con el CRM
    async syncPropietario(propietarioData) {
        try {
            // Crear o actualizar el contacto en GHL
            const contactData = {
                firstName: propietarioData.nombre.split(' ')[0], // Tomamos el primer nombre
                lastName: propietarioData.nombre.split(' ').slice(1).join(' '), // El resto como apellido
                email: propietarioData.email,
                phone: propietarioData.telefono,
                address1: propietarioData.direccion,
                taxNumber: propietarioData.nif,
                status: propietarioData.estado === 'Activo' ? 'active' : 'inactive',
                dateOfBirth: null, // No tenemos este dato en la BD
                tags: [GHL_CONFIG.CRM.TAG_PROPIETARIO],
                source: 'Veterinaria App',
                customFields: {
                    [GHL_CONFIG.CRM.CUSTOM_FIELDS.FECHA_REGISTRO]: propietarioData.fecha_registro,
                    [GHL_CONFIG.CRM.CUSTOM_FIELDS.NOTAS_PROPIETARIO]: propietarioData.notas,
                    [GHL_CONFIG.CRM.CUSTOM_FIELDS.NIF]: propietarioData.nif,
                    [GHL_CONFIG.CRM.CUSTOM_FIELDS.ESTADO_PROPIETARIO]: propietarioData.estado
                },
                locationId: GHL_CONFIG.LOCATION_ID
            };

            const contact = await this.ghlService.upsertContact(contactData);
            return contact;
        } catch (error) {
            console.error('Error al sincronizar propietario con CRM:', error);
            throw error;
        }
    }

    // Sincronizar paciente (mascota) con el CRM
    async syncPaciente(pacienteData, propietarioId) {
        try {
            // Obtener la edad en años desde la fecha de nacimiento
            const edad = pacienteData.fecha_nacimiento ? 
                Math.floor((new Date() - new Date(pacienteData.fecha_nacimiento)) / (1000 * 60 * 60 * 24 * 365)) : 
                null;

            // Crear oportunidad en el pipeline para el paciente
            const opportunityData = {
                name: `Paciente: ${pacienteData.nombre}`,
                pipelineId: GHL_CONFIG.CRM.PIPELINE_ID,
                stageId: pacienteData.estado === 'Activo' ? 
                    GHL_CONFIG.CRM.OPPORTUNITY_STAGE_ACTIVE : 
                    GHL_CONFIG.CRM.OPPORTUNITY_STAGE_COMPLETED,
                contactId: propietarioId,
                monetary_value: 0,
                status: pacienteData.estado.toLowerCase(),
                customFields: {
                    [GHL_CONFIG.CRM.CUSTOM_FIELDS.MASCOTA_NOMBRE]: pacienteData.nombre,
                    [GHL_CONFIG.CRM.CUSTOM_FIELDS.MASCOTA_ESPECIE]: pacienteData.especie,
                    [GHL_CONFIG.CRM.CUSTOM_FIELDS.MASCOTA_RAZA]: pacienteData.raza,
                    [GHL_CONFIG.CRM.CUSTOM_FIELDS.MASCOTA_EDAD]: edad,
                    [GHL_CONFIG.CRM.CUSTOM_FIELDS.MASCOTA_SEXO]: pacienteData.sexo,
                    [GHL_CONFIG.CRM.CUSTOM_FIELDS.MASCOTA_PESO]: pacienteData.peso,
                    fecha_registro: pacienteData.fecha_registro
                }
            };

            const opportunity = await this.ghlService.createOpportunity(opportunityData);
            return opportunity;
        } catch (error) {
            console.error('Error al sincronizar paciente con CRM:', error);
            throw error;
        }
    }

    // Actualizar estado de paciente en el CRM
    async updatePacienteStatus(pacienteId, status) {
        try {
            const stageId = this.getStageIdFromStatus(status);
            await this.ghlService.updateOpportunity(pacienteId, { stageId });
        } catch (error) {
            console.error('Error al actualizar estado en CRM:', error);
            throw error;
        }
    }

    // Registrar visita en el CRM
    async registrarVisita(pacienteId, visitaData) {
        try {
            // Actualizar campos personalizados del paciente
            const customFields = {
                [GHL_CONFIG.CRM.CUSTOM_FIELDS.ULTIMA_VISITA]: visitaData.fecha,
                [GHL_CONFIG.CRM.CUSTOM_FIELDS.PROXIMA_VISITA]: visitaData.proxima_visita
            };

            // Crear nota en el CRM sobre la visita
            const noteData = {
                opportunityId: pacienteId,
                note: `Visita: ${visitaData.fecha}
Motivo: ${visitaData.motivo}
Diagnóstico: ${visitaData.diagnostico}
Tratamiento: ${visitaData.tratamiento}
Próxima visita: ${visitaData.proxima_visita}`,
                type: 'medical_visit'
            };

            await Promise.all([
                this.ghlService.updateOpportunity(pacienteId, { customFields }),
                this.ghlService.createNote(noteData)
            ]);
        } catch (error) {
            console.error('Error al registrar visita en CRM:', error);
            throw error;
        }
    }

    // Obtener historial de paciente del CRM
    async getPacienteHistory(pacienteId) {
        try {
            const [opportunity, notes] = await Promise.all([
                this.ghlService.getOpportunity(pacienteId),
                this.ghlService.getOpportunityNotes(pacienteId)
            ]);

            return {
                paciente: opportunity,
                historial: notes.filter(note => note.type === 'medical_visit')
            };
        } catch (error) {
            console.error('Error al obtener historial del CRM:', error);
            throw error;
        }
    }

    // Obtener métricas del CRM
    async getCRMMetrics() {
        try {
            const pipeline = await this.ghlService.getPipeline(GHL_CONFIG.CRM.PIPELINE_ID);
            return {
                total_pacientes: pipeline.total_opportunities,
                pacientes_activos: pipeline.opportunities.filter(
                    opp => opp.stageId === GHL_CONFIG.CRM.OPPORTUNITY_STAGE_ACTIVE
                ).length,
                visitas_pendientes: pipeline.opportunities.filter(
                    opp => opp.customFields[GHL_CONFIG.CRM.CUSTOM_FIELDS.PROXIMA_VISITA] > new Date().toISOString()
                ).length
            };
        } catch (error) {
            console.error('Error al obtener métricas del CRM:', error);
            throw error;
        }
    }

    // Sincronizar facturas con el CRM
    async syncFacturas(propietarioId) {
        try {
            // Obtener facturas de la base de datos
            const facturas = await this.getFacturasPropietario(propietarioId);
            
            // Calcular totales y estado general
            const totalFacturado = facturas.reduce((sum, f) => sum + f.total, 0);
            const facturasNoPagadas = facturas.filter(f => f.estado === 'Pendiente');
            
            // Actualizar campos personalizados del contacto
            const customFields = {
                [GHL_CONFIG.CRM.CUSTOM_FIELDS.ULTIMA_FACTURA]: facturas.length > 0 ? 
                    facturas[facturas.length - 1].fecha : null,
                [GHL_CONFIG.CRM.CUSTOM_FIELDS.ESTADO_FACTURACION]: facturasNoPagadas.length > 0 ? 
                    'Pendiente' : 'Al día',
                total_facturado: totalFacturado,
                facturas_pendientes: facturasNoPagadas.length
            };

            // Actualizar el contacto en GHL
            await this.ghlService.updateContact(propietarioId, { customFields });

            // Crear notas para cada factura
            for (const factura of facturas) {
                const noteData = {
                    contactId: propietarioId,
                    note: `Factura #${factura.id}
Fecha: ${factura.fecha}
Total: ${factura.total}€
Estado: ${factura.estado}
Forma de pago: ${factura.forma_pago}`,
                    type: 'invoice'
                };

                await this.ghlService.createNote(noteData);
            }
        } catch (error) {
            console.error('Error al sincronizar facturas con CRM:', error);
            throw error;
        }
    }

    // Obtener facturas del propietario desde la base de datos
    async getFacturasPropietario(propietarioId) {
        try {
            const response = await axios.get(`${this.baseURL}/facturas/propietario/${propietarioId}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener facturas:', error);
            throw error;
        }
    }

    // Utilidad para convertir estado a stageId
    getStageIdFromStatus(status) {
        switch (status) {
            case 'NUEVO':
                return GHL_CONFIG.CRM.OPPORTUNITY_STAGE_NEW;
            case 'ACTIVO':
                return GHL_CONFIG.CRM.OPPORTUNITY_STAGE_ACTIVE;
            case 'COMPLETADO':
                return GHL_CONFIG.CRM.OPPORTUNITY_STAGE_COMPLETED;
            default:
                return GHL_CONFIG.CRM.OPPORTUNITY_STAGE_ACTIVE;
        }
    }
}

export default CRMService;
