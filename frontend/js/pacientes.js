// Gestión de pacientes
if (window.PacientesUI) {
  console.warn('PacientesUI ya está definido — omitiendo carga duplicada.');
} else {
class PacientesUI {
    static async cargarPacientes() {
        try {
            const pacientes = await API.getPacientes();
            this.renderizarPacientes(pacientes);
        } catch (error) {
            app.mostrarError('Error al cargar pacientes');
        }
    }

    static renderizarPacientes(pacientes) {
        const tbody = document.getElementById('patientsTable');
        const emptyState = document.getElementById('noPatients');

        if (!pacientes || pacientes.length === 0) {
            if (tbody) tbody.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        if (tbody) {
            tbody.innerHTML = pacientes.map(paciente => `
                <tr>
                    <td><strong>${paciente.id}</strong></td>
                    <td>
                        <div class="patient-info">
                            <div class="patient-avatar">
                                ${paciente.nombre.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div class="patient-name">${paciente.nombre}</div>
                                <div class="patient-email">${paciente.email}</div>
                            </div>
                        </div>
                    </td>
                    <td>${paciente.edad} años</td>
                    <td>${paciente.telefono}</td>
                    <td>${paciente.email}</td>
                    <td>${paciente.fechaRegistro}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-icon" onclick="PacientesUI.verHistorial('${paciente.id}')" 
                                    title="Ver historial">
                                <i class="fas fa-history"></i>
                            </button>
                            <button class="btn-icon" onclick="PacientesUI.editarPaciente('${paciente.id}')" 
                                    title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    }

    static mostrarFormularioPaciente(paciente = null) {
        const modalContainer = document.getElementById('modalContainer');
        if (!modalContainer) return;

        modalContainer.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>
                        <i class="fas fa-user-injured"></i>
                        ${paciente ? 'Editar Paciente' : 'Nuevo Paciente'}
                    </h3>
                    <button class="modal-close" onclick="app.cerrarModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <form id="formPaciente" onsubmit="return PacientesUI.guardarPaciente(event, '${paciente?.id}')">
                    <div class="modal-body">
                        <div class="form-group required">
                            <label for="nombre">Nombre Completo</label>
                            <input type="text" id="nombre" class="form-control" 
                                   value="${paciente?.nombre || ''}" required>
                            <div class="error-message" id="errorNombre"></div>
                        </div>
                        
                        <div class="form-group required">
                            <label for="edad">Edad</label>
                            <input type="number" id="edad" class="form-control" 
                                   value="${paciente?.edad || ''}" min="1" max="120" required>
                            <div class="error-message" id="errorEdad"></div>
                        </div>
                        
                        <div class="form-group required">
                            <label for="telefono">Teléfono</label>
                            <input type="tel" id="telefono" class="form-control" 
                                   value="${paciente?.telefono || ''}" required
                                   pattern="[0-9+\-\s()]{10,}" 
                                   title="Mínimo 10 dígitos">
                            <div class="error-message" id="errorTelefono"></div>
                        </div>
                        
                        <div class="form-group required">
                            <label for="email">Email</label>
                            <input type="email" id="email" class="form-control" 
                                   value="${paciente?.email || ''}" required>
                            <div class="error-message" id="errorEmail"></div>
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline" onclick="app.cerrarModal()">
                            Cancelar
                        </button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> ${paciente ? 'Actualizar' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        `;

        modalContainer.classList.add('active');
    }

    static async guardarPaciente(event, id = null) {
        event.preventDefault();
        
        const form = event.target;
        const data = {
            nombre: form.querySelector('#nombre').value,
            edad: parseInt(form.querySelector('#edad').value),
            telefono: form.querySelector('#telefono').value,
            email: form.querySelector('#email').value
        };

        // Validar datos del paciente
        if (!this.validarFormularioPaciente(data)) {
            return false;
        }

        try {
            if (id) {
                // Actualizar paciente existente
                await API.updatePaciente(id, data);
                app.mostrarExito('Paciente actualizado correctamente');
            } else {
                // Crear nuevo paciente
                await API.createPaciente(data);
                app.mostrarExito('Paciente registrado correctamente');
            }

            // Actualizar datos y cerrar formulario
            await this.cargarPacientes();
            await app.cargarDashboard();
            app.cerrarModal();

            return true;
        } catch (error) {
            this.mostrarErrorFormulario(error.message);
            return false;
        }
    }

    static validarFormularioPaciente(data) {
        let isValid = true;
        const errors = {};

        // Nombre válido
        if (!data.nombre || data.nombre.trim().length < 2) {
            errors.nombre = 'El nombre debe tener al menos 2 caracteres';
            isValid = false;
        }

        // Edad válida
        if (!data.edad || data.edad < 1 || data.edad > 120) {
            errors.edad = 'La edad debe estar entre 1 y 120 años';
            isValid = false;
        }

        // Teléfono válido
        const telefonoRegex = /^[\d\s\-()+]{10,}$/;
        if (!data.telefono || !telefonoRegex.test(data.telefono)) {
            errors.telefono = 'Ingrese un número de teléfono válido (mínimo 10 dígitos)';
            isValid = false;
        }

        // Email válido
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!data.email || !emailRegex.test(data.email)) {
            errors.email = 'Ingrese un email válido';
            isValid = false;
        }

        // Mostrar errores en los campos
        Object.keys(errors).forEach(field => {
            const errorElement = document.getElementById(`error${field.charAt(0).toUpperCase() + field.slice(1)}`);
            const inputElement = document.getElementById(field);
            
            if (errorElement && inputElement) {
                errorElement.textContent = errors[field];
                errorElement.classList.add('show');
                inputElement.classList.add('error');
            }
        });

        return isValid;
    }

    static mostrarErrorFormulario(mensaje) {
        // Mostrar error general en toast
        app.mostrarError(mensaje);

        // Mostrar error específico si es sobre email duplicado
        if (mensaje.includes('email')) {
            const errorElement = document.getElementById('errorEmail');
            const inputElement = document.getElementById('email');
            if (errorElement && inputElement) {
                errorElement.textContent = 'Este email ya está registrado';
                errorElement.classList.add('show');
                inputElement.classList.add('error');
            }
        }
    }

    static async editarPaciente(id) {
        try {
            const paciente = await API.getPaciente(id);
            this.mostrarFormularioPaciente(paciente);
        } catch (error) {
            app.mostrarError('Error al cargar datos del paciente');
        }
    }

    static async verHistorial(id) {
        try {
            const [paciente, historial] = await Promise.all([
                API.getPaciente(id),
                API.getHistorialPaciente(id)
            ]);

            this.mostrarHistorialModal(paciente, historial);
        } catch (error) {
            app.mostrarError('Error al cargar historial del paciente');
        }
    }

    static mostrarHistorialModal(paciente, historial) {
        const modalContainer = document.getElementById('modalContainer');
        if (!modalContainer) return;

        modalContainer.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>
                        <i class="fas fa-history"></i>
                        Historial de Citas - ${paciente.nombre}
                    </h3>
                    <button class="modal-close" onclick="app.cerrarModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    <div class="patient-summary">
                        <p><strong>Email:</strong> ${paciente.email}</p>
                        <p><strong>Teléfono:</strong> ${paciente.telefono}</p>
                        <p><strong>Total de citas:</strong> ${historial.length}</p>
                    </div>
                    
                    ${historial.length > 0 ? `
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Hora</th>
                                    <th>Doctor</th>
                                    <th>Motivo</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${historial.map(cita => `
                                    <tr>
                                        <td>${cita.fecha}</td>
                                        <td>${cita.hora}</td>
                                        <td>${cita.doctorNombre || 'N/A'}</td>
                                        <td>${cita.motivo}</td>
                                        <td>
                                            <span class="status-badge status-${cita.estado}">
                                                ${cita.estado}
                                            </span>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    ` : `
                    <div class="empty-state">
                        <i class="fas fa-history"></i>
                        <p>No hay historial de citas</p>
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
}
window.PacientesUI = PacientesUI;
}