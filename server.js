const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const FileManager = require('./utils/fileManager');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Inicializar File Managers
const pacientesManager = new FileManager('pacientes.json');
const doctoresManager = new FileManager('doctores.json');
const citasManager = new FileManager('citas.json');

// ==================== PACIENTES ====================

// POST /pacientes - Registrar nuevo paciente
app.post('/pacientes', async (req, res) => {
    try {
        const { nombre, edad, telefono, email } = req.body;

        // Validaciones
        if (!nombre || !edad || !telefono || !email) {
            return res.status(400).json({ 
                error: 'Todos los campos son obligatorios: nombre, edad, telefono, email' 
            });
        }

        if (edad <= 0) {
            return res.status(400).json({ error: 'La edad debe ser mayor a 0' });
        }

        // Validar email único
        const pacientes = await pacientesManager.readData();
        const emailExiste = pacientes.some(p => p.email === email);
        if (emailExiste) {
            return res.status(400).json({ error: 'El email ya está registrado' });
        }

        // Crear nuevo paciente
        const nuevoPaciente = {
            id: await pacientesManager.getNextId('P'),
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
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// GET /pacientes - Listar todos los pacientes
app.get('/pacientes', async (req, res) => {
    try {
        const pacientes = await pacientesManager.readData();
        res.json(pacientes);
    } catch (error) {
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

        // Actualizar paciente
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

        // Obtener citas del paciente
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
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ==================== DOCTORES ====================

// POST /doctores - Registrar nuevo doctor
app.post('/doctores', async (req, res) => {
    try {
        const { nombre, especialidad, horarioInicio, horarioFin, diasDisponibles } = req.body;

        // Validaciones
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

        // Validar doctor único (nombre + especialidad)
        const doctores = await doctoresManager.readData();
        const doctorExiste = doctores.some(d => 
            d.nombre === nombre && d.especialidad === especialidad
        );
        if (doctorExiste) {
            return res.status(400).json({ error: 'Ya existe un doctor con ese nombre y especialidad' });
        }

        // Crear nuevo doctor
        const nuevoDoctor = {
            id: await doctoresManager.getNextId('D'),
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
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// GET /doctores - Listar todos los doctores
app.get('/doctores', async (req, res) => {
    try {
        const doctores = await doctoresManager.readData();
        res.json(doctores);
    } catch (error) {
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
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// GET /doctores/especialidad/:especialidad - Buscar doctores por especialidad
app.get('/doctores/especialidad/:especialidad', async (req, res) => {
    try {
        const especialidad = req.params.especialidad;
        const doctores = await doctoresManager.readData();
        const doctoresFiltrados = doctores.filter(d => 
            d.especialidad.toLowerCase().includes(especialidad.toLowerCase())
        );
        
        res.json(doctoresFiltrados);
    } catch (error) {
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

// POST /citas - Agendar nueva cita
app.post('/citas', async (req, res) => {
    try {
        const { pacienteId, doctorId, fecha, hora, motivo } = req.body;

        // Validaciones básicas
        if (!pacienteId || !doctorId || !fecha || !hora || !motivo) {
            return res.status(400).json({ 
                error: 'Todos los campos son obligatorios' 
            });
        }

        // Verificar que la fecha es futura
        const fechaCita = new Date(fecha);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        if (fechaCita < hoy) {
            return res.status(400).json({ error: 'La cita debe ser en una fecha futura' });
        }

        // Verificar que el paciente existe
        const pacientes = await pacientesManager.readData();
        const paciente = pacientes.find(p => p.id === pacienteId);
        if (!paciente) {
            return res.status(404).json({ error: 'Paciente no encontrado' });
        }

        // Verificar que el doctor existe
        const doctores = await doctoresManager.readData();
        const doctor = doctores.find(d => d.id === doctorId);
        if (!doctor) {
            return res.status(404).json({ error: 'Doctor no encontrado' });
        }

        // Verificar que el doctor trabaja ese día
        const diaSemana = obtenerDiaSemana(fecha);
        if (!doctor.diasDisponibles.includes(diaSemana)) {
            return res.status(400).json({ 
                error: `El doctor no trabaja los ${diaSemana}` 
            });
        }

        // Verificar que la hora está dentro del horario del doctor
        if (hora < doctor.horarioInicio || hora > doctor.horarioFin) {
            return res.status(400).json({ 
                error: `El doctor solo atiende de ${doctor.horarioInicio} a ${doctor.horarioFin}` 
            });
        }

        // Verificar disponibilidad
        const disponible = await validarDisponibilidadCita(doctorId, fecha, hora);
        if (!disponible) {
            return res.status(400).json({ 
                error: 'El doctor ya tiene una cita programada para esa fecha y hora' 
            });
        }

        // Crear nueva cita
        const citas = await citasManager.readData();
        const nuevaCita = {
            id: await citasManager.getNextId('C'),
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
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// GET /citas - Listar todas las citas (con filtros opcionales)
app.get('/citas', async (req, res) => {
    try {
        const { fecha, estado } = req.query;
        let citas = await citasManager.readData();

        // Aplicar filtros
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
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// GET /citas/:id - Obtener cita por ID
app.get('/citas/:id', async (req, res) => {
    try {
        const citas = await citasManager.readData();
        const cita = citas.find(c => c.id === req.params.id);
        
        if (!cita) {
            return res.status(404).json({ error: 'Cita no encontrada' });
        }

        // Enriquecer datos
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
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// GET /citas/doctor/:doctorId - Ver agenda de un doctor
app.get('/citas/doctor/:doctorId', async (req, res) => {
    try {
        const doctorId = req.params.doctorId;
        
        // Verificar que el doctor existe
        const doctores = await doctoresManager.readData();
        const doctor = doctores.find(d => d.id === doctorId);
        if (!doctor) {
            return res.status(404).json({ error: 'Doctor no encontrado' });
        }

        // Obtener citas del doctor
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
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ==================== ESTADÍSTICAS ====================

// GET /estadisticas/doctores - Doctor con más citas
app.get('/estadisticas/doctores', async (req, res) => {
    try {
        const citas = await citasManager.readData();
        const doctores = await doctoresManager.readData();

        // Contar citas por doctor (excluyendo canceladas)
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
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// GET /citas/proximas - Obtener citas próximas (siguientes 24 horas)
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
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ==================== INICIALIZACIÓN ====================

app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
});

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
    console.error('Error no manejado:', err);
    process.exit(1);
});