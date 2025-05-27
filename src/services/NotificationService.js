import GoHighLevelService from './GoHighLevelService';
import axios from 'axios';

class NotificationService {
    constructor() {
        this.ghlService = new GoHighLevelService();
        this.baseURL = 'http://localhost:5000/api'; // API de hospitalización
    }

    // Obtener datos del paciente y propietario desde la base de datos
    async getPacienteData(pacienteId) {
        try {
            const response = await axios.get(`${this.baseURL}/pacientes/${pacienteId}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener datos del paciente:', error);
            throw error;
        }
    }

    // Obtener datos de la cita desde la base de datos
    async getCitaData(citaId) {
        try {
            const response = await axios.get(`${this.baseURL}/citas/${citaId}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener datos de la cita:', error);
            throw error;
        }
    }

    // Enviar recordatorio de cita por email
    async sendAppointmentEmailReminder(citaId) {
        try {
            const citaData = await this.getCitaData(citaId);
            const pacienteData = await this.getPacienteData(citaData.paciente_id);

            const emailData = {
                to: pacienteData.propietario.email,
                templateId: 'appointment_reminder', // ID de la plantilla en GHL
                mergeFields: {
                    nombre_propietario: pacienteData.propietario.nombre,
                    nombre_mascota: pacienteData.nombre,
                    fecha_cita: citaData.fecha,
                    hora_cita: citaData.hora,
                    veterinario: citaData.veterinario,
                    tipo_consulta: citaData.tipo_consulta,
                    clinica_nombre: citaData.clinica.nombre,
                    clinica_direccion: citaData.clinica.direccion
                }
            };

            return await this.ghlService.sendEmail(emailData);
        } catch (error) {
            console.error('Error al enviar recordatorio por email:', error);
            throw error;
        }
    }

    // Enviar recordatorio de cita por SMS
    async sendAppointmentSMSReminder(citaId) {
        try {
            const citaData = await this.getCitaData(citaId);
            const pacienteData = await this.getPacienteData(citaData.paciente_id);

            const smsData = {
                phone: pacienteData.propietario.telefono,
                message: `Recordatorio: Cita para ${pacienteData.nombre} el ${citaData.fecha} a las ${citaData.hora}. Por favor confirme su asistencia respondiendo SI o NO.`
            };

            return await this.ghlService.sendSMS(smsData);
        } catch (error) {
            console.error('Error al enviar recordatorio por SMS:', error);
            throw error;
        }
    }

    // Enviar seguimiento post-consulta
    async sendFollowUpMessage(citaId) {
        try {
            const citaData = await this.getCitaData(citaId);
            const pacienteData = await this.getPacienteData(citaData.paciente_id);

            // Enviar email de seguimiento
            const emailData = {
                to: pacienteData.propietario.email,
                templateId: 'followup_consultation',
                mergeFields: {
                    nombre_propietario: pacienteData.propietario.nombre,
                    nombre_mascota: pacienteData.nombre,
                    fecha_consulta: citaData.fecha,
                    veterinario: citaData.veterinario
                }
            };

            // Enviar SMS de seguimiento
            const smsData = {
                phone: pacienteData.propietario.telefono,
                message: `Hola ${pacienteData.propietario.nombre}, ¿cómo está ${pacienteData.nombre} después de su consulta? Responda del 1-5 para evaluar su mejoría.`
            };

            await Promise.all([
                this.ghlService.sendEmail(emailData),
                this.ghlService.sendSMS(smsData)
            ]);

            return true;
        } catch (error) {
            console.error('Error al enviar mensajes de seguimiento:', error);
            throw error;
        }
    }
}

export default NotificationService;
