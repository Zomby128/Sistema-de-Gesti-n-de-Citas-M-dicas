// Aplicación principal del frontend
if (window.SistemaCitasApp) {
  console.warn('SistemaCitasApp ya está definido — omitiendo carga duplicada.');
} else {
class SistemaCitasApp {
    constructor() {
        this.currentSection = 'dashboard';
        this.isLoading = false;
        this.monthlyChart = null;
        // Cache de datos para búsquedas
        this.cachedPacientes = [];
        this.cachedDoctores = [];
        this.init();
    }

    async init() {
        this.bindEvents();
        
        // Solicitar permisos de notificación y iniciar monitoreo
        const hasNotificationPermission = await NotificationsManager.requestPermission();
        if (hasNotificationPermission) {
            NotificationsManager.startMonitoring();
        }
        
        await this.loadInitialData();
        this.showSection('dashboard');
    }

    bindEvents() {
        // Configurar navegación entre secciones
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.showSection(section);
            });
        });

        // Toggle menú en móviles
        document.getElementById('menuToggle')?.addEventListener('click', () => {
            document.querySelector('.nav-center').classList.toggle('active');
        });

        // Botones para crear nuevo paciente
        document.getElementById('newPatientBtn')?.addEventListener('click', () => {
            PacientesUI.mostrarFormularioPaciente();
        });

        document.getElementById('addFirstPatient')?.addEventListener('click', () => {
            PacientesUI.mostrarFormularioPaciente();
        });

        document.getElementById('newDoctorBtn')?.addEventListener('click', () => {
            DoctoresUI.mostrarFormularioDoctor();
        });

        document.getElementById('addFirstDoctor')?.addEventListener('click', () => {
            DoctoresUI.mostrarFormularioDoctor();
        });

        document.getElementById('newAppointmentBtn')?.addEventListener('click', () => {
            CitasUI.mostrarFormularioCita();
        });

        document.getElementById('newAppointmentSectionBtn')?.addEventListener('click', () => {
            CitasUI.mostrarFormularioCita();
        });

        document.getElementById('addFirstAppointment')?.addEventListener('click', () => {
            CitasUI.mostrarFormularioCita();
        });

        // Configurar filtros de citas
        document.getElementById('filterDate')?.addEventListener('change', (e) => {
            this.filtrarCitas();
        });

        document.getElementById('filterStatus')?.addEventListener('change', (e) => {
            this.filtrarCitas();
        });

        document.getElementById('filterDoctor')?.addEventListener('change', (e) => {
            this.filtrarCitas();
        });

        // Búsqueda en tiempo real de pacientes
        document.getElementById('searchPatient')?.addEventListener('input', (e) => {
            this.buscarPacientes(e.target.value);
        });

        // Búsqueda en tiempo real de doctores
        document.getElementById('searchDoctor')?.addEventListener('input', (e) => {
            this.buscarDoctores(e.target.value);
        });

        // Notificaciones de citas próximas
        document.getElementById('notificationBell')?.addEventListener('click', () => {
            this.mostrarNotificaciones();
        });

        // Toggle de tema oscuro/claro
        document.getElementById('themeToggle')?.addEventListener('click', () => {
            ThemeManager.toggle();
            this.updateThemeIcon();
        });

        // Actualizar icono del tema cuando cambia
        window.addEventListener('themechange', () => {
            this.updateThemeIcon();
        });

        // Inicializar autocomplete para búsquedas
        this.initializeAutocomplete();
    }

    updateThemeIcon() {
        const btn = document.getElementById('themeToggle');
        if (!btn) return;
        const icon = btn.querySelector('i');
        const theme = ThemeManager.getCurrent();
        icon.className = `fas fa-${theme === 'dark' ? 'sun' : 'moon'}`;
        btn.title = `Cambiar a tema ${theme === 'dark' ? 'claro' : 'oscuro'}`;
    }

    initializeAutocomplete() {
        // Autocomplete para pacientes
        AutocompleteManager.create({
            inputSelector: '#searchPatient',
            dataSource: async () => {
                try {
                    return await API.getPacientes();
                } catch (e) {
                    console.error('Error cargando pacientes para autocomplete:', e);
                    return [];
                }
            },
            displayField: 'nombre',
            valueField: 'id',
            minChars: 1,
            maxResults: 8,
            onSelect: (paciente) => {
                this.buscarPacientes(paciente.nombre);
            },
            formatResult: (paciente, displayText) => `
                <div>
                    <div class="autocomplete-item-text">
                        <i class="fas fa-user-injured"></i> ${displayText}
                    </div>
                    <div class="autocomplete-item-meta">ID: ${paciente.id} · Edad: ${paciente.edad}</div>
                </div>
            `
        });

        // Autocomplete para doctores
        AutocompleteManager.create({
            inputSelector: '#searchDoctor',
            dataSource: async () => {
                try {
                    return await API.getDoctores();
                } catch (e) {
                    console.error('Error cargando doctores para autocomplete:', e);
                    return [];
                }
            },
            displayField: 'nombre',
            valueField: 'id',
            minChars: 1,
            maxResults: 8,
            onSelect: (doctor) => {
                this.buscarDoctores(doctor.nombre);
            },
            formatResult: (doctor, displayText) => `
                <div>
                    <div class="autocomplete-item-text">
                        <i class="fas fa-user-md"></i> ${displayText}
                    </div>
                    <div class="autocomplete-item-meta">${doctor.especialidad}</div>
                </div>
            `
        });
    }

    async loadInitialData() {
        try {
            this.showLoading();
            
            // Cargar todos los datos en paralelo
            const [pacientes, doctores, citasHoy, citasProximas] = await Promise.all([
                API.getPacientes(),
                API.getDoctores(),
                API.getCitasHoy(),
                API.getCitasProximas()
            ]);

            // Cachear datos para búsquedas
            this.cachedPacientes = pacientes;
            this.cachedDoctores = doctores;

            // Actualizar dashboard con datos iniciales
            this.actualizarEstadisticas(pacientes, doctores, citasHoy, citasProximas);
            this.cargarCitasHoy(citasHoy);
            this.cargarCitasProximas(citasProximas);
            this.cargarFiltroDoctores(doctores);

        } catch (error) {
            this.mostrarError('Error al cargar datos iniciales');
            console.error(error);
        } finally {
            this.hideLoading();
        }
    }

    actualizarEstadisticas(pacientes, doctores, citasHoy, citasProximas) {
        document.getElementById('totalPacientes').textContent = pacientes.length;
        document.getElementById('totalDoctores').textContent = doctores.length;
        document.getElementById('citasHoy').textContent = citasHoy.length;
        document.getElementById('citasProximas').textContent = citasProximas.length;

        // Actualizar notificaciones
        const notificationCount = citasProximas.length;
        const notificationElement = document.getElementById('notificationCount');
        if (notificationElement) {
            notificationElement.textContent = notificationCount;
            notificationElement.style.display = notificationCount > 0 ? 'block' : 'none';
        }
    }

    async cargarCitasHoy(citas) {
        const tbody = document.getElementById('todayAppointments');
        const emptyState = document.getElementById('noAppointmentsToday');

        if (!citas || citas.length === 0) {
            if (tbody) tbody.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        // Obtener información completa de pacientes y doctores para cada cita
        const citasConInfo = await Promise.all(
            citas.map(async (cita) => {
                try {
                    const [paciente, doctor] = await Promise.all([
                        API.getPaciente(cita.pacienteId).catch(() => ({ nombre: 'N/A' })),
                        API.getDoctor(cita.doctorId).catch(() => ({ nombre: 'N/A', especialidad: 'N/A' }))
                    ]);
                    
                    return {
                        cita,
                        pacienteNombre: paciente.nombre,
                        doctorNombre: doctor.nombre,
                        especialidad: doctor.especialidad
                    };
                } catch (error) {
                    return { cita, pacienteNombre: 'N/A', doctorNombre: 'N/A', especialidad: 'N/A' };
                }
            })
        );

        if (tbody) {
            tbody.innerHTML = citasConInfo.map(item => `
                <tr>
                    <td><strong>${item.cita.hora}</strong></td>
                    <td>${item.pacienteNombre}</td>
                    <td>${item.doctorNombre}</td>
                    <td>${item.especialidad}</td>
                    <td>${item.cita.motivo}</td>
                    <td>
                        <span class="status-badge status-${item.cita.estado}">
                            <i class="fas fa-circle"></i>
                            ${item.cita.estado}
                        </span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-icon" onclick="CitasUI.verDetalleCita('${item.cita.id}')" title="Ver detalles">
                                <i class="fas fa-eye"></i>
                            </button>
                            ${item.cita.estado === 'programada' ? `
                            <button class="btn-icon" onclick="CitasUI.cancelarCita('${item.cita.id}')" title="Cancelar cita">
                                <i class="fas fa-times"></i>
                            </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    }

    cargarCitasProximas(citas) {
        const container = document.getElementById('upcomingAppointments');
        if (!container) return;

        if (!citas || citas.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clock"></i>
                    <p>No hay citas próximas</p>
                </div>
            `;
            return;
        }

        container.innerHTML = citas.map(cita => `
            <div class="appointment-card">
                <div class="appointment-time">
                    <i class="fas fa-clock"></i> ${cita.hora} - ${cita.fecha}
                </div>
                <div class="appointment-patient">
                    <i class="fas fa-user-injured"></i> ${cita.pacienteNombre || 'Paciente'}
                </div>
                <div class="appointment-doctor">
                    <i class="fas fa-user-md"></i> ${cita.doctorNombre || 'Doctor'}
                </div>
                <div class="appointment-reason">
                    <i class="fas fa-comment-medical"></i> ${cita.motivo}
                </div>
                <div class="appointment-actions">
                    <button class="btn btn-sm btn-outline" onclick="CitasUI.verDetalleCita('${cita.id}')">
                        <i class="fas fa-eye"></i> Ver
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="CitasUI.cancelarCita('${cita.id}')">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                </div>
            </div>
        `).join('');
    }

    cargarFiltroDoctores(doctores) {
        const select = document.getElementById('filterDoctor');
        if (!select) return;

        select.innerHTML = `
            <option value="">Todos los doctores</option>
            ${doctores.map(doctor => `
                <option value="${doctor.id}">${doctor.nombre} - ${doctor.especialidad}</option>
            `).join('')}
        `;
    }

    async showSection(section) {
        // Actualizar estado de navegación
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === section) {
                link.classList.add('active');
            }
        });

        // Cambiar sección visible
        document.querySelectorAll('.content-section').forEach(sec => {
            sec.classList.remove('active');
        });

        const sectionElement = document.getElementById(section);
        if (sectionElement) {
            sectionElement.classList.add('active');
            this.currentSection = section;

            // Cargar datos cuando se cambia de sección
            switch (section) {
                case 'dashboard':
                    await this.cargarDashboard();
                    break;
                case 'pacientes':
                    await PacientesUI.cargarPacientes();
                    break;
                case 'doctores':
                    await DoctoresUI.cargarDoctores();
                    break;
                case 'citas':
                    await CitasUI.cargarCitas();
                    break;
            }
        }
    }

    async cargarDashboard() {
        try {
            this.showLoading();
            
            // Cargar datos actualizados del dashboard
            const [pacientes, doctores, citasHoy, citasProximas] = await Promise.all([
                API.getPacientes(),
                API.getDoctores(),
                API.getCitasHoy(),
                API.getCitasProximas()
            ]);

            this.actualizarEstadisticas(pacientes, doctores, citasHoy, citasProximas);
            await this.cargarCitasHoy(citasHoy);
            this.cargarCitasProximas(citasProximas);

            // Cargar estadísticas (gráficos)
            try {
                const stats = await API.getCitasPorMes();
                this.renderMonthlyChart(stats);
            } catch (e) {
                console.error('No se pudieron cargar estadísticas mensuales:', e);
            }

            try {
                const tasa = await API.getTasaCancelacion(30);
                const el = document.getElementById('cancelRate');
                const detail = document.getElementById('cancelRateDetail');
                if (el) el.textContent = `${tasa.tasa}%`;
                if (detail) detail.textContent = `Periodo: ${tasa.dias} días · Total: ${tasa.total} · Canceladas: ${tasa.canceladas}`;
            } catch (e) {
                console.error('No se pudo cargar tasa de cancelación:', e);
            }

        } catch (error) {
            this.mostrarError('Error al cargar el dashboard');
        } finally {
            this.hideLoading();
        }
    }

    renderMonthlyChart(stats) {
        // Validar datos (prevenir citas infinitas o arrays vacíos)
        if (!stats || !stats.labels || stats.labels.length === 0) {
            console.warn('Datos de estadísticas vacíos o inválidos');
            return;
        }

        if (stats.labels.length > 24) {
            console.warn('Demasiados meses en estadísticas; limitando a últimos 12');
            stats.labels = stats.labels.slice(-12);
            stats.totals = stats.totals.slice(-12);
            stats.canceladas = stats.canceladas.slice(-12);
        }

        const ctx = document.getElementById('monthlyAppointmentsChart');
        if (!ctx) {
            console.warn('Canvas para gráfica mensual no encontrado');
            return;
        }

        const labels = stats.labels;
        const data = {
            labels,
            datasets: [
                {
                    label: 'Total citas',
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    data: stats.totals || []
                },
                {
                    label: 'Canceladas',
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1,
                    data: stats.canceladas || []
                }
            ]
        };

        // Destruir gráfica anterior si existe
        if (this.monthlyChart) {
            this.monthlyChart.destroy();
        }

        // Crear nueva gráfica con validación
        try {
            this.monthlyChart = new Chart(ctx, {
                type: 'bar',
                data,
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            position: 'top'
                        }
                    },
                    scales: {
                        x: { beginAtZero: true },
                        y: { beginAtZero: true }
                    }
                }
            });
        } catch (e) {
            console.error('Error al crear gráfica mensual:', e);
        }
    }

    async filtrarCitas() {
        try {
            const fecha = document.getElementById('filterDate')?.value;
            const estado = document.getElementById('filterStatus')?.value;
            const doctorId = document.getElementById('filterDoctor')?.value;

            const filtros = {};
            if (fecha) filtros.fecha = fecha;
            if (estado) filtros.estado = estado;
            if (doctorId) filtros.doctorId = doctorId;

            await CitasUI.cargarCitas(filtros);
        } catch (error) {
            this.mostrarError('Error al filtrar citas');
        }
    }

    async buscarPacientes(termino) {
        try {
            // Si el término está vacío, mostrar todos
            let resultados = this.cachedPacientes;
            
            if (termino && termino.trim()) {
                resultados = this.cachedPacientes.filter(paciente =>
                    paciente.nombre.toLowerCase().includes(termino.toLowerCase()) ||
                    paciente.id.toLowerCase().includes(termino.toLowerCase()) ||
                    paciente.email.toLowerCase().includes(termino.toLowerCase())
                );
            }
            
            PacientesUI.renderizarPacientes(resultados);
        } catch (error) {
            this.mostrarError('Error al buscar pacientes');
        }
    }

    async buscarDoctores(termino) {
        try {
            // Si el término está vacío, mostrar todos
            let resultados = this.cachedDoctores;
            
            if (termino && termino.trim()) {
                resultados = this.cachedDoctores.filter(doctor =>
                    doctor.nombre.toLowerCase().includes(termino.toLowerCase()) ||
                    doctor.especialidad.toLowerCase().includes(termino.toLowerCase())
                );
            }
            
            DoctoresUI.renderizarDoctores(resultados);
        } catch (error) {
            this.mostrarError('Error al buscar doctores');
        }
    }

    async mostrarNotificaciones() {
        try {
            const citasProximas = await API.getCitasProximas();
            const container = document.getElementById('modalContainer');
            if (!container) return;

            const contenido = citasProximas && citasProximas.length > 0
                ? citasProximas.map(cita => `
                    <div class="notification-item">
                        <div class="notification-time">
                            <i class="fas fa-clock"></i> ${cita.hora}
                        </div>
                        <div class="notification-content">
                            <p class="notification-patient"><strong>${cita.pacienteNombre}</strong></p>
                            <p class="notification-doctor">Dr. ${cita.doctorNombre}</p>
                            <p class="notification-reason">${cita.motivo}</p>
                        </div>
                    </div>
                `).join('')
                : '<p style="text-align: center; padding: 20px; color: #999;">No hay citas próximas</p>';

            container.innerHTML = `
                <div class="modal active">
                    <div class="modal-content" style="max-width: 500px;">
                        <div class="modal-header">
                            <h2><i class="fas fa-bell"></i> Citas Próximas (24h)</h2>
                            <button class="btn-close" onclick="app.cerrarModal()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="modal-body" style="max-height: 400px; overflow-y: auto;">
                            ${contenido}
                        </div>
                    </div>
                </div>
            `;
            container.classList.add('active');
        } catch (error) {
            this.mostrarError('Error al cargar notificaciones');
        }
    }

    // Utilidades de interfaz y notificaciones

    showLoading() {
        this.isLoading = true;
    }

    hideLoading() {
        this.isLoading = false;
    }

    mostrarError(mensaje) {
        this.mostrarToast(mensaje, 'error');
    }

    mostrarExito(mensaje) {
        this.mostrarToast(mensaje, 'success');
    }

    mostrarToast(mensaje, tipo = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${tipo}`;
        toast.innerHTML = `
            <i class="fas fa-${this.getIconoPorTipo(tipo)}"></i>
            <span>${mensaje}</span>
        `;

        container.appendChild(toast);

        // Remover automáticamente después de 5 segundos
        setTimeout(() => {
            toast.remove();
        }, 5000);
    }

    getIconoPorTipo(tipo) {
        const iconos = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return iconos[tipo] || 'info-circle';
    }

    // Método para cerrar modales
    cerrarModal() {
        const modalContainer = document.getElementById('modalContainer');
        if (modalContainer) {
            modalContainer.classList.remove('active');
            modalContainer.innerHTML = '';
        }
    }
}

// Inicializar app cuando DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.app = new SistemaCitasApp();
});
window.SistemaCitasApp = SistemaCitasApp;
}