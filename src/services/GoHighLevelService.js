import axios from 'axios';
import GHL_CONFIG from '../config/gohighlevel';

class GoHighLevelService {
    constructor() {
        this.api = axios.create({
            baseURL: GHL_CONFIG.BASE_URL,
            headers: {
                'Authorization': `Bearer ${GHL_CONFIG.API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
    }

    // Crear o actualizar un contacto
    async upsertContact(contactData) {
        try {
            const response = await this.api.post(`/contacts/`, {
                ...contactData,
                locationId: GHL_CONFIG.LOCATION_ID
            });
            return response.data;
        } catch (error) {
            console.error('Error al crear/actualizar contacto en GHL:', error);
            throw error;
        }
    }

    // Programar una cita
    async createAppointment(appointmentData) {
        try {
            const response = await this.api.post(`/appointments/`, {
                ...appointmentData,
                locationId: GHL_CONFIG.LOCATION_ID
            });
            return response.data;
        } catch (error) {
            console.error('Error al crear cita en GHL:', error);
            throw error;
        }
    }

    // Enviar SMS
    async sendSMS(contactId, message) {
        try {
            const response = await this.api.post(`/sms/`, {
                contactId,
                message,
                locationId: GHL_CONFIG.LOCATION_ID
            });
            return response.data;
        } catch (error) {
            console.error('Error al enviar SMS desde GHL:', error);
            throw error;
        }
    }

    // Crear una tarea
    async createTask(taskData) {
        try {
            const response = await this.api.post(`/tasks/`, {
                ...taskData,
                locationId: GHL_CONFIG.LOCATION_ID
            });
            return response.data;
        } catch (error) {
            console.error('Error al crear tarea en GHL:', error);
            throw error;
        }
    }

    // Obtener pipeline
    async getPipeline(pipelineId) {
        try {
            const response = await this.api.get(`/pipelines/${pipelineId}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener pipeline de GHL:', error);
            throw error;
        }
    }

    // Crear una oportunidad
    async createOpportunity(opportunityData) {
        try {
            const response = await this.api.post(`/opportunities/`, {
                ...opportunityData,
                locationId: GHL_CONFIG.LOCATION_ID
            });
            return response.data;
        } catch (error) {
            console.error('Error al crear oportunidad en GHL:', error);
            throw error;
        }
    }

    // Obtener calendario
    async getCalendar(calendarId) {
        try {
            const response = await this.api.get(`/calendars/${calendarId}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener calendario de GHL:', error);
            throw error;
        }
    }

    // Sincronizar cita con GHL
    async syncAppointment(appointmentData) {
        try {
            // Crear o actualizar el contacto primero
            const contactData = {
                firstName: appointmentData.nombrePropietario,
                lastName: appointmentData.apellidoPropietario,
                email: appointmentData.email,
                phone: appointmentData.telefono,
                tags: ['Paciente Veterinaria'],
                customField: {
                    nombreMascota: appointmentData.nombreMascota,
                    especie: appointmentData.especie,
                    raza: appointmentData.raza
                }
            };

            const contact = await this.upsertContact(contactData);

            // Crear la cita en GHL
            const ghlAppointment = {
                contactId: contact.id,
                calendarId: GHL_CONFIG.CALENDAR_ID,
                title: `Consulta: ${appointmentData.nombreMascota}`,
                description: `Motivo: ${appointmentData.motivo}\nNotas: ${appointmentData.notas}`,
                startTime: appointmentData.fecha,
                duration: 30,
                status: 'scheduled',
                type: 'veterinary_appointment',
                customFields: {
                    tipoConsulta: appointmentData.tipoConsulta,
                    veterinario: appointmentData.veterinario
                }
            };

            const appointment = await this.createAppointment(ghlAppointment);

            // Configurar recordatorios automáticos
            await this.setupAutomations(contact.id, appointment.id);

            return {
                contact,
                appointment
            };
        } catch (error) {
            console.error('Error al sincronizar cita con GHL:', error);
            throw error;
        }
    }

    // Enviar email personalizado
    async sendEmail(emailData) {
        try {
            const response = await this.api.post('/emails/send', {
                locationId: GHL_CONFIG.LOCATION_ID,
                ...emailData
            });
            return response.data;
        } catch (error) {
            console.error('Error al enviar email:', error);
            throw error;
        }
    }

    // Enviar SMS personalizado
    async sendSMS(smsData) {
        try {
            const response = await this.api.post('/sms/send', {
                locationId: GHL_CONFIG.LOCATION_ID,
                ...smsData
            });
            return response.data;
        } catch (error) {
            console.error('Error al enviar SMS:', error);
            throw error;
        }
    }

    // Métodos para el CRM
    async getOpportunity(opportunityId) {
        try {
            const response = await this.api.get(`/opportunities/${opportunityId}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener oportunidad:', error);
            throw error;
        }
    }

    async updateOpportunity(opportunityId, data) {
        try {
            const response = await this.api.put(`/opportunities/${opportunityId}`, {
                ...data,
                locationId: GHL_CONFIG.LOCATION_ID
            });
            return response.data;
        } catch (error) {
            console.error('Error al actualizar oportunidad:', error);
            throw error;
        }
    }

    async createNote(noteData) {
        try {
            const response = await this.api.post('/notes', {
                ...noteData,
                locationId: GHL_CONFIG.LOCATION_ID
            });
            return response.data;
        } catch (error) {
            console.error('Error al crear nota:', error);
            throw error;
        }
    }

    async getOpportunityNotes(opportunityId) {
        try {
            const response = await this.api.get(`/opportunities/${opportunityId}/notes`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener notas:', error);
            throw error;
        }
    }

    // Configurar automatizaciones para la cita
    async setupAutomations(contactId, appointmentId) {
        try {
            // Configurar recordatorio 24 horas antes
            await this.api.post('/workflows/trigger', {
                workflowId: GHL_CONFIG.REMINDER_WORKFLOW_ID,
                contactId,
                appointmentId,
                trigger: '24h_before'
            });

            // Configurar recordatorio 1 hora antes
            await this.api.post('/workflows/trigger', {
                workflowId: GHL_CONFIG.REMINDER_WORKFLOW_ID,
                contactId,
                appointmentId,
                trigger: '1h_before'
            });

            // Configurar seguimiento post-consulta
            await this.api.post('/workflows/trigger', {
                workflowId: GHL_CONFIG.FOLLOW_UP_WORKFLOW_ID,
                contactId,
                appointmentId,
                trigger: '24h_after'
            });
        } catch (error) {
            console.error('Error al configurar automatizaciones:', error);
            throw error;
        }
    }
}
