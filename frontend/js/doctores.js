// Gestión de doctores
if (window.DoctoresUI) {
  console.warn('DoctoresUI ya está definido — omitiendo carga duplicada.');
} else {
class DoctoresUI {
    static async cargarDoctores() {
        try {
            const doctores = await API.getDoctores();
            this.renderizarDoctores(doctores);
        } catch (error) {
            app.mostrarError('Error al cargar doctores');
        }
    }

    static renderizarDoctores(doctores) {
        const container = document.getElementById('doctorsGrid');
        const emptyState = document.getElementById('noDoctors');

        if (!doctores || doctores.length === 0) {
            if (container) container.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        if (container) {
            container.innerHTML = doctores.map(doctor => `
                <div class="doctor-card">
                    <div class="doctor-header">
                        <div class="doctor-avatar">
                            <i class="fas fa-user-md"></i>
                        </div>
                        <div class="doctor-info">
                            <h4>${doctor.nombre}</h4>
                            <span class="doctor-specialty">${doctor.especialidad}</span>
                        </div>
                    </div>
                    
                    <div class="doctor-schedule">
                        <div class="schedule-item">
                            <i class="fas fa-clock"></i>
                            <span>${doctor.horarioInicio} - ${doctor.horarioFin}</span>
                        </div>
                        <div class="schedule-item">
                            <i class="fas fa-calendar"></i>
                            <span>${doctor.diasDisponibles.join(', ')}</span>
                        </div>
                    </div>
                    
                    <div class="doctor-actions">
                        <button class="btn btn-sm btn-outline" onclick="DoctoresUI.verAgenda('${doctor.id}')">
                            <i class="fas fa-calendar-alt"></i> Agenda
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="DoctoresUI.editarDoctor('${doctor.id}')">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                    </div>
                </div>
            `).join('');
        }
    }

    static mostrarFormularioDoctor(doctor = null) {
        const modalContainer = document.getElementById('modalContainer');
        if (!modalContainer) return;

        modalContainer.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>
                        <i class="fas fa-user-md"></i>
                        ${doctor ? 'Editar Doctor' : 'Nuevo Doctor'}
                    </h3>
                    <button class="modal-close" onclick="app.cerrarModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <form id="formDoctor" onsubmit="return DoctoresUI.guardarDoctor(event, '${doctor?.id}')">
                    <div class="modal-body">
                        <div class="form-group required">
                            <label for="doctorNombre">Nombre Completo</label>
                            <input type="text" id="doctorNombre" class="form-control" 
                                   value="${doctor?.nombre || ''}" required>
                            <div class="error-message" id="errorDoctorNombre"></div>
                        </div>
                        
                        <div class="form-group required">
                            <label for="especialidad">Especialidad</label>
                            <select id="especialidad" class="form-control" required>
                                <option value="">Seleccionar especialidad</option>
                                <option value="Cardiología" ${doctor?.especialidad === 'Cardiología' ? 'selected' : ''}>Cardiología</option>
                                <option value="Pediatría" ${doctor?.especialidad === 'Pediatría' ? 'selected' : ''}>Pediatría</option>
                                <option value="Dermatología" ${doctor?.especialidad === 'Dermatología' ? 'selected' : ''}>Dermatología</option>
                                <option value="Ortopedia" ${doctor?.especialidad === 'Ortopedia' ? 'selected' : ''}>Ortopedia</option>
                                <option value="Ginecología" ${doctor?.especialidad === 'Ginecología' ? 'selected' : ''}>Ginecología</option>
                                <option value="Oftalmología" ${doctor?.especialidad === 'Oftalmología' ? 'selected' : ''}>Oftalmología</option>
                                <option value="Neurología" ${doctor?.especialidad === 'Neurología' ? 'selected' : ''}>Neurología</option>
                                <option value="Psiquiatría" ${doctor?.especialidad === 'Psiquiatría' ? 'selected' : ''}>Psiquiatría</option>
                                <option value="Otra" ${doctor?.especialidad && !['Cardiología','Pediatría','Dermatología','Ortopedia','Ginecología','Oftalmología','Neurología','Psiquiatría'].includes(doctor.especialidad) ? 'selected' : ''}>Otra</option>
                            </select>
                            <div id="otraEspecialidadContainer" style="display: ${doctor?.especialidad && !['Cardiología','Pediatría','Dermatología','Ortopedia','Ginecología','Oftalmología','Neurología','Psiquiatría'].includes(doctor.especialidad) ? 'block' : 'none'}; margin-top: 8px;">
                                <input type="text" id="otraEspecialidad" class="form-control" 
                                       value="${doctor?.especialidad && !['Cardiología','Pediatría','Dermatología','Ortopedia','Ginecología','Oftalmología','Neurología','Psiquiatría'].includes(doctor.especialidad) ? doctor.especialidad : ''}" 
                                       placeholder="Especificar especialidad">
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-6">
                                <div class="form-group required">
                                    <label for="horarioInicio">Horario de Inicio</label>
                                    <input type="time" id="horarioInicio" class="form-control" 
                                           value="${doctor?.horarioInicio || '09:00'}" required>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="form-group required">
                                    <label for="horarioFin">Horario de Fin</label>
                                    <input type="time" id="horarioFin" class="form-control" 
                                           value="${doctor?.horarioFin || '17:00'}" required>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-group required">
                            <label>Días Disponibles</label>
                            <div class="checkbox-group">
                                ${['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(dia => `
                                    <label class="checkbox-item">
                                        <input type="checkbox" name="dias" value="${dia}" 
                                            ${doctor?.diasDisponibles?.includes(dia) ? 'checked' : ''}>
                                        ${dia}
                                    </label>
                                `).join('')}
                            </div>
                            <div class="error-message" id="errorDias"></div>
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline" onclick="app.cerrarModal()">
                            Cancelar
                        </button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> ${doctor ? 'Actualizar' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        `;

        modalContainer.classList.add('active');

        // Mostrar/ocultar campo "Otra especialidad" según selección
        const especialidadSelect = document.getElementById('especialidad');
        const otraEspecialidadContainer = document.getElementById('otraEspecialidadContainer');
        
        if (especialidadSelect && otraEspecialidadContainer) {
            especialidadSelect.addEventListener('change', function() {
                otraEspecialidadContainer.style.display = this.value === 'Otra' ? 'block' : 'none';
                if (this.value !== 'Otra') {
                    document.getElementById('otraEspecialidad').value = '';
                }
            });
        }
    }

    static async guardarDoctor(event, id = null) {
        event.preventDefault();
        
        // Obtener especialidad (considerar "Otra" como personalizada)
        const especialidadSelect = document.getElementById('especialidad');
        let especialidad = especialidadSelect.value;
        
        if (especialidad === 'Otra') {
            const otraEspecialidad = document.getElementById('otraEspecialidad').value;
            if (!otraEspecialidad.trim()) {
                app.mostrarError('Debe especificar la especialidad');
                return false;
            }
            especialidad = otraEspecialidad.trim();
        }

        // Recopilar días seleccionados
        const dias = Array.from(document.querySelectorAll('input[name="dias"]:checked'))
            .map(cb => cb.value);

        const data = {
            nombre: document.getElementById('doctorNombre').value,
            especialidad: especialidad,
            horarioInicio: document.getElementById('horarioInicio').value,
            horarioFin: document.getElementById('horarioFin').value,
            diasDisponibles: dias
        };

        // Validar datos del formulario
        if (!this.validarFormularioDoctor(data)) {
            return false;
        }

        try {
            if (id) {
                // Actualizar doctor existente
                await API.updateDoctor(id, data);
                app.mostrarExito('Doctor actualizado correctamente');
            } else {
                // Crear nuevo doctor
                await API.createDoctor(data);
                app.mostrarExito('Doctor registrado correctamente');
            }

            // Actualizar datos y cerrar formulario
            await this.cargarDoctores();
            
            // Actualizar filtros si estamos en citas
            if (app.currentSection === 'citas') {
                await app.cargarDashboard();
            }
            
            app.cerrarModal();

            return true;
        } catch (error) {
            this.mostrarErrorFormulario(error.message);
            return false;
        }
    }

    static validarFormularioDoctor(data) {
        let isValid = true;
        const errors = {};

        // Nombre válido
        if (!data.nombre || data.nombre.trim().length < 2) {
            errors.nombre = 'El nombre debe tener al menos 2 caracteres';
            isValid = false;
        }

        // Especialidad válida
        if (!data.especialidad || data.especialidad.trim().length < 2) {
            errors.especialidad = 'La especialidad es requerida';
            isValid = false;
        }

        // Horarios válidos
        if (!data.horarioInicio || !data.horarioFin) {
            errors.horario = 'Los horarios son requeridos';
            isValid = false;
        } else if (data.horarioInicio >= data.horarioFin) {
            errors.horario = 'El horario de inicio debe ser menor al horario de fin';
            isValid = false;
        }

        // Días disponibles válidos
        if (!data.diasDisponibles || data.diasDisponibles.length === 0) {
            errors.dias = 'Debe seleccionar al menos un día disponible';
            isValid = false;
        }

        // Mostrar errores en los campos
        Object.keys(errors).forEach(field => {
            const errorElement = document.getElementById(`error${field.charAt(0).toUpperCase() + field.slice(1)}`);
            if (errorElement) {
                errorElement.textContent = errors[field];
                errorElement.classList.add('show');
            }
        });

        return isValid;
    }

    static mostrarErrorFormulario(mensaje) {
        // Mostrar error general
        app.mostrarError(mensaje);
        
        // Mostrar error específico si es por nombre duplicado
        if (mensaje.includes('nombre') && mensaje.includes('especialidad')) {
            const errorElement = document.getElementById('errorDoctorNombre');
            if (errorElement) {
                errorElement.textContent = 'Ya existe un doctor con el mismo nombre y especialidad';
                errorElement.classList.add('show');
            }
        }
    }

    static async editarDoctor(id) {
        try {
            const doctor = await API.getDoctor(id);
            this.mostrarFormularioDoctor(doctor);
        } catch (error) {
            app.mostrarError('Error al cargar datos del doctor');
        }
    }

    static async verAgenda(id) {
        try {
            const [doctor, agenda] = await Promise.all([
                API.getDoctor(id),
                API.getCitasDoctor(id)
            ]);

            this.mostrarAgendaModal(doctor, agenda);
        } catch (error) {
            app.mostrarError('Error al cargar agenda del doctor');
        }
    }

    static mostrarAgendaModal(doctor, agenda) {
        const modalContainer = document.getElementById('modalContainer');
        if (!modalContainer) return;

        const citasProgramadas = agenda.filter(c => c.estado === 'programada').length;
        const citasCanceladas = agenda.filter(c => c.estado === 'cancelada').length;

        modalContainer.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>
                        <i class="fas fa-calendar-alt"></i>
                        Agenda - ${doctor.nombre}
                    </h3>
                    <button class="modal-close" onclick="app.cerrarModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    <div class="doctor-info">
                        <p><strong>Especialidad:</strong> ${doctor.especialidad}</p>
                        <p><strong>Horario:</strong> ${doctor.horarioInicio} - ${doctor.horarioFin}</p>
                        <p><strong>Días disponibles:</strong> ${doctor.diasDisponibles.join(', ')}</p>
                    </div>
                    
                    <div class="agenda-stats">
                        <div class="stat-card">
                            <div class="stat-info">
                                <h3>${agenda.length}</h3>
                                <p>Total Citas</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-info">
                                <h3>${citasProgramadas}</h3>
                                <p>Programadas</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-info">
                                <h3>${citasCanceladas}</h3>
                                <p>Canceladas</p>
                            </div>
                        </div>
                    </div>
                    
                    ${agenda.length > 0 ? `
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Hora</th>
                                    <th>Paciente</th>
                                    <th>Motivo</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${agenda.map(cita => `
                                    <tr>
                                        <td>${cita.fecha}</td>
                                        <td>${cita.hora}</td>
                                        <td>${cita.pacienteNombre || 'N/A'}</td>
                                        <td>${cita.motivo}</td>
                                        <td>
                                            <span class="status-badge status-${cita.estado}">
                                                ${cita.estado}
                                            </span>
                                        </td>
                                        <td>
                                            <button class="btn-icon" onclick="CitasUI.verDetalleCita('${cita.id}')" title="Ver">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    ` : `
                    <div class="empty-state">
                        <i class="fas fa-calendar-times"></i>
                        <p>No hay citas programadas</p>
                    </div>
                    `}
                </div>
                
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline" onclick="app.cerrarModal()">
                        Cerrar
                    </button>
                </div>
            </div>
        `;

        modalContainer.classList.add('active');
    }

    static async getEspecialidades() {
        try {
            const doctores = await API.getDoctores();
            const especialidades = [new Set(doctores.map(d => d.especialidad))];
            return especialidades;
        } catch (error) {
            console.error('Error obteniendo especialidades:', error);
            return [];
        }
    }
}
window.DoctoresUI = DoctoresUI;
}