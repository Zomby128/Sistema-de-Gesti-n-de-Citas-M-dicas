# 🔧 Documentación del Backend - Sistema de Citas Médicas

## 📋 Descripción General

Backend REST API desarrollado con Node.js + Express para el Sistema de Gestión de Citas Médicas. Proporciona endpoints para gestionar pacientes, doctores y citas con validaciones robustas.

---

## 🚀 Inicio Rápido

### Instalación de Dependencias
```bash
npm install
```

### Ejecutar el Servidor
```bash
npm start
# o directamente:
node server.js
```

El servidor se ejecutará en: `http://localhost:3000`

---

## 🗂️ Estructura de Carpetas

```
backend/
├── server.js                 # Servidor principal (743 líneas)
├── package.json              # Dependencias npm
├── utils/
│   └── fileManager.js        # Utilidad para CRUD de archivos JSON
└── data/
    ├── pacientes.json        # Base de datos de pacientes
    ├── doctores.json         # Base de datos de doctores
    └── citas.json            # Base de datos de citas
```

---

## 📦 Dependencias

| Paquete | Versión | Propósito |
|---------|---------|----------|
| **express** | ^4.18.0 | Framework web |
| **cors** | ^2.8.5 | Control de acceso cross-origin |
| **uuid** | ^9.0.0 | Generación de IDs únicos |

---

## 🔌 API Endpoints

### 📊 Endpoint Raíz

```http
GET /
```

**Respuesta:**
```json
{
  "mensaje": "API de Sistema de Citas Médicas funcionando",
  "version": "1.0.0",
  "status": "OK",
  "timestamp": "2025-12-08T10:30:00.000Z",
  "endpoints": {
    "pacientes": "/pacientes",
    "doctores": "/doctores",
    "citas": "/citas",
    "estadisticas": "/estadisticas"
  }
}
```

---

## 👥 Endpoints de Pacientes

### Listar Todos los Pacientes
```http
GET /pacientes
```

**Respuesta (200 OK):**
```json
[
  {
    "id": "P001",
    "nombre": "María González",
    "edad": 35,
    "telefono": "555-0101",
    "email": "maria.g@email.com",
    "fechaRegistro": "2025-01-15"
  },
  ...
]
```

---

### Obtener Paciente por ID
```http
GET /pacientes/:id
```

**Parámetros:**
- `id` (string): ID del paciente (ej: P001)

**Respuesta (200 OK):**
```json
{
  "id": "P001",
  "nombre": "María González",
  "edad": 35,
  "telefono": "555-0101",
  "email": "maria.g@email.com",
  "fechaRegistro": "2025-01-15"
}
```

**Errores:**
- `404`: Paciente no encontrado

---

### Crear Nuevo Paciente
```http
POST /pacientes
Content-Type: application/json

{
  "nombre": "Juan Pérez",
  "edad": 28,
  "telefono": "555-0107",
  "email": "juan.p@email.com"
}
```

**Validaciones:**
- ✅ Todos los campos obligatorios
- ✅ Edad > 0
- ✅ Email único en el sistema

**Respuesta (201 Created):**
```json
{
  "id": "P007",
  "nombre": "Juan Pérez",
  "edad": 28,
  "telefono": "555-0107",
  "email": "juan.p@email.com",
  "fechaRegistro": "2025-12-08"
}
```

**Errores:**
- `400`: Campos obligatorios faltantes o email duplicado

---

### Actualizar Paciente
```http
PUT /pacientes/:id
Content-Type: application/json

{
  "nombre": "Juan Carlos Pérez",
  "edad": 29,
  "telefono": "555-0107",
  "email": "juancarlos.p@email.com"
}
```

**Respuesta (200 OK):**
```json
{
  "id": "P007",
  "nombre": "Juan Carlos Pérez",
  "edad": 29,
  "telefono": "555-0107",
  "email": "juancarlos.p@email.com",
  "fechaRegistro": "2025-12-08"
}
```

---

### Ver Historial de Citas de Paciente
```http
GET /pacientes/:id/historial
```

**Respuesta (200 OK):**
```json
{
  "paciente": {
    "id": "P001",
    "nombre": "María González"
  },
  "citas": [
    {
      "id": "C001",
      "fecha": "2025-12-10",
      "hora": "10:00",
      "doctor": "Dr. Carlos Méndez",
      "especialidad": "Cardiología",
      "motivo": "Revisión general",
      "estado": "programada"
    },
    ...
  ]
}
```

---

## 👨‍⚕️ Endpoints de Doctores

### Listar Todos los Doctores
```http
GET /doctores
```

**Respuesta (200 OK):**
```json
[
  {
    "id": "D001",
    "nombre": "Dr. Carlos Méndez",
    "especialidad": "Cardiología",
    "horarioInicio": "09:00",
    "horarioFin": "17:00",
    "diasDisponibles": ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]
  },
  ...
]
```

---

### Obtener Doctor por ID
```http
GET /doctores/:id
```

**Respuesta (200 OK):**
```json
{
  "id": "D001",
  "nombre": "Dr. Carlos Méndez",
  "especialidad": "Cardiología",
  "horarioInicio": "09:00",
  "horarioFin": "17:00",
  "diasDisponibles": ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]
}
```

---

### Crear Nuevo Doctor
```http
POST /doctores
Content-Type: application/json

{
  "nombre": "Dra. Patricia González",
  "especialidad": "Oftalmología",
  "horarioInicio": "08:00",
  "horarioFin": "16:00",
  "diasDisponibles": ["Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
}
```

**Validaciones:**
- ✅ Todos los campos obligatorios
- ✅ Especialidad no vacía
- ✅ Horarios válidos (HH:MM)
- ✅ Días válidos (Lunes-Domingo)

**Respuesta (201 Created):**
```json
{
  "id": "D006",
  "nombre": "Dra. Patricia González",
  "especialidad": "Oftalmología",
  "horarioInicio": "08:00",
  "horarioFin": "16:00",
  "diasDisponibles": ["Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
}
```

---

### Actualizar Doctor
```http
PUT /doctores/:id
Content-Type: application/json

{
  "horarioInicio": "09:00",
  "horarioFin": "18:00"
}
```

**Respuesta (200 OK):**
```json
{
  "id": "D006",
  "nombre": "Dra. Patricia González",
  "especialidad": "Oftalmología",
  "horarioInicio": "09:00",
  "horarioFin": "18:00",
  "diasDisponibles": ["Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
}
```

---

### Filtrar Doctores por Especialidad
```http
GET /doctores/especialidad/Cardiología
```

**Respuesta (200 OK):**
```json
[
  {
    "id": "D001",
    "nombre": "Dr. Carlos Méndez",
    "especialidad": "Cardiología",
    ...
  }
]
```

---

### Doctores Disponibles Hoy
```http
GET /doctores/disponibles
```

Retorna doctores que están disponibles en la fecha actual.

---

## 📅 Endpoints de Citas

### Listar Citas (con Filtros)
```http
GET /citas
GET /citas?fecha=2025-12-10
GET /citas?estado=programada
GET /citas?doctorId=D001
GET /citas?fecha=2025-12-10&estado=programada
```

**Parámetros de Query:**
- `fecha` (string): Formato YYYY-MM-DD
- `estado` (string): "programada" o "cancelada"
- `doctorId` (string): ID del doctor

**Respuesta (200 OK):**
```json
[
  {
    "id": "C001",
    "pacienteId": "P001",
    "doctorId": "D001",
    "fecha": "2025-12-10",
    "hora": "10:00",
    "motivo": "Revisión general",
    "estado": "programada",
    "fechaCreacion": "2025-12-08T10:30:00.000Z",
    "pacienteNombre": "María González",
    "doctorNombre": "Dr. Carlos Méndez",
    "especialidad": "Cardiología"
  },
  ...
]
```

---

### Obtener Detalles de Cita
```http
GET /citas/:id
```

**Respuesta (200 OK):**
```json
{
  "id": "C001",
  "pacienteId": "P001",
  "doctorId": "D001",
  "fecha": "2025-12-10",
  "hora": "10:00",
  "motivo": "Revisión general",
  "estado": "programada",
  "fechaCreacion": "2025-12-08T10:30:00.000Z",
  "pacienteNombre": "María González",
  "doctorNombre": "Dr. Carlos Méndez",
  "especialidad": "Cardiología"
}
```

---

### Crear Nueva Cita
```http
POST /citas
Content-Type: application/json

{
  "pacienteId": "P001",
  "doctorId": "D001",
  "fecha": "2025-12-15",
  "hora": "14:00",
  "motivo": "Seguimiento cardiaco"
}
```

**Validaciones Complejas:**
- ✅ Paciente existe
- ✅ Doctor existe
- ✅ Fecha es futura
- ✅ Doctor trabaja ese día
- ✅ Hora dentro del horario del doctor
- ✅ No hay conflicto de citas (doctor no tiene otra cita a esa hora)

**Respuesta (201 Created):**
```json
{
  "id": "C045",
  "pacienteId": "P001",
  "doctorId": "D001",
  "fecha": "2025-12-15",
  "hora": "14:00",
  "motivo": "Seguimiento cardiaco",
  "estado": "programada",
  "fechaCreacion": "2025-12-08T10:35:00.000Z"
}
```

**Errores Posibles:**
- `400`: Campos obligatorios, fecha pasada, doctor no disponible
- `404`: Paciente o doctor no encontrado

---

### Citas Próximas (Próximas 24 horas)
```http
GET /citas/proximas
```

Retorna citas programadas para las próximas 24 horas desde ahora.

**Respuesta (200 OK):**
```json
[
  {
    "id": "C042",
    "pacienteId": "P003",
    "doctorId": "D002",
    "fecha": "2025-12-09",
    "hora": "11:30",
    "motivo": "Control general",
    "estado": "programada",
    "pacienteNombre": "Ana Martínez",
    "doctorNombre": "Dra. Elena Ruiz",
    "telefonoPaciente": "555-0103"
  },
  ...
]
```

---

### Agenda de Doctor
```http
GET /citas/doctor/:doctorId
```

**Respuesta (200 OK):**
```json
{
  "doctor": "Dr. Carlos Méndez",
  "especialidad": "Cardiología",
  "agenda": [
    {
      "id": "C001",
      "pacienteId": "P001",
      "fecha": "2025-12-10",
      "hora": "10:00",
      "motivo": "Revisión general",
      "estado": "programada",
      "pacienteNombre": "María González"
    },
    ...
  ]
}
```

---

### Cancelar Cita
```http
PUT /citas/:id/cancelar
```

**Validaciones:**
- ✅ Cita existe
- ✅ Estado es "programada" (no puede cancelar cita ya cancelada)

**Respuesta (200 OK):**
```json
{
  "id": "C001",
  "pacienteId": "P001",
  "doctorId": "D001",
  "fecha": "2025-12-10",
  "hora": "10:00",
  "motivo": "Revisión general",
  "estado": "cancelada",
  "fechaCreacion": "2025-12-08T10:30:00.000Z",
  "fechaCancelacion": "2025-12-08T10:40:00.000Z"
}
```

**Errores:**
- `404`: Cita no encontrada
- `400`: Cita no está programada

---

## 📊 Endpoints de Estadísticas

### Citas por Doctor
```http
GET /estadisticas/doctores
```

**Respuesta (200 OK):**
```json
[
  {
    "doctorId": "D001",
    "nombre": "Dr. Carlos Méndez",
    "totalCitas": 12,
    "citasProgramadas": 8,
    "citasCanceladas": 4
  },
  ...
]
```

---

### Citas por Especialidad
```http
GET /estadisticas/especialidades
```

**Respuesta (200 OK):**
```json
[
  {
    "especialidad": "Cardiología",
    "totalCitas": 25,
    "citasProgramadas": 18,
    "citasCanceladas": 7
  },
  ...
]
```

---

## 🔧 Funciones Auxiliares

### obtenerDiaSemana(fecha)
Convierte una fecha en formato YYYY-MM-DD al nombre del día en español.

```javascript
obtenerDiaSemana("2025-12-10"); // "Miércoles"
```

---

### validarDisponibilidadCita(doctorId, fecha, hora)
Verifica que no haya conflicto de citas para un doctor en una fecha y hora específica.

```javascript
const disponible = await validarDisponibilidadCita("D001", "2025-12-15", "14:00");
// true o false
```

---

## 📄 Estructuras de Datos

### Paciente
```json
{
  "id": "P001",
  "nombre": "María González",
  "edad": 35,
  "telefono": "555-0101",
  "email": "maria.g@email.com",
  "fechaRegistro": "2025-01-15"
}
```

### Doctor
```json
{
  "id": "D001",
  "nombre": "Dr. Carlos Méndez",
  "especialidad": "Cardiología",
  "horarioInicio": "09:00",
  "horarioFin": "17:00",
  "diasDisponibles": ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]
}
```

### Cita
```json
{
  "id": "C001",
  "pacienteId": "P001",
  "doctorId": "D001",
  "fecha": "2025-12-10",
  "hora": "10:00",
  "motivo": "Revisión general",
  "estado": "programada",
  "fechaCreacion": "2025-12-08T10:30:00.000Z"
}
```

---

## 🔒 Seguridad

### CORS Configurado
```javascript
const corsOptions = {
    origin: '*',  // Permite todos los orígenes
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
};
```

### Validaciones
- ✅ Validación de datos en servidor (no confiar en cliente)
- ✅ Verificación de existencia de recursos
- ✅ Manejo de errores con códigos HTTP apropiados
- ✅ Logs de errores en consola

---

## 🐛 Manejo de Errores

### Códigos HTTP Utilizados

| Código | Significado | Ejemplo |
|--------|-----------|---------|
| 200 | OK | Solicitud exitosa |
| 201 | Created | Recurso creado |
| 400 | Bad Request | Campos obligatorios faltantes |
| 404 | Not Found | Recurso no existe |
| 500 | Server Error | Error interno del servidor |

### Formato de Error
```json
{
  "error": "Descripción del error"
}
```

---

## 📝 Logs

El servidor registra:
- ✅ Errores en consola con detalles
- ✅ Timestamp de cada operación
- ✅ Endpoint y método utilizado

**Ejemplo:**
```
Error en POST /citas: Paciente no encontrado
Error en PUT /pacientes/:id: Error interno del servidor
```

---

## 🔄 Flujo de Datos Typical

### Crear Cita
1. Frontend envía POST /citas
2. Backend valida:
   - Paciente existe
   - Doctor existe
   - Fecha es futura
   - Doctor trabaja ese día
   - No hay conflicto de citas
3. Si todo es válido, guarda en citas.json
4. Retorna cita creada con ID único
5. Frontend actualiza lista de citas

---

## 📚 Archivos de Datos

Todos los datos se guardan en archivos JSON:

- `data/pacientes.json` - Lista de pacientes
- `data/doctores.json` - Lista de doctores
- `data/citas.json` - Lista de citas

**Nota:** Los datos persisten entre sesiones del servidor.

---

## 🚀 Performance

- ✅ Lectura/escritura de archivos asincrónica
- ✅ Sin delay artificial
- ✅ Índices de búsqueda O(n) (adecuado para datos pequeños)
- ✅ Para 10,000+ registros, migrar a BD de verdad

---

## 🔮 Mejoras Futuras

1. Migrar a MongoDB/PostgreSQL
2. Implementar autenticación JWT
3. Rate limiting para prevenir abuso
4. Cache con Redis
5. Backup automático de datos
6. Validación más estricta
7. Middleware de error personalizado
8. Logging a archivos

---

**Última actualización**: 8 de diciembre de 2025

Para preguntas o problemas, revisa los logs en la consola del servidor.
