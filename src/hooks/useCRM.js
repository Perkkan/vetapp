import { useState, useCallback } from 'react';
import CRMService from '../services/CRMService';

const useCRM = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const crmService = new CRMService();

    // Sincronizar un nuevo propietario
    const syncPropietario = useCallback(async (propietarioData) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await crmService.syncPropietario(propietarioData);
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Sincronizar un nuevo paciente
    const syncPaciente = useCallback(async (pacienteData, propietarioId) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await crmService.syncPaciente(pacienteData, propietarioId);
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Registrar una visita
    const registrarVisita = useCallback(async (pacienteId, visitaData) => {
        setIsLoading(true);
        setError(null);
        try {
            await crmService.registrarVisita(pacienteId, visitaData);
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Obtener historial del paciente
    const obtenerHistorialPaciente = useCallback(async (pacienteId) => {
        setIsLoading(true);
        setError(null);
        try {
            const historial = await crmService.getPacienteHistory(pacienteId);
            return historial;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Obtener métricas del CRM
    const obtenerMetricas = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const metrics = await crmService.getCRMMetrics();
            return metrics;
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
        syncPropietario,
        syncPaciente,
        registrarVisita,
        obtenerHistorialPaciente,
        obtenerMetricas
    };
};

export default useCRM;
