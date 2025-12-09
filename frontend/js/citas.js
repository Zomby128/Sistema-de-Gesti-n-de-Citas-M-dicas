// Gestión de citas
if (window.CitasUI) {
  console.warn('CitasUI ya está definido — omitiendo carga duplicada.');
} else {
class CitasUI {
    static async cargarCitas(filtros = {}) {
        try {
            const citas = await API.getCitas(filtros);
            await this.renderizarCitas(citas);
        } catch (error) {
            app.mostrarError('Error al cargar citas');
        }
    }

    static async renderizarCitas(citas) {
    const tbody = document.getElementById('appointmentsTable');
    const emptyState = document.getElementById('noAppointments');

    if (!citas || citas.length === 0) {
        if (tbody) tbody.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';

    // Cargar nombres de pacientes y doctores para cada cita
    const citasConInfo = await Promise.all(
        citas.map(async (cita) => {
            try {
                const [paciente, doctor] = await Promise.all([
                    API.getPaciente(cita.pacienteId).catch(() => ({ nombre: 'N/A' })),
                    API.getDoctor(cita.doctorId).catch(() => ({ nombre: 'N/A', especialidad: 'N/A' }))
                ]);
                
                return {
                    cita,
                    pacienteNombre: paciente.nombre || 'N/A',
                    doctorNombre: doctor.nombre || 'N/A',
                    especialidad: doctor.especialidad || 'N/A'
                };
            } catch (error) {
                return { cita, pacienteNombre: 'N/A', doctorNombre: 'N/A', especialidad: 'N/A' };
            }
        })
    );

    if (tbody) {
        tbody.innerHTML = citasConInfo.map(item => {
            const { cita, pacienteNombre, doctorNombre, especialidad } = item;
            // Proteger contra valores null o undefined
            const id = cita.id ?? '';
            const fecha = cita.fecha ?? '';
            const hora = cita.hora ?? '';
            const motivo = cita.motivo ?? '';
            const estado = cita.estado ?? 'programada';

            return `
                <tr>
                    <td><strong>${id}</strong></td>
                    <td>${fecha}</td>
                    <td>${hora}</td>
                    <td>${pacienteNombre}</td>
                    <td>${doctorNombre}</td>
                    <td>${especialidad}</td>
                    <td>${motivo}</td>
                    <td>
                        <span class="status-badge status-${estado}">
                            <i class="fas fa-circle"></i>
                            ${estado}
                        </span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-icon" onclick="CitasUI.verDetalleCita('${id}')" title="Ver detalles">
                                <i class="fas fa-eye"></i>
                            </button>
                            ${estado === 'programada' ? `
                            <button class="btn-icon" onclick="CitasUI.cancelarCita('${id}')" title="Cancelar cita">
                                <i class="fas fa-times"></i>
                            </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }
}


    static async mostrarFormularioCita(cita = null) {
        try {
            const [pacientes, doctores] = await Promise.all([
                API.getPacientes(),
                API.getDoctores()
            ]);

            const modalContainer = document.getElementById('modalContainer');
            if (!modalContainer) return;

            modalContainer.innerHTML = `
                <div class="modal">
                    <div class="modal-header">
                        <h3>
                            <i class="fas fa-calendar-plus"></i>
                            ${cita ? 'Editar Cita' : 'Nueva Cita'}
                        </h3>
                        <button class="modal-close" onclick="app.cerrarModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <form id="formCita" onsubmit="return CitasUI.guardarCita(event, '${cita?.id}')">
                        <div class="modal-body">
                            <div class="form-group required">
                                <label for="pacienteId">Paciente</label>
                                <select id="pacienteId" class="form-control" required>
                                    <option value="">Seleccionar paciente</option>
                                    ${pacientes.map(p => `
                                        <option value="${p.id}" ${cita?.pacienteId === p.id ? 'selected' : ''}>
                                            ${p.nombre} - ${p.email}
                                        </option>
                                    `).join('')}
                                </select>
                                <div class="error-message" id="errorPacienteId"></div>
                            </div>
                            
                            <div class="form-group required">
                                <label for="especialidadCita">Especialidad Requerida</label>
                                <select id="especialidadCita" class="form-control" required>
                                    <option value="">Seleccionar especialidad</option>
                                    ${Array.from(new Set(doctores.map(d => d.especialidad))).map(esp => `
                                        <option value="${esp}" ${cita?.especialidad === esp ? 'selected' : ''}>
                                            ${esp}
                                        </option>
                                    `).join('')}

                                </select>
                                <div class="error-message" id="errorEspecialidad"></div>
                            </div>
                            
                            <div class="form-group required">
                                <label for="doctorId">Doctor</label>
                                <select id="doctorId" class="form-control" required>
                                    <option value="">Seleccionar doctor</option>
                                    ${doctores.map(d => `
                                        <option value="${d.id}" 
                                                data-especialidad="${d.especialidad}"
                                                data-horario="${d.horarioInicio}-${d.horarioFin}"
                                                data-dias='${JSON.stringify(d.diasDisponibles)}'
                                                ${cita?.doctorId === d.id ? 'selected' : ''}>
                                            ${d.nombre} - ${d.especialidad}
                                        </option>
                                    `).join('')}
                                </select>
                                <div class="error-message" id="errorDoctorId"></div>
                                <small id="doctorInfo" class="text-muted"></small>
                            </div>
                            
                            <div class="row">
                                <div class="col-6">
                                    <div class="form-group required">
                                        <label for="fecha">Fecha</label>
                                        <input type="date" id="fecha" class="form-control" 
                                               value="${cita?.fecha || ''}" 
                                               min="${new Date().toISOString().split('T')[0]}" 
                                               required>
                                        <div class="error-message" id="errorFecha"></div>
                                        <small id="fechaInfo" class="text-muted"></small>
                                    </div>
                                </div>
                                <div class="col-6">
                                    <div class="form-group required">
                                        <label for="hora">Hora</label>
                                        <input type="time" id="hora" class="form-control" 
                                               value="${cita?.hora || ''}" required>
                                        <div class="error-message" id="errorHora"></div>
                                        <small id="horaInfo" class="text-muted"></small>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-group required">
                                <label for="motivo">Motivo de Consulta</label>
                                <textarea id="motivo" class="form-control" rows="3" 
                                          maxlength="200" required>${cita?.motivo || ''}</textarea>
                                <div class="error-message" id="errorMotivo"></div>
                                <small class="text-muted" id="contadorCaracteres">0/200 caracteres</small>
                            </div>
                            
                            <div id="disponibilidadInfo"></div>
                        </div>
                        
                        <div class="modal-footer">
                            <button type="button" class="btn btn-outline" onclick="app.cerrarModal()">
                                Cancelar
                            </button>
                            <button type="submit" class="btn btn-primary" id="btnGuardarCita">
                                <i class="fas fa-save"></i> ${cita ? 'Actualizar' : 'Guardar'} Cita
                            </button>
                        </div>
                    </form>
                </div>
            `;

            modalContainer.classList.add('active');

            // Configurar eventos
            this.configurarEventosFormulario();

            // Si hay una cita existente, establecer valores
            if (cita) {
                document.getElementById('especialidadCita').value = cita.especialidad;
                this.filtrarDoctoresPorEspecialidad(cita.especialidad);
            }

        } catch (error) {
            app.mostrarError('Error al cargar formulario de cita');
        }
    }

    static configurarEventosFormulario() {
        // Contador de caracteres
        const motivoTextarea = document.getElementById('motivo');
        const contador = document.getElementById('contadorCaracteres');
        
        if (motivoTextarea && contador) {
            motivoTextarea.addEventListener('input', function() {
                contador.textContent = `${this.value.length}/200 caracteres`;
            });
            // Inicializar contador
            contador.textContent = `${motivoTextarea.value.length}/200 caracteres`;
        }

        // Filtrar doctores por especialidad
        const especialidadSelect = document.getElementById('especialidadCita');
        if (especialidadSelect) {
            especialidadSelect.addEventListener('change', function() {
                CitasUI.filtrarDoctoresPorEspecialidad(this.value);
            });
        }

        // Validar disponibilidad cuando cambian fecha o hora
        const fechaInput = document.getElementById('fecha');
        const horaInput = document.getElementById('hora');
        const doctorSelect = document.getElementById('doctorId');

        if (fechaInput) fechaInput.addEventListener('change', () => this.validarDisponibilidad());
        if (horaInput) horaInput.addEventListener('change', () => this.validarDisponibilidad());
        if (doctorSelect) doctorSelect.addEventListener('change', () => this.validarDisponibilidad());
    }

    static filtrarDoctoresPorEspecialidad(especialidad) {
        const doctorSelect = document.getElementById('doctorId');
        if (!doctorSelect) return;

        const options = doctorSelect.querySelectorAll('option');
        
        options.forEach(option => {
            if (option.value === '') {
                option.style.display = '';
                return;
            }
            
            const doctorEspecialidad = option.getAttribute('data-especialidad');
            if (especialidad && doctorEspecialidad !== especialidad) {
                option.style.display = 'none';
                option.disabled = true;
            } else {
                option.style.display = '';
                option.disabled = false;
            }
        });

        // Seleccionar el primer doctor disponible si hay uno
        const primeraOpcion = Array.from(options).find(opt => !opt.disabled && opt.value !== '');
        if (primeraOpcion) {
            doctorSelect.value = primeraOpcion.value;
        } else {
            doctorSelect.value = '';
        }

        // Actualizar información del doctor
        this.actualizarInfoDoctor();
        this.validarDisponibilidad();
    }

    static actualizarInfoDoctor() {
        const doctorSelect = document.getElementById('doctorId');
        const doctorInfo = document.getElementById('doctorInfo');
        
        if (!doctorSelect || !doctorInfo) return;

        const selectedOption = doctorSelect.selectedOptions[0];
        if (selectedOption && selectedOption.value) {
            const horario = selectedOption.getAttribute('data-horario');
            const dias = JSON.parse(selectedOption.getAttribute('data-dias') || '[]');
            
            doctorInfo.textContent = `Horario: ${horario} | Días: ${dias.join(', ')}`;
        } else {
            doctorInfo.textContent = '';
        }
    }

    static async validarDisponibilidad() {
        const fecha = document.getElementById('fecha')?.value;
        const hora = document.getElementById('hora')?.value;
        const doctorSelect = document.getElementById('doctorId');
        const infoDiv = document.getElementById('disponibilidadInfo');
        const btnGuardar = document.getElementById('btnGuardarCita');

        if (!fecha || !hora || !doctorSelect || !doctorSelect.value) {
            if (infoDiv) infoDiv.innerHTML = '';
            if (btnGuardar) btnGuardar.disabled = false;
            return;
        }

        const selectedOption = doctorSelect.selectedOptions[0];
        if (!selectedOption) return;

        const doctorId = doctorSelect.value;
        const doctorHorario = selectedOption.getAttribute('data-horario') || '09:00-17:00';
        const doctorDias = JSON.parse(selectedOption.getAttribute('data-dias') || '[]');

        const [horaInicio, horaFin] = doctorHorario.split('-');
        
        // Verificar que el doctor trabaja ese día de la semana
        const fechaObj = new Date(fecha);
        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const diaSemana = diasSemana[fechaObj.getDay()];

        if (!doctorDias.includes(diaSemana)) {
            if (infoDiv) {
                infoDiv.innerHTML = `
                    <div class="alert alert-warning">
                        <i class="fas fa-exclamation-triangle"></i>
                        El doctor no trabaja los ${diaSemana}s
                    </div>
                `;
            }
            if (btnGuardar) btnGuardar.disabled = true;
            return;
        }

        // Verificar que la hora esté dentro del horario del doctor
        if (hora < horaInicio || hora >= horaFin) {
            if (infoDiv) {
                infoDiv.innerHTML = `
                    <div class="alert alert-warning">
                        <i class="fas fa-exclamation-triangle"></i>
                        El horario debe estar entre ${horaInicio} y ${horaFin}
                    </div>
                `;
            }
            if (btnGuardar) btnGuardar.disabled = true;
            return;
        }

        // Verificar que la fecha sea futura
        const hoy = new Date();
        const fechaCita = new Date(fecha);
        if (fechaCita < hoy.setHours(0, 0, 0, 0)) {
            if (infoDiv) {
                infoDiv.innerHTML = `
                    <div class="alert alert-warning">
                        <i class="fas fa-exclamation-triangle"></i>
                        La fecha debe ser futura
                    </div>
                `;
            }
            if (btnGuardar) btnGuardar.disabled = true;
            return;
        }

        try {
            // Verificar disponibilidad del doctor
            const citasDoctor = await API.getCitas({ doctorId });

            const citaExistente = citasDoctor.find(c => 
                c.fecha === fecha && 
                c.hora === hora && 
                c.estado === 'programada'
            );

            if (citaExistente) {
                if (infoDiv) {
                    infoDiv.innerHTML = `
                        <div class="alert alert-danger">
                            <i class="fas fa-times-circle"></i>
                            El doctor ya tiene una cita programada para esta fecha y hora
                        </div>
                    `;
                }
                if (btnGuardar) btnGuardar.disabled = true;
            } else {
                if (infoDiv) {
                    infoDiv.innerHTML = `
                        <div class="alert alert-success">
                            <i class="fas fa-check-circle"></i>
                            Horario disponible
                        </div>
                    `;
                }
                if (btnGuardar) btnGuardar.disabled = false;
            }
        } catch (error) {
            console.error('Error validando disponibilidad:', error);
            if (btnGuardar) btnGuardar.disabled = false;
        }
    }

    static async guardarCita(event, id = null) {
        event.preventDefault();

        const data = {
            pacienteId: document.getElementById('pacienteId').value,
            doctorId: document.getElementById('doctorId').value,
            fecha: document.getElementById('fecha').value,
            hora: document.getElementById('hora').value,
            motivo: document.getElementById('motivo').value
        };

        // Validaciones del cliente
        if (!this.validarFormularioCita(data)) {
            return false;
        }

        try {
            if (id) {
                // Actualizar cita existente
                await API.updateCita(id, {
                    fecha: data.fecha,
                    hora: data.hora,
                    motivo: data.motivo
                });
                app.mostrarExito('Cita actualizada correctamente');
            } else {
                // Crear nueva cita
                await API.createCita(data);
                app.mostrarExito('Cita agendada correctamente');
            }

            // Actualizar datos y cerrar formulario
            await this.cargarCitas();
            await app.cargarDashboard();
            app.cerrarModal();

            return true;
        } catch (error) {
            this.mostrarErrorFormulario(error.message);
            return false;
        }
    }

    static validarFormularioCita(data) {
        let isValid = true;
        const errors = {};

        // Validar que se seleccione paciente
        if (!data.pacienteId) {
            errors.pacienteId = 'Debe seleccionar un paciente';
            isValid = false;
        }

        // Validar que se seleccione doctor
        if (!data.doctorId) {
            errors.doctorId = 'Debe seleccionar un doctor';
            isValid = false;
        }

        // Validar fecha futura
        if (!data.fecha) {
            errors.fecha = 'La fecha es requerida';
            isValid = false;
        } else {
            const hoy = new Date();
            const fechaCita = new Date(data.fecha);
            if (fechaCita < hoy.setHours(0, 0, 0, 0)) {
                errors.fecha = 'La fecha debe ser futura';
                isValid = false;
            }
        }

        // Validar que se seleccione hora
        if (!data.hora) {
            errors.hora = 'La hora es requerida';
            isValid = false;
        }

        // Validar motivo
        if (!data.motivo || data.motivo.trim().length === 0) {
            errors.motivo = 'El motivo es requerido';
            isValid = false;
        } else if (data.motivo.length > 200) {
            errors.motivo = 'El motivo no puede exceder los 200 caracteres';
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
        app.mostrarError(mensaje);
        
        if (mensaje.includes('doctor')) {
            const errorElement = document.getElementById('errorDoctorId');
            if (errorElement) {
                errorElement.textContent = 'El doctor no está disponible en ese horario';
                errorElement.classList.add('show');
            }
        }
    }

    static async cancelarCita(id) {
        if (!confirm('¿Está seguro de cancelar esta cita?')) {
            return;
        }

        try {
            await API.cancelarCita(id);
            app.mostrarExito('Cita cancelada correctamente');
            
            // Actualizar datos
            await this.cargarCitas();
            await app.cargarDashboard();
        } catch (error) {
            app.mostrarError('Error al cancelar la cita');
        }
    }

    static async verDetalleCita(id) {
        try {
            const cita = await API.getCita(id);
            
            // Cargar información de paciente y doctor
            const [paciente, doctor] = await Promise.all([
                API.getPaciente(cita.pacienteId).catch(() => ({ 
                    nombre: 'N/A', 
                    edad: 'N/A', 
                    telefono: 'N/A', 
                    email: 'N/A' 
                })),
                API.getDoctor(cita.doctorId).catch(() => ({ 
                    nombre: 'N/A', 
                    especialidad: 'N/A', 
                    horarioInicio: 'N/A', 
                    horarioFin: 'N/A',
                    diasDisponibles: []
                }))
            ]);

            this.mostrarDetalleModal(cita, paciente, doctor);
        } catch (error) {
            app.mostrarError('Error al cargar detalles de la cita');
        }
    }

    static mostrarDetalleModal(cita, paciente, doctor) {
        const modalContainer = document.getElementById('modalContainer');
        if (!modalContainer) return;

        modalContainer.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>
                        <i class="fas fa-calendar-alt"></i>
                        Detalles de la Cita
                    </h3>
                    <button class="modal-close" onclick="app.cerrarModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    <div class="cita-info">
                        <div class="info-item">
                            <strong>ID:</strong> ${cita.id}
                        </div>
                        <div class="info-item">
                            <strong>Fecha:</strong> ${cita.fecha}
                        </div>
                        <div class="info-item">
                            <strong>Hora:</strong> ${cita.hora}
                        </div>
                        <div class="info-item">
                            <strong>Estado:</strong>
                            <span class="status-badge status-${cita.estado}">
                                ${cita.estado}
                            </span>
                        </div>
                        <div class="info-item">
                            <strong>Motivo:</strong> ${cita.motivo}
                        </div>
                    </div>
                    
                    <div class="row" style="margin-top: 20px;">
                        <div class="col-6">
                            <div class="card">
                                <div class="card-header">
                                    <h4><i class="fas fa-user-injured"></i> Paciente</h4>
                                </div>
                                <div class="card-body">
                                    <p><strong>Nombre:</strong> ${paciente.nombre}</p>
                                    <p><strong>Edad:</strong> ${paciente.edad} años</p>
                                    <p><strong>Teléfono:</strong> ${paciente.telefono}</p>
                                    <p><strong>Email:</strong> ${paciente.email}</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="card">
                                <div class="card-header">
                                    <h4><i class="fas fa-user-md"></i> Doctor</h4>
                                </div>
                                <div class="card-body">
                                    <p><strong>Nombre:</strong> ${doctor.nombre}</p>
                                    <p><strong>Especialidad:</strong> ${doctor.especialidad}</p>
                                    <p><strong>Horario:</strong> ${doctor.horarioInicio} - ${doctor.horarioFin}</p>
                                    <p><strong>Días disponibles:</strong> ${doctor.diasDisponibles.join(', ')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    ${cita.estado === 'programada' ? `
                    <button type="button" class="btn btn-primary" onclick="CitasUI.mostrarFormularioCita('${cita.id}')">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button type="button" class="btn btn-danger" onclick="CitasUI.cancelarCita('${cita.id}'); app.cerrarModal()">
                        <i class="fas fa-times"></i> Cancelar Cita
                    </button>
                    ` : ''}
                    <button type="button" class="btn btn-outline" onclick="app.cerrarModal()">
                        Cerrar
                    </button>
                </div>
            </div>
        `;

        modalContainer.classList.add('active');
    }
}
window.CitasUI = CitasUI;
}