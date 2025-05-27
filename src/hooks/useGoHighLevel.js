import { useState, useCallback } from 'react';
import GoHighLevelService from '../services/GoHighLevelService';

const useGoHighLevel = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const ghlService = new GoHighLevelService();

    // Crear contacto para un nuevo paciente
    const createPatientContact = useCallback(async (patientData) => {
        setIsLoading(true);
        setError(null);
        try {
            const contactData = {
                firstName: patientData.nombre,
                lastName: patientData.apellido,
                email: patientData.email,
                phone: patientData.telefono,
                customField: {
                    mascota: patientData.nombreMascota,
                    especie: patientData.especie,
                    raza: patientData.raza
                }
            };
            
            const contact = await ghlService.upsertContact(contactData);
            return contact;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Programar cita veterinaria
    const scheduleAppointment = useCallback(async (appointmentData) => {
        setIsLoading(true);
        setError(null);
        try {
            const ghlAppointment = {
                contactId: appointmentData.contactId,
                title: `Cita Veterinaria - ${appointmentData.nombreMascota}`,
                description: appointmentData.motivo,
                startTime: appointmentData.fecha,
                duration: 30, // duración en minutos
                notes: appointmentData.notas
            };
            
            const appointment = await ghlService.createAppointment(ghlAppointment);
            return appointment;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Enviar recordatorio por SMS
    const sendAppointmentReminder = useCallback(async (contactId, appointmentData) => {
        setIsLoading(true);
        setError(null);
        try {
            const message = `Recordatorio: Tiene una cita veterinaria programada para ${appointmentData.fecha} para ${appointmentData.nombreMascota}. Por favor confirme su asistencia.`;
            
            const smsResult = await ghlService.sendSMS(contactId, message);
            return smsResult;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Sincronizar cita con GHL
    const syncAppointmentWithGHL = useCallback(async (appointmentData) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await ghlService.syncAppointment(appointmentData);
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        isLoading,
        error,
        createPatientContact,
        scheduleAppointment,
        sendAppointmentReminder
    };
};

export default useGoHighLevel;
