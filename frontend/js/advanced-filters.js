// Sistema de filtros avanzados para citas
const AdvancedFilters = {
    filters: {
        fecha: null,
        estado: null,
        doctorId: null,
        pacienteId: null,
        especialidad: null,
        rango_horas: null // Filtro por rango horario
    },

    // Aplicar filtro
    set(filterName, value) {
        if (filterName in this.filters) {
            this.filters[filterName] = value;
        }
    },

    // Obtener filtro
    get(filterName) {
        return this.filters[filterName];
    },

    // Limpiar filtros
    clear() {
        Object.keys(this.filters).forEach(key => {
            this.filters[key] = null;
        });
    },

    // Obtener filtros activos
    getActive() {
        return Object.entries(this.filters)
            .filter(([, value]) => value !== null)
            .reduce((acc, [key, value]) => {
                acc[key] = value;
                return acc;
            }, {});
    },

    // Aplicar filtros a un array de citas
    apply(citas, doctores = []) {
        let resultado = [...citas];

        // Filtro por fecha
        if (this.filters.fecha) {
            resultado = resultado.filter(c => c.fecha === this.filters.fecha);
        }

        // Filtro por estado
        if (this.filters.estado) {
            resultado = resultado.filter(c => c.estado === this.filters.estado);
        }

        // Filtro por doctor
        if (this.filters.doctorId) {
            resultado = resultado.filter(c => c.doctorId === this.filters.doctorId);
        }

        // Filtro por especialidad del doctor
        if (this.filters.especialidad && doctores.length > 0) {
            const doctoresEsp = doctores.filter(d => 
                d.especialidad.toLowerCase().includes(this.filters.especialidad.toLowerCase())
            );
            const idsEsp = new Set(doctoresEsp.map(d => d.id));
            resultado = resultado.filter(c => idsEsp.has(c.doctorId));
        }

        // Filtro por rango horario (ej: "09:00-12:00")
        if (this.filters.rango_horas) {
            const [horaInicio, horaFin] = this.filters.rango_horas.split('-');
            resultado = resultado.filter(c => {
                const hora = c.hora;
                return hora >= horaInicio && hora <= horaFin;
            });
        }

        return resultado;
    },

    // Obtener opciones de filtro (helper para UI)
    getFilterOptions(data, field) {
        const unique = new Set(data.map(item => item[field]));
        return Array.from(unique).sort();
    }
};

// Exponer globalmente
window.AdvancedFilters = AdvancedFilters;
