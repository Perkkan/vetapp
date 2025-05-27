import React, { useState } from 'react';
import useGoHighLevel from '../hooks/useGoHighLevel';

const AppointmentForm = () => {
    const [formData, setFormData] = useState({
        nombreMascota: '',
        motivo: '',
        fecha: '',
        notas: ''
    });

    const { createPatientContact, scheduleAppointment, sendAppointmentReminder, isLoading, error } = useGoHighLevel();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Sincronizar la cita con GHL
            const result = await syncAppointmentWithGHL({
                nombrePropietario: formData.nombreDueno,
                apellidoPropietario: formData.apellidoDueno,
                email: formData.email,
                telefono: formData.telefono,
                nombreMascota: formData.nombreMascota,
                especie: formData.especie,
                raza: formData.raza,
                motivo: formData.motivo,
                fecha: formData.fecha,
                notas: formData.notas,
                tipoConsulta: formData.tipoConsulta,
                veterinario: formData.veterinario
            });

            // La cita ya está sincronizada con GHL y los recordatorios configurados
            alert('Cita programada exitosamente y sincronizada con el sistema');
        } catch (error) {
            console.error('Error al programar la cita:', error);
            alert('Error al programar la cita');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* Aquí va tu formulario existente */}
        </form>
    );
};

export default AppointmentForm;
