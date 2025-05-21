# Sistema de Gestión Veterinaria

Aplicación web para la gestión de una clínica veterinaria, con enfoque en el módulo de hospitalización.

## Características

- Gestión de sala de espera
- Seguimiento de pacientes en consulta
- Módulo de hospitalización con fichas detalladas
- Interfaz responsive y amigable
- Autenticación de usuarios

## Requisitos previos

- Node.js (v14 o superior)
- npm o yarn

## Instalación

1. Clona el repositorio:
```
git clone <url-del-repositorio>
cd veterinaria-app
```

2. Instala las dependencias:
```
npm install
```

## Ejecución

### Servidor API (simulado)

Para iniciar el servidor API simulado en el puerto 5000:

```
node api_hospitalizacion.js
```

### Cliente React

Para iniciar la aplicación cliente en el puerto 3000:

```
npm start
```

## Acceso a la aplicación

Abre tu navegador y visita:
```
http://localhost:3000
```

### Credenciales de prueba
- **Email**: admin@veterinaria.com
- **Contraseña**: admin123

## Estructura del proyecto

```
veterinaria-app/
  ├── api_hospitalizacion.js   # API simulada
  ├── public/                  # Archivos públicos
  ├── src/                     # Código fuente
  │   ├── assets/              # Recursos (imágenes, CSS)
  │   ├── components/          # Componentes React
  │   ├── context/             # Contextos de React (auth)
  │   ├── pages/               # Páginas principales
  │   └── utils/               # Utilidades
  ├── package.json             # Dependencias
  └── README.md                # Este archivo
```

## Endpoints de la API

### Sala de Espera
- `GET /api/sala-espera/espera` - Lista de pacientes en espera
- `GET /api/sala-espera/consulta` - Lista de pacientes en consulta
- `GET /api/sala-espera/hospitalizados` - Lista de pacientes hospitalizados
- `GET /api/sala-espera/hospitalizados/:id` - Detalle de un paciente hospitalizado
- `POST /api/sala-espera` - Agregar paciente a sala de espera
- `PUT /api/sala-espera/:id/consulta` - Mover paciente a consulta
- `PUT /api/sala-espera/:id/hospitalizacion` - Mover paciente a hospitalización
- `PUT /api/sala-espera/:id/hospitalizacion/actualizar` - Actualizar información
- `DELETE /api/sala-espera/:id` - Finalizar atención

### Autenticación
- `POST /api/auth/login` - Iniciar sesión # vetapp
