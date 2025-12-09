# 🏥 Sistema de Gestión de Citas Médicas

**Sistema integral para la gestión de pacientes, doctores y citas médicas.**

## 📋 Descripción

Sistema completo de gestión de citas médicas desarrollado con arquitectura de dos capas:
- **Frontend**: Vanilla JavaScript, HTML5, CSS3 (Responsive)
- **Backend**: Node.js + Express + JSON Files

Permite a administradores de clínicas gestionar pacientes, doctores y citas de manera eficiente con validaciones robustas y una interfaz intuitiva.

---

## ✨ Características Principales

### 🏠 Dashboard
- ✅ Estadísticas en tiempo real (pacientes, doctores, citas)
- ✅ Citas programadas para hoy
- ✅ Notificaciones de citas próximas (próximas 24 horas)
- ✅ Interfaz limpia y moderna

### 👥 Gestión de Pacientes
- ✅ **Crear** nuevos pacientes con validación de email único
- ✅ **Leer** lista completa de pacientes con búsqueda
- ✅ **Actualizar** información de pacientes existentes
- ✅ **Ver historial** de citas por paciente
- ✅ Validaciones: nombre (2+ caracteres), edad (1-120), email válido, teléfono

### 👨‍⚕️ Gestión de Doctores
- ✅ **Crear** doctores con especialidad personalizable
- ✅ **Leer** lista de doctores con tarjetas informativas
- ✅ **Actualizar** información de doctores
- ✅ Definir horarios de atención (inicio y fin)
- ✅ Seleccionar días disponibles (Lun-Dom)
- ✅ Validaciones: nombre, especialidad, horarios

### 📅 Gestión de Citas
- ✅ **Crear** citas con validación de disponibilidad
- ✅ **Leer** citas con filtros avanzados (fecha, estado, doctor)
- ✅ **Cancelar** citas programadas
- ✅ **Ver detalles** completos (paciente, doctor, motivo)
- ✅ Validaciones: fecha futura, doctor disponible, horario válido
- ✅ Enriquecimiento de datos (nombres de paciente/doctor en citas)

### 🎨 Interfaz
- ✅ Diseño responsivo (Mobile, Tablet, Desktop)
- ✅ Navegación intuitiva con menú adaptable
- ✅ Modales para formularios
- ✅ Toast notifications para feedback
- ✅ Íconos Font Awesome integrados
- ✅ Paleta de colores profesional

### 🔒 Validaciones
- ✅ Validaciones en cliente (prevención de errores)
- ✅ Validaciones en servidor (seguridad)
- ✅ Mensajes de error específicos y útiles
- ✅ Manejo de errores de red

---

## 🛠️ Tecnologías Utilizadas

### Frontend
| Tecnología | Propósito |
|-----------|----------|
| **HTML5** | Estructura semántica |
| **CSS3** | Estilos responsivos con variables CSS |
| **Vanilla JavaScript** | Lógica de aplicación (sin frameworks) |
| **Fetch API** | Comunicación con backend |
| **Font Awesome 6.4** | Íconos vectoriales |
| **Google Fonts** | Tipografía Poppins |

### Backend
| Tecnología | Propósito |
|-----------|----------|
| **Node.js** | Runtime JavaScript |
| **Express.js** | Framework web |
| **CORS** | Control de acceso entre dominios |
| **UUID** | Generación de IDs únicos |
| **JSON Files** | Persistencia de datos |

---

## 📦 Estructura del Proyecto

```
Sistema-Medico/
├── frontend/
│   ├── index.html              # Archivo principal HTML
│   ├── css/
│   │   ├── styles.css          # Estilos principales (1000+ líneas)
│   │   └── components.css      # Estilos de componentes
│   └── js/
│       ├── api.js              # Funciones de API (request wrapper)
│       ├── app.js              # Clase principal de la aplicación
│       ├── pacientes.js        # Módulo de gestión de pacientes
│       ├── doctores.js         # Módulo de gestión de doctores
│       └── citas.js            # Módulo de gestión de citas
│
├── backend/
│   ├── server.js               # Servidor Express principal
│   ├── package.json            # Dependencias del proyecto
│   ├── utils/
│   │   └── fileManager.js      # Utilidad para manejo de archivos JSON
│   └── data/
│       ├── pacientes.json      # Base de datos de pacientes
│       ├── doctores.json       # Base de datos de doctores
│       └── citas.json          # Base de datos de citas
│
└── README.md                    # Este archivo
```

---

## 🚀 Instalación y Ejecución

### Requisitos Previos
- ✅ Node.js v14+ instalado
- ✅ npm (incluido con Node.js)
- ✅ Git (opcional, para clonar)
- ✅ Navegador web moderno (Chrome, Firefox, Edge, Safari)

### Instalación del Backend

1. **Navega a la carpeta del backend**
   ```bash
   cd backend
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Inicia el servidor**
   ```bash
   npm start
   # O directamente:
   node server.js
   ```
   
   Deberías ver:
   ```
   API de Sistema de Citas Médicas ejecutándose en puerto 3000
   ```

### Instalación del Frontend

**Opción 1: Usar Live Server (Recomendado)**

1. Instala la extensión "Live Server" en VS Code
2. Click derecho en `frontend/index.html`
3. Selecciona "Open with Live Server"
4. Se abrirá automáticamente en `http://localhost:5500` (o similar)

**Opción 2: Servidor Python**

1. **Navega a la carpeta frontend**
   ```bash
   cd frontend
   ```

2. **Inicia el servidor**
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   ```

3. **Abre en el navegador**
   ```
   http://localhost:8000
   ```

**Opción 3: Abrir directamente**
- Simplemente abre `frontend/index.html` en tu navegador
- ⚠️ Nota: Puede tener limitaciones con CORS, mejor usar opciones 1 o 2

---

## 📖 Cómo Usar

### 1️⃣ Dashboard
- Acceso inmediato al cargar la aplicación
- Muestra estadísticas generales
- Ver citas de hoy y próximas 24 horas

### 2️⃣ Gestión de Pacientes
1. Click en "Pacientes" en el menú
2. Click en "Nuevo Paciente"
3. Completa el formulario:
   - Nombre (mínimo 2 caracteres)
   - Edad (1-120 años)
   - Teléfono
   - Email (debe ser único)
4. Click en "Guardar"

**Búsqueda:** Usa la barra de búsqueda para filtrar por nombre, email o ID

### 3️⃣ Gestión de Doctores
1. Click en "Doctores" en el menú
2. Click en "Nuevo Doctor"
3. Completa el formulario:
   - Nombre
   - Especialidad (selecciona o agrega nueva)
   - Horario inicial y final
   - Selecciona días disponibles
4. Click en "Guardar"

### 4️⃣ Agendamiento de Citas
1. Click en "Citas" en el menú
2. Click en "Nueva Cita" o "Agendar Primera Cita"
3. Completa el formulario:
   - Selecciona paciente
   - Selecciona especialidad (filtra doctores)
   - Selecciona doctor
   - Selecciona fecha (futura)
   - Selecciona hora (dentro del horario del doctor)
   - Ingresa motivo de consulta
4. El sistema validará:
   - Que el doctor trabaje ese día
   - Que la hora esté dentro de su horario
   - Que no haya conflicto de citas
5. Click en "Guardar Cita"

**Cancelación:** En la lista de citas, click en el ícono de X para cancelar cita programada

---

## 🔌 API Endpoints

### Pacientes
```
GET    /pacientes              - Listar todos
POST   /pacientes              - Crear nuevo
GET    /pacientes/:id          - Obtener uno
PUT    /pacientes/:id          - Actualizar
GET    /pacientes/:id/historial - Ver historial de citas
```

### Doctores
```
GET    /doctores               - Listar todos
POST   /doctores               - Crear nuevo
GET    /doctores/:id           - Obtener uno
PUT    /doctores/:id           - Actualizar
GET    /doctores/especialidad/:esp - Filtrar por especialidad
GET    /doctores/disponibles   - Doctores disponibles hoy
```

### Citas
```
GET    /citas                  - Listar (filtros: fecha, estado, doctorId)
POST   /citas                  - Crear nueva
GET    /citas/:id              - Obtener detalles
GET    /citas/proximas         - Próximas 24 horas
GET    /citas/doctor/:doctorId - Agenda del doctor
PUT    /citas/:id/cancelar     - Cancelar cita
```

### Estadísticas
```
GET    /estadisticas/doctores      - Citas por doctor
GET    /estadisticas/especialidades - Citas por especialidad
```

---

## ✅ Checklist de Requisitos Completados

- ✅ Todas las vistas principales funcionan (Dashboard, Pacientes, Doctores, Citas)
- ✅ CRUD completo para pacientes y doctores
- ✅ Crear y cancelar citas (edición por diseño no incluida)
- ✅ Validaciones del cliente funcionan correctamente
- ✅ Errores de API se muestran al usuario con mensajes claros
- ✅ Interfaz responsiva (probado en móvil, tablet, desktop)
- ✅ Código organizado en módulos independientes
- ✅ Código documentado con comentarios
- ✅ README completo con instrucciones

---

## 🎯 Flujos Principales

### Flujo 1: Registrar Paciente y Agendar Cita
1. Ir a Pacientes
2. Crear nuevo paciente
3. Ir a Doctores (opcional, si no existen)
4. Ir a Citas
5. Agendar cita (sistema valida disponibilidad)
6. Dashboard muestra cita inmediatamente

### Flujo 2: Gestión de Doctores
1. Ir a Doctores
2. Crear doctor con especialidad
3. Definir horarios y días disponibles
4. Sistema los hace disponibles para agendar citas

### Flujo 3: Monitoreo de Citas
1. Dashboard muestra citas de hoy
2. Notificación badge con próximas citas
3. Click en notificación para ver detalles
4. Cancelar si es necesario

---

## 📱 Responsividad

La interfaz se adapta a tres breakpoints principales:

| Dispositivo | Ancho | Características |
|-----------|-------|-----------------|
| **Móvil** | < 480px | Menú colapsable, formularios a pantalla completa |
| **Tablet** | 480px - 768px | Layout ajustado, dos columnas máximo |
| **Desktop** | > 768px | Layout completo, menú lateral visible |

---

## 🐛 Troubleshooting

### "No puedo conectar con el backend"
- Verifica que el servidor está corriendo en `http://localhost:3000`
- Revisa la consola del navegador (F12 > Console)
- Comprueba que no hay error CORS

### "Las validaciones no funcionan"
- Limpia el navegador cache (Ctrl+Shift+Delete)
- Recarga la página (F5)
- Verifica que todos los archivos JS están cargados (F12 > Network)

### "No puedo crear citas"
- Asegúrate de tener al menos 1 paciente y 1 doctor
- Verifica que la fecha sea futura
- Comprueba que el doctor está disponible ese día y hora

### "La interfaz se ve rota"
- Asegúrate de estar en un navegador moderno
- Limpia el cache de CSS (Ctrl+Shift+Delete)
- Recarga completamente (Ctrl+F5)

---

## 📸 Capturas de Pantalla

### Dashboard
- Estadísticas generales
- Citas del día en tabla
- Próximas citas en tarjetas

### Pacientes
- Lista de pacientes con búsqueda
- Formulario modal para crear/editar
- Información detallada

### Doctores
- Tarjetas de doctores con especialidad
- Horarios y días disponibles
- Formulario para crear/editar

### Citas
- Tabla de citas con filtros
- Modal de agendamiento con validaciones
- Vista detallada de cita

---

## 🔄 Validaciones Implementadas

### Cliente (JavaScript)
- ✅ Nombre: mínimo 2 caracteres
- ✅ Edad: entre 1 y 120 años
- ✅ Email: formato válido
- ✅ Teléfono: formato válido
- ✅ Campos obligatorios
- ✅ Disponibilidad de doctor (fecha/hora)

### Servidor (Node.js)
- ✅ Email único para pacientes
- ✅ Doctor existe
- ✅ Paciente existe
- ✅ Fecha de cita es futura
- ✅ Doctor trabaja ese día
- ✅ Hora dentro del horario
- ✅ No hay conflicto de citas

---

## 🚀 Mejoras Futuras Recomendadas

1. **Autenticación**: Implementar login con JWT
2. **Base de datos**: Migrar a MongoDB/PostgreSQL
3. **Edición de citas**: Permitir modificar citas existentes
4. **Notificaciones**: Enviar emails de recordatorio
5. **Reportes**: Generar reportes PDF de citas
6. **Paginación**: Para listados grandes
7. **Búsqueda avanzada**: Filtros más complejos
8. **Backups**: Sistema de respaldo automático

---

## 📄 Licencia

Este proyecto es de código abierto. Úsalo libremente para fines educativos y comerciales.

---

## 👨‍💻 Autor

**Sistema de Gestión de Citas Médicas** - 2025

---

## 📞 Soporte

Si encuentras problemas:
1. Revisa el console del navegador (F12)
2. Verifica los logs del servidor (terminal)
3. Asegúrate de que backend y frontend estén sincronizados

---

**Última actualización**: 8 de diciembre de 2025

Pasos para Ejecutar

1. **Clonar o descargar los archivos**
   ```bash
   git clone [url-del-repositorio]
   cd frontend