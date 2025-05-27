const GHL_CONFIG = {
    API_KEY: process.env.REACT_APP_GHL_API_KEY,
    LOCATION_ID: process.env.REACT_APP_GHL_LOCATION_ID,
    BASE_URL: 'https://rest.gohighlevel.com/v1/',
    CALENDAR_ID: process.env.REACT_APP_GHL_CALENDAR_ID,
    REMINDER_WORKFLOW_ID: process.env.REACT_APP_GHL_REMINDER_WORKFLOW_ID,
    FOLLOW_UP_WORKFLOW_ID: process.env.REACT_APP_GHL_FOLLOW_UP_WORKFLOW_ID,
    EMAIL_TEMPLATES: {
        APPOINTMENT_REMINDER: process.env.REACT_APP_GHL_EMAIL_TEMPLATE_APPOINTMENT,
        FOLLOWUP: process.env.REACT_APP_GHL_EMAIL_TEMPLATE_FOLLOWUP
    },
    SMS_TEMPLATES: {
        APPOINTMENT_REMINDER: process.env.REACT_APP_GHL_SMS_TEMPLATE_APPOINTMENT,
        FOLLOWUP: process.env.REACT_APP_GHL_SMS_TEMPLATE_FOLLOWUP
    },
    CRM: {
        PIPELINE_ID: process.env.REACT_APP_GHL_PIPELINE_ID,
        OPPORTUNITY_STAGE_NEW: process.env.REACT_APP_GHL_STAGE_NEW,
        OPPORTUNITY_STAGE_ACTIVE: process.env.REACT_APP_GHL_STAGE_ACTIVE,
        OPPORTUNITY_STAGE_COMPLETED: process.env.REACT_APP_GHL_STAGE_COMPLETED,
        TAG_PACIENTE: 'Paciente Veterinaria',
        TAG_PROPIETARIO: 'Propietario Mascota',
        CUSTOM_FIELDS: {
            // Campos del propietario
            FECHA_REGISTRO: 'cf_fecha_registro',
            NOTAS_PROPIETARIO: 'cf_notas_propietario',
            NIF: 'cf_nif',
            ESTADO_PROPIETARIO: 'cf_estado_propietario',
            
            // Campos de la mascota
            MASCOTA_NOMBRE: 'cf_mascota_nombre',
            MASCOTA_ESPECIE: 'cf_mascota_especie',
            MASCOTA_RAZA: 'cf_mascota_raza',
            MASCOTA_EDAD: 'cf_mascota_edad',
            MASCOTA_SEXO: 'cf_mascota_sexo',
            MASCOTA_PESO: 'cf_mascota_peso',
            
            // Campos de seguimiento
            ULTIMA_VISITA: 'cf_ultima_visita',
            PROXIMA_VISITA: 'cf_proxima_visita',
            ULTIMA_FACTURA: 'cf_ultima_factura',
            ESTADO_FACTURACION: 'cf_estado_facturacion'
        }
    }
};

export default GHL_CONFIG;
