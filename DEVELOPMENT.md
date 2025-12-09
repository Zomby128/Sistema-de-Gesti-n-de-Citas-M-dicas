# 👨‍💻 Guía de Desarrollo - Sistema de Citas Médicas

## 📖 Índice
1. [Arquitectura](#arquitectura)
2. [Estructura de Código Frontend](#estructura-de-código-frontend)
3. [Estructura de Código Backend](#estructura-de-código-backend)
4. [Guía de Contribución](#guía-de-contribución)
5. [Estándares de Código](#estándares-de-código)

---

## 🏗️ Arquitectura

### Diagrama General
```
┌─────────────────────────────────────────────────────┐
│                   NAVEGADOR                         │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │         FRONTEND (Vanilla JS)                 │  │
│  ├──────────────────────────────────────────────┤  │
│  │ • HTML5 (estructura)                          │  │
│  │ • CSS3 (estilos responsivos)                 │  │
│  │ • JavaScript (lógica)                        │  │
│  │ • Fetch API (comunicación)                   │  │
│  └──────────────────────────────────────────────┘  │
│                        │                            │
│                        │ HTTP/REST                  │
│                        ▼                            │
│  ┌──────────────────────────────────────────────┐  │
│  │      BACKEND (Node.js + Express)             │  │
│  ├──────────────────────────────────────────────┤  │
│  │ • Express server (puerto 3000)               │  │
│  │ • CORS habilitado                            │  │
│  │ • Validaciones robustas                      │  │
│  │ • Persistencia en JSON                       │  │
│  └──────────────────────────────────────────────┘  │
│                        │                            │
│                        │ Lectura/Escritura          │
│                        ▼                            │
│  ┌──────────────────────────────────────────────┐  │
│  │      DATOS (Archivos JSON)                   │  │
│  ├──────────────────────────────────────────────┤  │
│  │ • data/pacientes.json                        │  │
│  │ • data/doctores.json                         │  │
│  │ • data/citas.json                            │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🎨 Estructura de Código Frontend

### 1. `api.js` - Capa de Comunicación

**Responsabilidades:**
- Wrapper alrededor de Fetch API
- Gestión de URLs base
- Formateo de requests/responses
- Manejo centralizado de errores

**Estructura:**
```javascript
// Función base de request
async function request(method, endpoint, body = null)

// Funciones específicas por recurso
async function getPacientes()
async function createPaciente(payload)
async function updatePaciente(id, payload)
async function deletePaciente(id)

// Similares para doctores y citas
// ...

// Helpers
function getCitasHoy()
function getCitasProximas()

// Exposición global
window.api = { ... }
window.API = { ... }  // Alias para compatibilidad
```

**Uso:**
```javascript
// Siempre esperar promesas
const pacientes = await API.getPacientes();
const nuevaPaciente = await API.createPaciente({ nombre, edad, ... });
```

---

### 2. `app.js` - Controlador Principal

**Responsabilidades:**
- Inicialización de la aplicación
- Gestión de navegación
- Orquestación de vistas
- Manejo de datos globales

**Estructura:**
```javascript
class SistemaCitasApp {
    constructor()              // Inicializa app
    init()                      // Carga inicial
    bindEvents()                // Event listeners
    loadInitialData()           // Carga datos al inicio
    showSection(section)        // Cambia sección
    
    // Cargadores de datos
    loadInitialData()
    cargarDashboard()
    cargarCitasHoy(citas)
    cargarCitasProximas(citas)
    
    // Utilidades
    mostrarToast(msg, tipo)
    mostrarError(mensaje)
    mostrarExito(mensaje)
}
```

**Ciclo de Vida:**
```
1. Constructor ejecuta init()
2. init() -> bindEvents() + loadInitialData()
3. loadInitialData() carga datos del servidor
4. showSection('dashboard') muestra dashboard
5. Usuario navega -> showSection(nueva_sección)
6. Cada sección carga sus propios datos
```

---

### 3. `pacientes.js` - Módulo de Pacientes

**Responsabilidades:**
- CRUD de pacientes
- Renderizado de lista
- Validaciones de formulario
- Modales y formularios

**Estructura:**
```javascript
class PacientesUI {
    static async cargarPacientes()           // Carga lista
    static renderizarPacientes(pacientes)    // Muestra tabla
    static mostrarFormularioPaciente(p)      // Modal de crear/editar
    static guardarPaciente(event, id)        // Guardar a BD
    static validarFormularioPaciente(data)   // Validar datos
    static buscarPacienteFunc(termino)       // Búsqueda
}
```

---

### 4. `doctores.js` - Módulo de Doctores

**Responsabilidades:**
- CRUD de doctores
- Renderizado en tarjetas
- Gestión de especialidades
- Horarios y disponibilidad

**Estructura:**
```javascript
class DoctoresUI {
    static async cargarDoctores()            // Carga lista
    static renderizarDoctores(doctores)      // Muestra tarjetas
    static mostrarFormularioDoctor(d)        // Modal de crear/editar
    static guardarDoctor(event, id)          // Guardar a BD
    static validarFormularioDoctor(data)     // Validar datos
}
```

---

### 5. `citas.js` - Módulo de Citas

**Responsabilidades:**
- CRUD de citas (crear/leer/cancelar)
- Validaciones complejas de disponibilidad
- Filtros avanzados
- Modales con validaciones en tiempo real

**Estructura:**
```javascript
class CitasUI {
    static async cargarCitas(filtros)        // Carga con filtros
    static renderizarCitas(citas)            // Muestra tabla
    static mostrarFormularioCita(cita)       // Modal de agendar
    static guardarCita(event, id)            // Guardar a BD
    static cancelarCita(id)                  // Cancelar cita
    static validarDisponibilidad()           // Valida en tiempo real
    static validarFormularioCita(data)       // Validar datos
}
```

---

## 🔧 Estructura de Código Backend

### 1. `server.js` - Servidor Express

**Secciones:**
```javascript
// CONFIGURACIÓN CORS
const corsOptions = { ... }
app.use(cors(corsOptions))

// MIDDLEWARE
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// INICIALIZACIÓN
const pacientesManager = new FileManager('pacientes.json')
const doctoresManager = new FileManager('doctores.json')
const citasManager = new FileManager('citas.json')

// ENDPOINTS
// ==================== PACIENTES ====================
app.post('/pacientes', ...)
app.get('/pacientes', ...)
app.get('/pacientes/:id', ...)
app.put('/pacientes/:id', ...)

// ==================== DOCTORES ====================
app.post('/doctores', ...)
app.get('/doctores', ...)
// ...

// ==================== CITAS ====================
app.post('/citas', ...)
app.get('/citas', ...)
app.get('/citas/proximas', ...)
app.put('/citas/:id/cancelar', ...)
// ...

// FUNCIONES AUXILIARES
function obtenerDiaSemana(fecha) { ... }
async function validarDisponibilidadCita(...) { ... }

// SERVIDOR ESCUCHA
app.listen(PORT, ...)
```

---

### 2. `utils/fileManager.js` - Gestor de Archivos

**Responsabilidades:**
- Lectura/escritura de archivos JSON
- Generación de IDs únicos
- Sincronización de datos

**Métodos:**
```javascript
class FileManager {
    constructor(filename)        // Inicializa con archivo
    async readData()             // Lee JSON
    async writeData(data)        // Escribe JSON
    generateId(prefix, items)    // Genera ID único
}
```

---

## 💡 Guía de Contribución

### 1. Agregar Nuevo Endpoint

**Paso 1:** Definir en `server.js`
```javascript
// GET /recursos/:id
app.get('/recursos/:id', async (req, res) => {
    try {
        const id = req.params.id;
        // Lógica aquí
        res.json(data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error interno' });
    }
});
```

**Paso 2:** Crear función en `api.js`
```javascript
async function getRecurso(id) {
    return await request('GET', `/recursos/${id}`);
}
```

**Paso 3:** Exponerla globalmente
```javascript
window.api.getRecurso = getRecurso;
window.API.getRecurso = window.API.getRecurso || window.api.getRecurso;
```

**Paso 4:** Usar en módulo
```javascript
const recurso = await API.getRecurso(id);
```

---

### 2. Agregar Validación Nueva

**Cliente (`pacientes.js`, `doctores.js`, etc.):**
```javascript
static validarFormulario(data) {
    const errors = {};
    
    if (!data.campo) {
        errors.campo = 'El campo es obligatorio';
    }
    
    if (data.campo.length < 3) {
        errors.campo = 'Mínimo 3 caracteres';
    }
    
    // Mostrar errores
    Object.keys(errors).forEach(field => {
        const errorDiv = document.getElementById(`error${field}`);
        if (errorDiv) errorDiv.textContent = errors[field];
    });
    
    return Object.keys(errors).length === 0;
}
```

**Servidor (`server.js`):**
```javascript
if (!nombre || nombre.trim().length < 2) {
    return res.status(400).json({ 
        error: 'El nombre debe tener mínimo 2 caracteres' 
    });
}
```

---

### 3. Agregar Nueva Sección

**Paso 1:** Crear HTML en `index.html`
```html
<section id="nuevaseccion" class="content-section">
    <div class="section-header">
        <h2>Nueva Sección</h2>
        <button id="newBtn">Nuevo</button>
    </div>
    <div id="content"></div>
</section>
```

**Paso 2:** Crear módulo `nuevaseccion.js`
```javascript
class NuevaseccionUI {
    static async cargarDatos() {
        const datos = await API.getDatos();
        this.renderizar(datos);
    }
    
    static renderizar(datos) {
        // Mostrar datos
    }
}
```

**Paso 3:** Agregar a `app.js`
```javascript
case 'nuevaseccion':
    await NuevaseccionUI.cargarDatos();
    break;
```

**Paso 4:** Incluir script en HTML
```html
<script src="js/nuevaseccion.js"></script>
```

---

## 📐 Estándares de Código

### Nombrado

**Variables/Funciones:**
```javascript
// ✅ Bueno - camelCase
const nombrePaciente = "Juan";
function cargarPacientes() { }
let citasHoy = [];

// ❌ Malo
const nombre_paciente = "Juan";
function cargar_pacientes() { }
let CITAS = [];
```

**Clases:**
```javascript
// ✅ Bueno - PascalCase
class PacientesUI { }
class FileManager { }

// ❌ Malo
class pacientesUI { }
class fileManager { }
```

**Constantes:**
```javascript
// ✅ Bueno
const API_URL = 'http://localhost:3000';
const TIMEOUT = 5000;

// ❌ Malo
const apiUrl = 'http://localhost:3000';
const timeout = 5000;
```

---

### Comentarios

```javascript
// ✅ Bueno
// Validar que el paciente existe
const paciente = pacientes.find(p => p.id === pacienteId);

// ✅ Bueno - Para funciones complejas
/**
 * Valida la disponibilidad de una cita
 * @param {string} doctorId - ID del doctor
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @param {string} hora - Hora en formato HH:MM
 * @returns {Promise<boolean>} true si está disponible
 */
async function validarDisponibilidadCita(doctorId, fecha, hora) { }

// ❌ Malo - Obviedad
const paciente = pacientes.find(p => p.id === pacienteId); // encontrar paciente
```

---

### Formato de Código

```javascript
// ✅ Bueno - Indentación consistente
function crearCita(data) {
    try {
        if (!data.fecha) {
            throw new Error('Fecha requerida');
        }
        
        const cita = {
            id: generateId(),
            ...data
        };
        
        return cita;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// ❌ Malo - Indentación inconsistente
function crearCita(data) {
try {
if (!data.fecha) {
throw new Error('Fecha requerida');
}
const cita = { id: generateId(), ...data };
return cita;
} catch (error) {
console.error('Error:', error);
throw error;
}
}
```

---

### Manejo de Errores

```javascript
// ✅ Bueno
try {
    const pacientes = await API.getPacientes();
    this.renderizar(pacientes);
} catch (error) {
    console.error('Error al cargar pacientes:', error);
    app.mostrarError('No se pudieron cargar los pacientes');
}

// ❌ Malo
const pacientes = await API.getPacientes();  // Sin try-catch
this.renderizar(pacientes);  // Qué pasa si falla?
```

---

### Async/Await vs Promises

```javascript
// ✅ Bueno - Async/Await
async function cargarDatos() {
    try {
        const datos = await API.getDatos();
        return datos;
    } catch (error) {
        console.error(error);
    }
}

// ⚠️ Aceptable - Promises
function cargarDatos() {
    return API.getDatos()
        .then(datos => datos)
        .catch(error => console.error(error));
}

// ❌ Malo - Sin manejo de promesas
const datos = API.getDatos();  // Retorna Promise!
console.log(datos);  // Promise { pending }
```

---

### Variables y Tipos

```javascript
// ✅ Bueno - Tipos claros
let contador = 0;              // number
let nombre = "Juan";           // string
let activo = true;             // boolean
let items = [];                // array
let obj = { id: 1 };           // object

// ❌ Malo - Tipos vagos
let x = 0;
let temp;
let datos = null;
let resultado;
```

---

## 🔍 Debugging

### Usar Console
```javascript
// ✅ Logs útiles
console.log('Pacientes cargados:', pacientes);
console.error('Error al guardar:', error);
console.warn('Esta función está deprecated');
console.table(pacientes);  // Tabla bonita

// ❌ Logs inútiles
console.log('ok');
console.log(123);
console.log(data);  // Qué es data?
```

### Usar DevTools
1. **F12** - Abre DevTools
2. **Console** - Ver logs y errores
3. **Network** - Ver requests HTTP
4. **Elements** - Inspeccionar HTML
5. **Sources** - Debuggear JavaScript

---

## 📊 Performance

### Buenas Prácticas

```javascript
// ✅ Bueno - Caché datos
let pacientesCache = null;
async function getPacientes() {
    if (pacientesCache) return pacientesCache;
    pacientesCache = await API.getPacientes();
    return pacientesCache;
}

// ❌ Malo - Llamadas repetidas
async function cargarPacientes() {
    const p1 = await API.getPacientes();
    const p2 = await API.getPacientes();  // Innecesario!
}
```

```javascript
// ✅ Bueno - Parallel requests
const [pacientes, doctores] = await Promise.all([
    API.getPacientes(),
    API.getDoctores()
]);

// ❌ Malo - Sequential requests
const pacientes = await API.getPacientes();
const doctores = await API.getDoctores();  // Espera a la anterior
```

---

## 🧪 Testing Manual

### Checklist
- [ ] Crear paciente con datos válidos
- [ ] Intentar crear paciente sin datos requeridos
- [ ] Crear doctor con especialidad personalizada
- [ ] Agendar cita en día y hora válida
- [ ] Intentar agendar en día donde doctor no trabaja
- [ ] Cancelar cita programada
- [ ] Filtrar citas por fecha
- [ ] Buscar pacientes por nombre
- [ ] Cargar en móvil (responsividad)
- [ ] Recargar página (datos persisten)

---

## 📚 Recursos Útiles

- [MDN - Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [MDN - Async/Await](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Async_await)
- [Express.js Docs](https://expressjs.com/)
- [CSS Media Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries)

---

**Última actualización**: 8 de diciembre de 2025

¡Gracias por contribuir! 🙏
