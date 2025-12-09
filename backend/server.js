const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const FileManager = require('./utils/fileManager');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
// ========== CONFIGURACIÓN CORS (ARREGLADO) ==========
// ¡ESTO DEBE IR AL PRINCIPIO!
const corsOptions = {
    origin: '*',  // Permite todos los orígenes
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Middleware para manejar preflight requests
app.options('*', cors(corsOptions));

// También agregamos headers manualmente por seguridad
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Content-Length');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Interceptar preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoint raíz para verificar que la API funciona
app.get('/', (req, res) => {
    res.json({
        mensaje: 'API de Sistema de Citas Médicas funcionando',
        version: '1.0.0',
        status: 'OK',
        timestamp: new Date().toISOString(),
        endpoints: {
            pacientes: '/pacientes',
            doctores: '/doctores',
            citas: '/citas',
            estadisticas: '/estadisticas'
        }
    });
});

// Inicializar gestores de datos JSON
const pacientesManager = new FileManager('pacientes.json');
const doctoresManager = new FileManager('doctores.json');
const citasManager = new FileManager('citas.json');

// ==================== PACIENTES ====================

// POST /pacientes - Crear nuevo paciente
app.post('/pacientes', async (req, res) => {
    try {
        const { nombre, edad, telefono, email } = req.body;

        // Validar campos requeridos
        if (!nombre || !edad || !telefono || !email) {
            return res.status(400).json({ 
                error: 'Todos los campos son obligatorios: nombre, edad, telefono, email' 
            });
        }

        if (edad <= 0) {
            return res.status(400).json({ error: 'La edad debe ser mayor a 0' });
        }

        // Verificar que el email no esté registrado
        const pacientes = await pacientesManager.read();
        const emailExiste = pacientes.some(p => p.email === email);
        if (emailExiste) {
            return res.status(400).json({ error: 'El email ya está registrado' });
        }

        // Crear y guardar nuevo paciente
        const nuevoPaciente = {
            id: pacientesManager.generateId('P', pacientes),
            nombre,
            edad,
            telefono,
            email,
            fechaRegistro: new Date().toISOString().split('T')[0]
        };

        pacientes.push(nuevoPaciente);
        await pacientesManager.writeData(pacientes);

        res.status(201).json(nuevoPaciente);
    } catch (error) {
        console.error('Error en POST /pacientes:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// GET /pacientes - Listar todos los pacientes
app.get('/pacientes', async (req, res) => {
    try {
        const pacientes = await pacientesManager.readData();
        res.json(pacientes);
    } catch (error) {
        console.error('Error en GET /pacientes:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// GET /pacientes/:id - Obtener paciente por ID
app.get('/pacientes/:id', async (req, res) => {
    try {
        const pacientes = await pacientesManager.readData();
        const paciente = pacientes.find(p => p.id === req.params.id);
        
        if (!paciente) {
            return res.status(404).json({ error: 'Paciente no encontrado' });
        }
        
        res.json(paciente);
    } catch (error) {
        console.error('Error en GET /pacientes/:id:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// PUT /pacientes/:id - Actualizar datos del paciente
app.put('/pacientes/:id', async (req, res) => {
    try {
        const { nombre, edad, telefono, email } = req.body;
        const pacientes = await pacientesManager.readData();
        const pacienteIndex = pacientes.findIndex(p => p.id === req.params.id);
        
        if (pacienteIndex === -1) {
            return res.status(404).json({ error: 'Paciente no encontrado' });
        }

        // Validaciones
        if (edad && edad <= 0) {
            return res.status(400).json({ error: 'La edad debe ser mayor a 0' });
        }

        if (email) {
            const emailExiste = pacientes.some((p, index) => 
                p.email === email && index !== pacienteIndex
            );
            if (emailExiste) {
                return res.status(400).json({ error: 'El email ya está registrado' });
            }
        }

        // Guardar cambios del paciente
        pacientes[pacienteIndex] = {
            ...pacientes[pacienteIndex],
            ...(nombre && { nombre }),
            ...(edad && { edad }),
            ...(telefono && { telefono }),
            ...(email && { email })
        };

        await pacientesManager.writeData(pacientes);
        res.json(pacientes[pacienteIndex]);
    } catch (error) {
        console.error('Error en PUT /pacientes/:id:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// GET /pacientes/:id/historial - Ver historial de citas del paciente
app.get('/pacientes/:id/historial', async (req, res) => {
    try {
        const pacienteId = req.params.id;
        
        // Verificar que el paciente existe
        const pacientes = await pacientesManager.readData();
        const paciente = pacientes.find(p => p.id === pacienteId);
        if (!paciente) {
            return res.status(404).json({ error: 'Paciente no encontrado' });
        }

        // Cargar historial de citas con información de doctores
        const citas = await citasManager.readData();
        const doctores = await doctoresManager.readData();

        const historial = citas
            .filter(cita => cita.pacienteId === pacienteId)
            .map(cita => {
                const doctor = doctores.find(d => d.id === cita.doctorId);
                return {
                    ...cita,
                    doctorNombre: doctor ? doctor.nombre : 'Doctor no encontrado',
                    especialidad: doctor ? doctor.especialidad : 'Especialidad no encontrada'
                };
            });

        res.json(historial);
    } catch (error) {
        console.error('Error en GET /pacientes/:id/historial:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ==================== DOCTORES ====================

// POST /doctores - Crear nuevo doctor
app.post('/doctores', async (req, res) => {
    try {
        const { nombre, especialidad, horarioInicio, horarioFin, diasDisponibles } = req.body;

        // Validar campos requeridos
        if (!nombre || !especialidad || !horarioInicio || !horarioFin || !diasDisponibles) {
            return res.status(400).json({ 
                error: 'Todos los campos son obligatorios' 
            });
        }

        if (horarioInicio >= horarioFin) {
            return res.status(400).json({ error: 'El horario de inicio debe ser menor al horario de fin' });
        }

        if (!Array.isArray(diasDisponibles) || diasDisponibles.length === 0) {
            return res.status(400).json({ error: 'Debe especificar al menos un día disponible' });
        }

        // Verificar que no exista doctor con mismo nombre y especialidad
        const doctores = await doctoresManager.readData();
        const doctorExiste = doctores.some(d => 
            d.nombre === nombre && d.especialidad === especialidad
        );
        if (doctorExiste) {
            return res.status(400).json({ error: 'Ya existe un doctor con ese nombre y especialidad' });
        }

        // Crear y guardar nuevo doctor
        const nuevoDoctor = {
            id: doctoresManager.generateId('D', doctores),
            nombre,
            especialidad,
            horarioInicio,
            horarioFin,
            diasDisponibles
        };

        doctores.push(nuevoDoctor);
        await doctoresManager.writeData(doctores);

        res.status(201).json(nuevoDoctor);
    } catch (error) {
        console.error('Error en POST /doctores:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// GET /doctores - Listar todos los doctores
app.get('/doctores', async (req, res) => {
    try {
        const doctores = await doctoresManager.readData();
        res.json(doctores);
    } catch (error) {
        console.error('Error en GET /doctores:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// GET /doctores/:id - Obtener doctor por ID
app.get('/doctores/:id', async (req, res) => {
    try {
        const doctores = await doctoresManager.readData();
        const doctor = doctores.find(d => d.id === req.params.id);
        
        if (!doctor) {
            return res.status(404).json({ error: 'Doctor no encontrado' });
        }
        
        res.json(doctor);
    } catch (error) {
        console.error('Error en GET /doctores/:id:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// GET /doctores/especialidad/:especialidad - Filtrar doctores por especialidad
app.get('/doctores/especialidad/:especialidad', async (req, res) => {
    try {
        const especialidad = req.params.especialidad;
        const doctores = await doctoresManager.readData();
        const doctoresFiltrados = doctores.filter(d => 
            d.especialidad.toLowerCase().includes(especialidad.toLowerCase())
        );
        
        res.json(doctoresFiltrados);
    } catch (error) {
        console.error('Error en GET /doctores/especialidad/:especialidad:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ==================== CITAS ====================

// Función auxiliar para validar disponibilidad
async function validarDisponibilidadCita(doctorId, fecha, hora) {
    const citas = await citasManager.readData();
    
    // Verificar si ya existe una cita para el mismo doctor, fecha y hora
    const citaExistente = citas.find(cita => 
        cita.doctorId === doctorId && 
        cita.fecha === fecha && 
        cita.hora === hora &&
        cita.estado !== 'cancelada'
    );
    
    return !citaExistente;
}

// Función auxiliar para obtener día de la semana
function obtenerDiaSemana(fecha) {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const date = new Date(fecha);
    return dias[date.getDay()];
}

// POST /citas - Crear nueva cita
app.post('/citas', async (req, res) => {
    try {
        const { pacienteId, doctorId, fecha, hora, motivo } = req.body;

        // Validar campos requeridos
        if (!pacienteId || !doctorId || !fecha || !hora || !motivo) {
            return res.status(400).json({ 
                error: 'Todos los campos son obligatorios' 
            });
        }

        // Verificar fecha futura
        const fechaCita = new Date(fecha);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        if (fechaCita < hoy) {
            return res.status(400).json({ error: 'La cita debe ser en una fecha futura' });
        }

        // Verificar que paciente existe
        const pacientes = await pacientesManager.readData();
        const paciente = pacientes.find(p => p.id === pacienteId);
        if (!paciente) {
            return res.status(404).json({ error: 'Paciente no encontrado' });
        }

        // Verificar que doctor existe
        const doctores = await doctoresManager.readData();
        const doctor = doctores.find(d => d.id === doctorId);
        if (!doctor) {
            return res.status(404).json({ error: 'Doctor no encontrado' });
        }

        // Verificar que doctor trabaja ese día
        const diaSemana = obtenerDiaSemana(fecha);
        if (!doctor.diasDisponibles.includes(diaSemana)) {
            return res.status(400).json({ 
                error: `El doctor no trabaja los ${diaSemana}` 
            });
        }

        // Verificar que hora esté en horario del doctor
        if (hora < doctor.horarioInicio || hora > doctor.horarioFin) {
            return res.status(400).json({ 
                error: `El doctor solo atiende de ${doctor.horarioInicio} a ${doctor.horarioFin}` 
            });
        }

        // Verificar que el horario no está ocupado
        const disponible = await validarDisponibilidadCita(doctorId, fecha, hora);
        if (!disponible) {
            return res.status(400).json({ 
                error: 'El doctor ya tiene una cita programada para esa fecha y hora' 
            });
        }

        // Crear y guardar nueva cita
        const citas = await citasManager.readData();
        const nuevaCita = {
            id: citasManager.generateId('C', citas),
            pacienteId,
            doctorId,
            fecha,
            hora,
            motivo,
            estado: 'programada',
            fechaCreacion: new Date().toISOString()
        };

        citas.push(nuevaCita);
        await citasManager.writeData(citas);

        res.status(201).json(nuevaCita);
    } catch (error) {
        console.error('Error en POST /citas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// GET /citas - Listar citas (con filtros opcionales)
app.get('/citas', async (req, res) => {
    try {
        const { fecha, estado } = req.query;
        let citas = await citasManager.readData();

        // Filtrar por fecha y estado si se proporcionan
        if (fecha) {
            citas = citas.filter(cita => cita.fecha === fecha);
        }
        if (estado) {
            citas = citas.filter(cita => cita.estado === estado);
        }

        // Enriquecer datos con información de pacientes y doctores
        const pacientes = await pacientesManager.readData();
        const doctores = await doctoresManager.readData();

        const citasEnriquecidas = citas.map(cita => {
            const paciente = pacientes.find(p => p.id === cita.pacienteId);
            const doctor = doctores.find(d => d.id === cita.doctorId);
            
            return {
                ...cita,
                pacienteNombre: paciente ? paciente.nombre : 'Paciente no encontrado',
                doctorNombre: doctor ? doctor.nombre : 'Doctor no encontrado',
                especialidad: doctor ? doctor.especialidad : 'Especialidad no encontrada'
            };
        });

        res.json(citasEnriquecidas);
    } catch (error) {
        console.error('Error en GET /citas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// GET /citas/proximas - Obtener citas próximas (siguientes 24 horas)
// GET /citas/proximas - Obtener citas de las próximas 24 horas
// (DEBE IR ANTES DE /citas/:id para evitar conflicto de rutas)
app.get('/citas/proximas', async (req, res) => {
    try {
        const citas = await citasManager.readData();
        const pacientes = await pacientesManager.readData();
        const doctores = await doctoresManager.readData();

        const ahora = new Date();
        const mañana = new Date(ahora.getTime() + 24 * 60 * 60 * 1000);

        const citasProximas = citas
            .filter(cita => {
                if (cita.estado !== 'programada') return false;
                
                const fechaCita = new Date(`${cita.fecha}T${cita.hora}`);
                return fechaCita > ahora && fechaCita <= mañana;
            })
            .map(cita => {
                const paciente = pacientes.find(p => p.id === cita.pacienteId);
                const doctor = doctores.find(d => d.id === cita.doctorId);
                
                return {
                    ...cita,
                    pacienteNombre: paciente ? paciente.nombre : 'Paciente no encontrado',
                    doctorNombre: doctor ? doctor.nombre : 'Doctor no encontrado',
                    telefonoPaciente: paciente ? paciente.telefono : 'No disponible'
                };
            });

        res.json(citasProximas);
    } catch (error) {
        console.error('Error en GET /citas/proximas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// GET /citas/:id - Obtener cita con detalles de paciente y doctor
app.get('/citas/:id', async (req, res) => {
    try {
        const citas = await citasManager.readData();
        const cita = citas.find(c => c.id === req.params.id);
        
        if (!cita) {
            return res.status(404).json({ error: 'Cita no encontrada' });
        }

        // Cargar información de paciente y doctor
        const pacientes = await pacientesManager.readData();
        const doctores = await doctoresManager.readData();
        
        const paciente = pacientes.find(p => p.id === cita.pacienteId);
        const doctor = doctores.find(d => d.id === cita.doctorId);

        const citaEnriquecida = {
            ...cita,
            pacienteNombre: paciente ? paciente.nombre : 'Paciente no encontrado',
            doctorNombre: doctor ? doctor.nombre : 'Doctor no encontrado',
            especialidad: doctor ? doctor.especialidad : 'Especialidad no encontrada'
        };
        
        res.json(citaEnriquecida);
    } catch (error) {
        console.error('Error en GET /citas/:id:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// PUT /citas/:id - Editar cita (fecha, hora, motivo)
app.put('/citas/:id', async (req, res) => {
    try {
        const { fecha, hora, motivo } = req.body;
        const citas = await citasManager.readData();
        const citaIndex = citas.findIndex(c => c.id === req.params.id);
        
        if (citaIndex === -1) {
            return res.status(404).json({ error: 'Cita no encontrada' });
        }

        // Solo se pueden editar citas programadas
        if (citas[citaIndex].estado !== 'programada') {
            return res.status(400).json({ 
                error: 'Solo se pueden editar citas con estado "programada"' 
            });
        }

        // Validaciones
        if (fecha) {
            const fechaCita = new Date(fecha);
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            
            if (fechaCita < hoy) {
                return res.status(400).json({ error: 'La fecha debe ser futura' });
            }
        }

        // Si se cambia doctor, fecha o hora, validar disponibilidad
        const doctorId = citas[citaIndex].doctorId;
        const fechaFinal = fecha || citas[citaIndex].fecha;
        const horaFinal = hora || citas[citaIndex].hora;

        if (fecha || hora) {
            // Verificar disponibilidad (excluyendo la cita actual)
            const otrasCitas = citas.filter(c => c.id !== req.params.id);
            const conflicto = otrasCitas.find(c => 
                c.doctorId === doctorId &&
                c.fecha === fechaFinal &&
                c.hora === horaFinal &&
                c.estado !== 'cancelada'
            );

            if (conflicto) {
                return res.status(400).json({ 
                    error: 'El doctor ya tiene una cita en esa fecha y hora' 
                });
            }

            // Validar que el doctor trabaja ese día
            const doctores = await doctoresManager.readData();
            const doctor = doctores.find(d => d.id === doctorId);
            if (!doctor) {
                return res.status(404).json({ error: 'Doctor no encontrado' });
            }

            const diaSemana = obtenerDiaSemana(fechaFinal);
            if (!doctor.diasDisponibles.includes(diaSemana)) {
                return res.status(400).json({ 
                    error: `El doctor no trabaja los ${diaSemana}` 
                });
            }

            // Validar horario
            if (horaFinal < doctor.horarioInicio || horaFinal > doctor.horarioFin) {
                return res.status(400).json({ 
                    error: `El doctor solo atiende de ${doctor.horarioInicio} a ${doctor.horarioFin}` 
                });
            }
        }

        // Actualizar cita
        if (fecha) citas[citaIndex].fecha = fecha;
        if (hora) citas[citaIndex].hora = hora;
        if (motivo) citas[citaIndex].motivo = motivo;
        citas[citaIndex].fechaModificacion = new Date().toISOString();

        await citasManager.writeData(citas);
        res.json(citas[citaIndex]);
    } catch (error) {
        console.error('Error en PUT /citas/:id:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// PUT /citas/:id/cancelar - Cancelar una cita
app.put('/citas/:id/cancelar', async (req, res) => {
    try {
        const citas = await citasManager.readData();
        const citaIndex = citas.findIndex(c => c.id === req.params.id);
        
        if (citaIndex === -1) {
            return res.status(404).json({ error: 'Cita no encontrada' });
        }

        if (citas[citaIndex].estado !== 'programada') {
            return res.status(400).json({ 
                error: 'Solo se pueden cancelar citas con estado "programada"' 
            });
        }

        citas[citaIndex].estado = 'cancelada';
        citas[citaIndex].fechaCancelacion = new Date().toISOString();

        await citasManager.writeData(citas);
        res.json(citas[citaIndex]);
    } catch (error) {
        console.error('Error en PUT /citas/:id/cancelar:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// GET /citas/doctor/:doctorId - Obtener agenda del doctor
app.get('/citas/doctor/:doctorId', async (req, res) => {
    try {
        const doctorId = req.params.doctorId;
        
        // Verificar que doctor existe
        const doctores = await doctoresManager.readData();
        const doctor = doctores.find(d => d.id === doctorId);
        if (!doctor) {
            return res.status(404).json({ error: 'Doctor no encontrado' });
        }

        // Cargar citas del doctor con nombres de pacientes
        const citas = await citasManager.readData();
        const pacientes = await pacientesManager.readData();

        const agenda = citas
            .filter(cita => cita.doctorId === doctorId)
            .map(cita => {
                const paciente = pacientes.find(p => p.id === cita.pacienteId);
                return {
                    ...cita,
                    pacienteNombre: paciente ? paciente.nombre : 'Paciente no encontrado'
                };
            });

        res.json({
            doctor: doctor.nombre,
            especialidad: doctor.especialidad,
            agenda
        });
    } catch (error) {
        console.error('Error en GET /citas/doctor/:doctorId:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ==================== ESTADÍSTICAS ====================

// GET /estadisticas/doctores - Doctor con más citas
app.get('/estadisticas/doctores', async (req, res) => {
    try {
        const citas = await citasManager.readData();
        const doctores = await doctoresManager.readData();

        // Contar citas por doctor (sin contar canceladas)
        const citasPorDoctor = {};
        citas.forEach(cita => {
            if (cita.estado !== 'cancelada') {
                citasPorDoctor[cita.doctorId] = (citasPorDoctor[cita.doctorId] || 0) + 1;
            }
        });

        // Encontrar doctor con más citas
        let doctorConMasCitas = null;
        let maxCitas = 0;

        for (const [doctorId, cantidad] of Object.entries(citasPorDoctor)) {
            if (cantidad > maxCitas) {
                maxCitas = cantidad;
                const doctor = doctores.find(d => d.id === doctorId);
                doctorConMasCitas = {
                    doctorId,
                    doctorNombre: doctor ? doctor.nombre : 'Doctor no encontrado',
                    especialidad: doctor ? doctor.especialidad : 'Especialidad no encontrada',
                    totalCitas: cantidad
                };
            }
        }

        res.json(doctorConMasCitas || { mensaje: 'No hay citas registradas' });
    } catch (error) {
        console.error('Error en GET /estadisticas/doctores:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// GET /estadisticas/especialidades - Especialidad más solicitada
app.get('/estadisticas/especialidades', async (req, res) => {
    try {
        const citas = await citasManager.readData();
        const doctores = await doctoresManager.readData();

        // Contar citas por especialidad (excluyendo canceladas)
        const citasPorEspecialidad = {};
        citas.forEach(cita => {
            if (cita.estado !== 'cancelada') {
                const doctor = doctores.find(d => d.id === cita.doctorId);
                if (doctor) {
                    citasPorEspecialidad[doctor.especialidad] = 
                        (citasPorEspecialidad[doctor.especialidad] || 0) + 1;
                }
            }
        });

        // Encontrar especialidad más solicitada
        let especialidadMasSolicitada = null;
        let maxCitas = 0;

        for (const [especialidad, cantidad] of Object.entries(citasPorEspecialidad)) {
            if (cantidad > maxCitas) {
                maxCitas = cantidad;
                especialidadMasSolicitada = {
                    especialidad,
                    totalCitas: cantidad
                };
            }
        }

        res.json(especialidadMasSolicitada || { mensaje: 'No hay citas registradas' });
    } catch (error) {
        console.error('Error en GET /estadisticas/especialidades:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// GET /estadisticas/citas-mes - Conteo de citas por mes (últimos 12 meses hasta hoy)
app.get('/estadisticas/citas-mes', async (req, res) => {
    try {
        const citas = await citasManager.readData();

        // Construir mapa de los últimos 12 meses hasta hoy (sin incluir meses futuros)
        const labels = [];
        const totals = [];
        const canceladas = [];

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        // Iterar últimos 12 meses, empezando 11 meses atrás
        for (let i = 11; i >= 0; i--) {
            let m = currentMonth - i;
            let y = currentYear;

            // Ajustar año si el mes es negativo
            while (m < 0) {
                m += 12;
                y--;
            }

            const yyyy = y;
            const mm = String(m + 1).padStart(2, '0');
            const label = `${yyyy}-${mm}`;
            labels.push(label);

            // Comparar fechas como strings (YYYY-MM) para evitar problemas de zona horaria
            const citasEnMes = citas.filter(c => c.fecha.startsWith(label));

            totals.push(citasEnMes.length);
            canceladas.push(citasEnMes.filter(c => c.estado === 'cancelada').length);
        }

        res.json({ labels, totals, canceladas });
    } catch (error) {
        console.error('Error en GET /estadisticas/citas-mes:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// GET /estadisticas/tasa-cancelacion - Tasa de cancelación en un periodo (días)
app.get('/estadisticas/tasa-cancelacion', async (req, res) => {
    try {
        const dias = parseInt(req.query.dias || '30', 10);
        const citas = await citasManager.readData();

        const ahora = new Date();
        const inicio = new Date(ahora.getTime() - dias * 24 * 60 * 60 * 1000);

        // Comparar fechas como strings (YYYY-MM-DD) para evitar problemas de zona horaria
        const fechaInicio = inicio.toISOString().split('T')[0];
        const fechaFin = ahora.toISOString().split('T')[0];

        const periodoCitas = citas.filter(c => c.fecha >= fechaInicio && c.fecha <= fechaFin);

        const total = periodoCitas.length;
        const canceladas = periodoCitas.filter(c => c.estado === 'cancelada').length;
        const tasa = total === 0 ? 0 : Number(((canceladas / total) * 100).toFixed(2));

        res.json({ dias, total, canceladas, tasa });
    } catch (error) {
        console.error('Error en GET /estadisticas/tasa-cancelacion:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ==================== BÚSQUEDAS AVANZADAS ====================

// GET /doctores/disponibles - Buscar doctores disponibles en fecha y hora específica
app.get('/doctores/disponibles', async (req, res) => {
    try {
        const { fecha, hora } = req.query;
        
        if (!fecha || !hora) {
            return res.status(400).json({ 
                error: 'Los parámetros fecha y hora son obligatorios' 
            });
        }

        const doctores = await doctoresManager.readData();
        const citas = await citasManager.readData();

        // Obtener día de la semana
        const diaSemana = obtenerDiaSemana(fecha);

        // Filtrar doctores disponibles
        const doctoresDisponibles = doctores.filter(doctor => {
            // Verificar que trabaja ese día
            if (!doctor.diasDisponibles.includes(diaSemana)) {
                return false;
            }

            // Verificar que la hora está dentro de su horario
            if (hora < doctor.horarioInicio || hora > doctor.horarioFin) {
                return false;
            }

            // Verificar que no tiene cita programada para esa fecha y hora
            const tieneCita = citas.some(cita => 
                cita.doctorId === doctor.id && 
                cita.fecha === fecha && 
                cita.hora === hora &&
                cita.estado !== 'cancelada'
            );

            return !tieneCita;
        });

        res.json(doctoresDisponibles);
    } catch (error) {
        console.error('Error en GET /doctores/disponibles:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ==================== INICIALIZACIÓN ====================

// Ruta 404
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Endpoint no encontrado' });
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error('Error global:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
});

const path = require('path');

// Servir frontend desde backend
app.use(express.static(path.join(__dirname, '../frontend')));

// Ruta para manejo de rutas del frontend (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor backend funcionando en http://localhost:${PORT}`);
    console.log(`✅ CORS configurado para permitir todos los orígenes`);
    console.log(`📊 Prueba la API en: http://localhost:${PORT}/`);
    console.log(`🔧 Frontend disponible en: http://localhost:59481`);
});

// Manejo de promesas rechazadas no atrapadas
process.on('unhandledRejection', (err) => {
    console.error('Error no manejado:', err);
    process.exit(1);
});